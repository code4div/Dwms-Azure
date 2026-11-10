-- ==============================================================================
-- VANTEDGE TECHNOLOGIES · BEUMER Group
-- Digital Wear Monitoring System (DWMS)
-- Database Architecture Specification (PostgreSQL 15+)
-- Schema: dwms
-- Version: 1.1 (22 October 2026)
-- 35 Tables · 7 Views · Functions · Monthly Telemetry Partitions
-- ==============================================================================

CREATE SCHEMA IF NOT EXISTS dwms;
SET search_path TO dwms, public;

-- Enable extension for exclusion constraints (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ==============================================================================
-- DOMAIN 1: CUSTOMER & SECURITY
-- ==============================================================================

-- 1. Tenant
CREATE TABLE IF NOT EXISTS dwms.tenant (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PROVISIONING', 'ACTIVE', 'SUSPENDED', 'RETIRED')),
    default_timezone VARCHAR(100) NOT NULL DEFAULT 'UTC',
    unit_system VARCHAR(20) NOT NULL DEFAULT 'METRIC' CHECK (unit_system IN ('METRIC', 'IMPERIAL')),
    telemetry_retention_months INTEGER NOT NULL DEFAULT 12,
    record_retention_years INTEGER NOT NULL DEFAULT 5,
    kafka_topic VARCHAR(80) GENERATED ALWAYS AS ('dwms.telemetry.' || lower(code)) STORED,
    activated_at TIMESTAMPTZ,
    retired_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 2. App User
CREATE TABLE IF NOT EXISTS dwms.app_user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES dwms.tenant(id) ON DELETE CASCADE,
    display_name VARCHAR(200) NOT NULL,
    email VARCHAR(320) NOT NULL,
    phone_e164 VARCHAR(20),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('INVITED', 'ACTIVE', 'LOCKED', 'DISABLED', 'RETIRED')),
    last_login_at TIMESTAMPTZ,
    is_platform_admin BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_app_user_tenant_email UNIQUE (tenant_id, email)
);

-- 3. User Credential
CREATE TABLE IF NOT EXISTS dwms.user_credential (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES dwms.tenant(id) ON DELETE CASCADE,
    user_id UUID NOT NULL UNIQUE REFERENCES dwms.app_user(id) ON DELETE CASCADE,
    username VARCHAR(150) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    password_algorithm VARCHAR(50) NOT NULL DEFAULT 'ARGON2ID' CHECK (password_algorithm IN ('ARGON2ID', 'BCRYPT')),
    password_changed_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    failed_login_count INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    password_reset_required BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'LOCKED', 'DISABLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 4. Refresh Token
CREATE TABLE IF NOT EXISTS dwms.refresh_token (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES dwms.tenant(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES dwms.app_user(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    replaced_by_id UUID REFERENCES dwms.refresh_token(id),
    user_agent TEXT,
    client_ip INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 5. Role Sys Master
CREATE TABLE IF NOT EXISTS dwms.role_sys_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES dwms.tenant(id) ON DELETE CASCADE,
    role_code VARCHAR(50) NOT NULL,
    role_name VARCHAR(100) NOT NULL,
    role_description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    module_key VARCHAR(50) NOT NULL CHECK (module_key IN (
        'DASHBOARD', 'MY_SITE', 'REAL_TIME_WEAR_DATA', 'REPORTS', 'HISTORICAL_DATA',
        'CUSTOMERS', 'HIERARCHY_BUILDER', 'ASSETS_CATALOGUE', 'USERS_ROLES', 'CONFIGURATION'
    )),
    access_level VARCHAR(10) NOT NULL DEFAULT 'VIEW' CHECK (access_level IN ('NONE', 'VIEW', 'MODIFY')),
    created_by UUID REFERENCES dwms.app_user(id),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_role_sys_module UNIQUE (tenant_id, role_code, module_key)
);

-- ==============================================================================
-- DOMAIN 2: PLANT / ASSET MASTER
-- ==============================================================================

-- 6. Site
CREATE TABLE IF NOT EXISTS dwms.site (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES dwms.tenant(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    location TEXT,
    latitude NUMERIC(9,6) CHECK (latitude BETWEEN -90 AND 90),
    longitude NUMERIC(9,6) CHECK (longitude BETWEEN -180 AND 180),
    timezone VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'RETIRED')),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_site_tenant_code UNIQUE (tenant_id, code),
    CONSTRAINT uq_site_tenant_id UNIQUE (tenant_id, id)
);

-- 7. User Access (Granted roles per site)
CREATE TABLE IF NOT EXISTS dwms.user_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES dwms.tenant(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES dwms.app_user(id) ON DELETE CASCADE,
    site_id UUID REFERENCES dwms.site(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'REVOKED')),
    granted_by UUID REFERENCES dwms.app_user(id),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_access_site_role ON dwms.user_access (
    tenant_id, user_id, COALESCE(site_id, '00000000-0000-0000-0000-000000000000'::uuid), role
);

-- 8. Junction House
CREATE TABLE IF NOT EXISTS dwms.junction_house (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    site_id UUID NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'RETIRED')),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    FOREIGN KEY (tenant_id, site_id) REFERENCES dwms.site(tenant_id, id) ON DELETE CASCADE,
    CONSTRAINT uq_jh_site_code UNIQUE (site_id, code),
    CONSTRAINT uq_jh_tenant_site_id UNIQUE (tenant_id, site_id, id)
);

-- 9. Floor
CREATE TABLE IF NOT EXISTS dwms.floor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    site_id UUID NOT NULL,
    junction_house_id UUID NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    level_no INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'RETIRED')),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    FOREIGN KEY (tenant_id, site_id, junction_house_id) REFERENCES dwms.junction_house(tenant_id, site_id, id) ON DELETE CASCADE,
    CONSTRAINT uq_floor_jh_code UNIQUE (junction_house_id, code),
    CONSTRAINT uq_floor_tenant_site_id UNIQUE (tenant_id, site_id, id)
);

-- 10. Chute
CREATE TABLE IF NOT EXISTS dwms.chute (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    site_id UUID NOT NULL,
    floor_id UUID NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'RETIRED')),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    FOREIGN KEY (tenant_id, site_id, floor_id) REFERENCES dwms.floor(tenant_id, site_id, id) ON DELETE CASCADE,
    CONSTRAINT uq_chute_floor_code UNIQUE (floor_id, code),
    CONSTRAINT uq_chute_tenant_site_id UNIQUE (tenant_id, site_id, id)
);

-- 11. Liner Part (Catalogue)
CREATE TABLE IF NOT EXISTS dwms.liner_part (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES dwms.tenant(id) ON DELETE CASCADE,
    code VARCHAR(80) NOT NULL,
    name VARCHAR(200) NOT NULL,
    material_type VARCHAR(100) NOT NULL,
    thickness_mm NUMERIC(12,3) NOT NULL,
    minimum_thickness_mm NUMERIC(12,3) NOT NULL,
    width_mm NUMERIC(12,3),
    height_mm NUMERIC(12,3),
    weight_kg NUMERIC(12,3),
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'RETIRED')),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT chk_liner_part_thickness CHECK (minimum_thickness_mm < thickness_mm),
    CONSTRAINT uq_liner_part_code UNIQUE (tenant_id, code),
    CONSTRAINT uq_liner_part_id UNIQUE (tenant_id, id)
);

-- 12. Liner
CREATE TABLE IF NOT EXISTS dwms.liner (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    site_id UUID NOT NULL,
    chute_id UUID NOT NULL,
    liner_part_id UUID REFERENCES dwms.liner_part(id),
    code VARCHAR(80) NOT NULL,
    name VARCHAR(200) NOT NULL,
    position_code VARCHAR(80) NOT NULL,
    row_no INTEGER NOT NULL,
    column_no INTEGER NOT NULL,
    zone VARCHAR(100) NOT NULL,
    serial_no VARCHAR(120),
    install_date DATE NOT NULL DEFAULT CURRENT_DATE,
    removed_date DATE,
    original_thickness_mm NUMERIC(12,3) NOT NULL,
    minimum_thickness_mm NUMERIC(12,3) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PLANNED', 'ACTIVE', 'MONITORED', 'REMOVED', 'RETIRED')),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    FOREIGN KEY (tenant_id, site_id, chute_id) REFERENCES dwms.chute(tenant_id, site_id, id) ON DELETE CASCADE,
    CONSTRAINT uq_liner_site_code UNIQUE (site_id, code),
    CONSTRAINT uq_liner_tenant_site_id UNIQUE (tenant_id, site_id, id)
);

-- ==============================================================================
-- DOMAIN 3: SENSOR & TELEMETRY
-- ==============================================================================

-- 13. Sensor
CREATE TABLE IF NOT EXISTS dwms.sensor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),      
    tenant_id UUID NOT NULL REFERENCES dwms.tenant(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES dwms.site(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL,
    name VARCHAR(200) NOT NULL,
    device_uid VARCHAR(150) NOT NULL,
    make VARCHAR(100),
    model VARCHAR(100),
    serial_no VARCHAR(150),
    firmware_version VARCHAR(50),
    sensor_type VARCHAR(80) NOT NULL DEFAULT 'ULTRASONIC_THICKNESS' CHECK (sensor_type IN ('ULTRASONIC_THICKNESS', 'WEAR_PIN', 'VIBRATION', 'TEMPERATURE', 'COMBINED')),
    status VARCHAR(30) NOT NULL DEFAULT 'REGISTERED' CHECK (status IN ('REGISTERED', 'ACTIVE', 'INACTIVE', 'DECOMMISSIONED')),
    health_status VARCHAR(30) NOT NULL DEFAULT 'UNKNOWN' CHECK (health_status IN ('ONLINE', 'STALE', 'OFFLINE', 'FAULT', 'CALIBRATION_DUE', 'DECOMMISSIONED', 'UNKNOWN')),
    health_reason TEXT,
    health_updated_at TIMESTAMPTZ,
    last_seen_at TIMESTAMPTZ,
    battery_pct NUMERIC(6,3) CHECK (battery_pct BETWEEN 0 AND 100),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_sensor_tenant_code UNIQUE (tenant_id, code),
    CONSTRAINT uq_sensor_device_uid UNIQUE (tenant_id, device_uid),
    CONSTRAINT uq_sensor_tenant_site_id UNIQUE (tenant_id, site_id, id)
);

-- 14. Sensor Assignment
CREATE TABLE IF NOT EXISTS dwms.sensor_assignment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    site_id UUID NOT NULL,
    sensor_id UUID NOT NULL,
    liner_id UUID NOT NULL,
    measurement_role VARCHAR(30) NOT NULL DEFAULT 'PRIMARY' CHECK (measurement_role IN ('PRIMARY', 'SECONDARY', 'VIBRATION', 'TEMPERATURE')),
    assigned_from TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    assigned_to TIMESTAMPTZ,
    config_state VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (config_state IN ('ACTIVE', 'ENDED', 'RETIRED')),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    FOREIGN KEY (tenant_id, site_id, sensor_id) REFERENCES dwms.sensor(tenant_id, site_id, id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id, site_id, liner_id) REFERENCES dwms.liner(tenant_id, site_id, id) ON DELETE CASCADE,
    CONSTRAINT uq_sensor_assignment_id UNIQUE (tenant_id, site_id, id)
);

-- 15. Sensor Calibration
CREATE TABLE IF NOT EXISTS dwms.sensor_calibration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES dwms.tenant(id) ON DELETE CASCADE,
    site_id UUID REFERENCES dwms.site(id) ON DELETE CASCADE,
    sensor_id UUID NOT NULL REFERENCES dwms.sensor(id) ON DELETE CASCADE,
    calibration_date TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    valid_until TIMESTAMPTZ NOT NULL,
    calibration_type VARCHAR(80) NOT NULL DEFAULT 'FIELD' CHECK (calibration_type IN ('FACTORY', 'FIELD', 'ZERO_OFFSET', 'REFERENCE_BLOCK', 'OTHER')),
    reference_value NUMERIC(18,6),
    offset_value NUMERIC(18,6) NOT NULL DEFAULT 0,
    scale_factor NUMERIC(18,6) NOT NULL DEFAULT 1,
    status VARCHAR(30) NOT NULL DEFAULT 'VALID' CHECK (status IN ('VALID', 'FAILED', 'SUPERSEDED')),
    certificate_ref VARCHAR(150),
    performed_by UUID REFERENCES dwms.app_user(id),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 16. Sensor Reading (Telemetry - Partitioned by Range on reading_time)
CREATE TABLE IF NOT EXISTS dwms.sensor_reading (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES dwms.tenant(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES dwms.site(id) ON DELETE CASCADE,
    sensor_id UUID NOT NULL REFERENCES dwms.sensor(id) ON DELETE CASCADE,
    sensor_assignment_id UUID,
    liner_id UUID,
    reading_time TIMESTAMPTZ NOT NULL,
    ingest_time TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    raw_value NUMERIC(20,8),
    normalized_value NUMERIC(20,8),
    unit VARCHAR(30),
    thickness_mm NUMERIC(12,4),
    wear_pct NUMERIC(7,3),
    vibration_mm_s NUMERIC(12,4),
    temperature_c NUMERIC(12,4),
    battery_pct NUMERIC(6,3),
    signal_strength NUMERIC(12,4),
    quality_status VARCHAR(30) NOT NULL DEFAULT 'GOOD' CHECK (quality_status IN ('GOOD', 'SUSPECT', 'BAD', 'DUPLICATE', 'LATE', 'INTERPOLATED', 'QUARANTINED')),
    quality_reason VARCHAR(200),
    ingestion_id VARCHAR(150),
    kafka_partition INTEGER,
    kafka_offset BIGINT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    entry_source VARCHAR(20) NOT NULL DEFAULT 'SENSOR' CHECK (entry_source IN ('SENSOR', 'MANUAL')),
    entered_by UUID REFERENCES dwms.app_user(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    PRIMARY KEY (id, reading_time)
) PARTITION BY RANGE (reading_time);

-- Telemetry Monthly Partitions for 2026-2027 and Default Partition
CREATE TABLE IF NOT EXISTS dwms.sensor_reading_default PARTITION OF dwms.sensor_reading DEFAULT;

CREATE TABLE IF NOT EXISTS dwms.sensor_reading_2026_10 PARTITION OF dwms.sensor_reading
    FOR VALUES FROM ('2026-10-01 00:00:00+00') TO ('2026-11-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS dwms.sensor_reading_2026_11 PARTITION OF dwms.sensor_reading
    FOR VALUES FROM ('2026-11-01 00:00:00+00') TO ('2026-12-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS dwms.sensor_reading_2026_12 PARTITION OF dwms.sensor_reading
    FOR VALUES FROM ('2026-12-01 00:00:00+00') TO ('2027-01-01 00:00:00+00');

-- 17. Ingestion Quarantine
CREATE TABLE IF NOT EXISTS dwms.ingestion_quarantine (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES dwms.tenant(id) ON DELETE CASCADE,
    site_id UUID REFERENCES dwms.site(id) ON DELETE CASCADE,
    sensor_id UUID REFERENCES dwms.sensor(id) ON DELETE SET NULL,
    device_uid VARCHAR(150),
    reason VARCHAR(40) NOT NULL CHECK (reason IN ('UNKNOWN_SENSOR', 'INVALID_ASSIGNMENT', 'INVALID_HIERARCHY', 'DUPLICATE', 'INVALID_DATA')),
    reason_detail TEXT,
    reading_time TIMESTAMPTZ,
    received_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    ingestion_id VARCHAR(150),
    kafka_topic VARCHAR(150),
    kafka_partition INTEGER,
    kafka_offset BIGINT,
    raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'REPROCESSED', 'DISCARDED')),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES dwms.app_user(id),
    resolution_note TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- ==============================================================================
-- DOMAIN 4: WEAR MONITORING / AI
-- ==============================================================================

-- 18. Liner State
CREATE TABLE IF NOT EXISTS dwms.liner_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    site_id UUID NOT NULL,
    liner_id UUID NOT NULL UNIQUE,
    current_thickness_mm NUMERIC(12,3) NOT NULL,
    wear_percentage NUMERIC(7,3) NOT NULL,
    vibration_mm_s NUMERIC(12,4) DEFAULT 0,
    temperature_c NUMERIC(12,4) DEFAULT 25,
    remaining_life_days INTEGER,
    predicted_eol_date DATE,
    condition VARCHAR(30) NOT NULL DEFAULT 'HEALTHY' CHECK (condition IN ('UNKNOWN', 'HEALTHY', 'MODERATE', 'WARNING', 'CRITICAL', 'FAILED')),
    threshold_profile_id UUID,
    last_prediction_id UUID,
    last_reading_time TIMESTAMPTZ,
    last_inspection_at TIMESTAMPTZ,
    last_updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    FOREIGN KEY (tenant_id, site_id, liner_id) REFERENCES dwms.liner(tenant_id, site_id, id) ON DELETE CASCADE
);

-- 19. Wear Prediction
CREATE TABLE IF NOT EXISTS dwms.wear_prediction (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    site_id UUID NOT NULL,
    liner_id UUID NOT NULL,
    prediction_config_id UUID,
    model_name VARCHAR(150) NOT NULL DEFAULT 'Wear-XGB',
    model_version VARCHAR(100) NOT NULL DEFAULT '1.0.0',
    prediction_time TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    status VARCHAR(30) NOT NULL DEFAULT 'VALID' CHECK (status IN ('VALID', 'INSUFFICIENT_DATA', 'LOW_CONFIDENCE', 'FAILED', 'SUPERSEDED')),
    input_point_count INTEGER NOT NULL DEFAULT 0,
    history_window_days INTEGER NOT NULL DEFAULT 90,
    thickness_at_prediction_mm NUMERIC(12,3) NOT NULL,
    degradation_rate_mm_day NUMERIC(12,5) NOT NULL,
    remaining_life_days INTEGER NOT NULL,
    predicted_eol_date DATE NOT NULL,
    p50_eol_date DATE,
    p90_eol_date DATE,
    confidence_score NUMERIC(7,4) NOT NULL DEFAULT 0.9500,
    prediction_horizon_days INTEGER NOT NULL DEFAULT 180,
    input_features JSONB NOT NULL DEFAULT '{}'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    FOREIGN KEY (tenant_id, site_id, liner_id) REFERENCES dwms.liner(tenant_id, site_id, id) ON DELETE CASCADE
);

-- ==============================================================================
-- DOMAIN 5: CONFIGURATION
-- ==============================================================================

-- 20. Configuration
CREATE TABLE IF NOT EXISTS dwms.configuration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES dwms.tenant(id) ON DELETE CASCADE,
    site_id UUID REFERENCES dwms.site(id) ON DELETE CASCADE,
    config_type VARCHAR(50) NOT NULL CHECK (config_type IN ('TENANT', 'SITE', 'SENSOR', 'PREDICTION', 'NOTIFICATION', 'DASHBOARD', 'OTHER')),
    scope_type VARCHAR(30) NOT NULL CHECK (scope_type IN ('TENANT', 'SITE', 'JUNCTION_HOUSE', 'FLOOR', 'CHUTE', 'LINER', 'SENSOR')),
    scope_id UUID NOT NULL,
    name VARCHAR(150) NOT NULL,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    version INTEGER NOT NULL DEFAULT 1,
    effective_from TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    effective_to TIMESTAMPTZ,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    change_reason TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 21. Threshold Profile
CREATE TABLE IF NOT EXISTS dwms.threshold_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES dwms.tenant(id) ON DELETE CASCADE,
    site_id UUID REFERENCES dwms.site(id) ON DELETE CASCADE,
    scope_type VARCHAR(30) NOT NULL CHECK (scope_type IN ('TENANT', 'SITE', 'JUNCTION_HOUSE', 'FLOOR', 'CHUTE', 'LINER', 'SENSOR')),
    scope_id UUID NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'INACTIVE', 'EXPIRED')),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    valid_from TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    valid_to TIMESTAMPTZ,
    change_reason TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 22. Threshold Metric
CREATE TABLE IF NOT EXISTS dwms.threshold_metric (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES dwms.tenant(id) ON DELETE CASCADE,
    threshold_profile_id UUID NOT NULL REFERENCES dwms.threshold_profile(id) ON DELETE CASCADE,
    metric VARCHAR(40) NOT NULL CHECK (metric IN ('WEAR_PCT', 'THICKNESS_MM', 'VIBRATION_MM_S', 'TEMPERATURE_C', 'BATTERY_PCT', 'REMAINING_LIFE_DAYS', 'SENSOR_STALENESS_MIN')),
    direction VARCHAR(20) NOT NULL DEFAULT 'HIGHER_IS_WORSE' CHECK (direction IN ('HIGHER_IS_WORSE', 'LOWER_IS_WORSE')),
    moderate_from NUMERIC(14,4) NOT NULL,
    warning_from NUMERIC(14,4) NOT NULL,
    critical_from NUMERIC(14,4) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 23. Alert Rule
CREATE TABLE IF NOT EXISTS dwms.alert_rule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES dwms.tenant(id) ON DELETE CASCADE,
    site_id UUID REFERENCES dwms.site(id) ON DELETE CASCADE,
    scope_type VARCHAR(30) NOT NULL DEFAULT 'TENANT' CHECK (scope_type IN ('TENANT', 'SITE', 'JUNCTION_HOUSE', 'FLOOR', 'CHUTE', 'LINER', 'SENSOR')),
    scope_id UUID NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    rule_type VARCHAR(50) NOT NULL DEFAULT 'THRESHOLD' CHECK (rule_type IN ('THRESHOLD', 'RATE_OF_CHANGE', 'SENSOR_HEALTH', 'PREDICTION', 'COMPOSITE')),
    condition JSONB NOT NULL DEFAULT '{"all": []}'::jsonb,
    severity VARCHAR(30) NOT NULL DEFAULT 'MEDIUM' CHECK (severity IN ('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    dedupe_window_sec INTEGER NOT NULL DEFAULT 300,
    cooldown_sec INTEGER NOT NULL DEFAULT 900,
    requires_ack BOOLEAN NOT NULL DEFAULT TRUE,
    auto_close_condition JSONB,
    notification_policy_id UUID REFERENCES dwms.configuration(id),
    version INTEGER NOT NULL DEFAULT 1,
    change_reason TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- ==============================================================================
-- DOMAIN 6: OPERATIONS
-- ==============================================================================

-- 24. Work Item (Maker-Checker approved tasks)
CREATE TABLE IF NOT EXISTS dwms.work_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES dwms.tenant(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES dwms.site(id) ON DELETE CASCADE,
    junction_house_id UUID REFERENCES dwms.junction_house(id),
    floor_id UUID REFERENCES dwms.floor(id),
    chute_id UUID REFERENCES dwms.chute(id),
    liner_id UUID REFERENCES dwms.liner(id),
    sensor_id UUID REFERENCES dwms.sensor(id),
    work_type VARCHAR(40) NOT NULL DEFAULT 'REQUEST' CHECK (work_type IN ('REQUEST', 'MAINTENANCE')),
    request_type VARCHAR(40) NOT NULL DEFAULT 'LINER_REPLACEMENT' CHECK (request_type IN ('LINER_REPLACEMENT', 'INSPECTION', 'SHUTDOWN', 'THRESHOLD_CHANGE', 'SENSOR_SERVICE', 'REPAIR', 'OTHER')),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority VARCHAR(30) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED')),
    approval_status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (approval_status IN ('NOT_REQUIRED', 'PENDING', 'APPROVED', 'REJECTED')),
    requested_by UUID REFERENCES dwms.app_user(id),
    approved_by UUID REFERENCES dwms.app_user(id),
    approved_at TIMESTAMPTZ,
    decision_comment TEXT,
    assigned_to UUID REFERENCES dwms.app_user(id),
    alert_id UUID,
    shutdown_window_id UUID,
    work_order_no VARCHAR(80),
    scheduled_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    downtime_hours NUMERIC(10,2) DEFAULT 0,
    row_version INTEGER NOT NULL DEFAULT 1,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 25. Inspection (Ground truth for predictions)
CREATE TABLE IF NOT EXISTS dwms.inspection (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES dwms.tenant(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES dwms.site(id) ON DELETE CASCADE,
    chute_id UUID REFERENCES dwms.chute(id),
    liner_id UUID REFERENCES dwms.liner(id),
    work_item_id UUID REFERENCES dwms.work_item(id),
    inspection_type VARCHAR(30) NOT NULL DEFAULT 'UT_GAUGE' CHECK (inspection_type IN ('UT_GAUGE', 'VISUAL', 'LASER_SCAN', 'WEAR_PIN')),
    inspected_by UUID REFERENCES dwms.app_user(id),
    inspection_date TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    measured_thickness_mm NUMERIC(12,3) NOT NULL,
    measured_wear_pct NUMERIC(7,3) NOT NULL,
    condition VARCHAR(30) NOT NULL DEFAULT 'HEALTHY' CHECK (condition IN ('HEALTHY', 'MODERATE', 'WARNING', 'CRITICAL', 'FAILED')),
    remarks TEXT,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 26. Shutdown Window
CREATE TABLE IF NOT EXISTS dwms.shutdown_window (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES dwms.tenant(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES dwms.site(id) ON DELETE CASCADE,
    junction_house_id UUID REFERENCES dwms.junction_house(id),
    floor_id UUID REFERENCES dwms.floor(id),
    chute_id UUID REFERENCES dwms.chute(id),
    liner_id UUID REFERENCES dwms.liner(id),
    work_item_id UUID REFERENCES dwms.work_item(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    status VARCHAR(30) NOT NULL DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'APPROVED', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
    approved_by UUID REFERENCES dwms.app_user(id),
    approved_at TIMESTAMPTZ,
    description TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 27. Site Activity
CREATE TABLE IF NOT EXISTS dwms.site_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES dwms.tenant(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES dwms.site(id) ON DELETE CASCADE,
    junction_house_id UUID REFERENCES dwms.junction_house(id),
    floor_id UUID REFERENCES dwms.floor(id),
    chute_id UUID REFERENCES dwms.chute(id),
    liner_id UUID REFERENCES dwms.liner(id),
    sensor_id UUID REFERENCES dwms.sensor(id),
    activity_type VARCHAR(80) NOT NULL DEFAULT 'MAINTENANCE' CHECK (activity_type IN ('INSPECTION', 'MAINTENANCE', 'CALIBRATION', 'INSTALLATION', 'REPLACEMENT', 'SENSOR_SERVICE', 'AUDIT', 'OTHER')),
    status VARCHAR(30) NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    activity_time TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    performed_by UUID REFERENCES dwms.app_user(id),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 28. Incident
CREATE TABLE IF NOT EXISTS dwms.incident (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES dwms.tenant(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES dwms.site(id) ON DELETE CASCADE,
    junction_house_id UUID REFERENCES dwms.junction_house(id),
    floor_id UUID REFERENCES dwms.floor(id),
    chute_id UUID REFERENCES dwms.chute(id),
    liner_id UUID REFERENCES dwms.liner(id),
    sensor_id UUID REFERENCES dwms.sensor(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    severity VARCHAR(30) NOT NULL DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED')),
    reported_by UUID REFERENCES dwms.app_user(id),
    reported_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    resolved_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- ==============================================================================
-- DOMAIN 7: ALERTING
-- ==============================================================================

-- 29. Alert
CREATE TABLE IF NOT EXISTS dwms.alert (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES dwms.tenant(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES dwms.site(id) ON DELETE CASCADE,
    liner_id UUID REFERENCES dwms.liner(id),
    sensor_id UUID REFERENCES dwms.sensor(id),
    alert_rule_id UUID REFERENCES dwms.alert_rule(id),
    alert_rule_version INTEGER NOT NULL DEFAULT 1,
    threshold_profile_id UUID REFERENCES dwms.threshold_profile(id),
    source VARCHAR(30) NOT NULL DEFAULT 'THRESHOLD' CHECK (source IN ('THRESHOLD', 'RULE', 'SENSOR_HEALTH', 'PREDICTION', 'MANUAL')),
    severity VARCHAR(30) NOT NULL DEFAULT 'MEDIUM' CHECK (severity IN ('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    dedupe_key VARCHAR(250) NOT NULL,
    occurrence_count INTEGER NOT NULL DEFAULT 1,
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'ACKNOWLEDGED', 'ESCALATED', 'RESOLVED', 'CLOSED')),
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID REFERENCES dwms.app_user(id),
    escalation_level SMALLINT NOT NULL DEFAULT 0,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES dwms.app_user(id),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 30. Notification
CREATE TABLE IF NOT EXISTS dwms.notification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES dwms.tenant(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES dwms.site(id) ON DELETE CASCADE,
    alert_id UUID NOT NULL REFERENCES dwms.alert(id) ON DELETE CASCADE,
    recipient_type VARCHAR(40) NOT NULL DEFAULT 'ROLE' CHECK (recipient_type IN ('ROLE', 'USER', 'WEBHOOK', 'SCADA')),
    recipient_id UUID REFERENCES dwms.app_user(id),
    recipient_address VARCHAR(500) NOT NULL,
    channel VARCHAR(30) NOT NULL DEFAULT 'EMAIL' CHECK (channel IN ('IN_APP', 'EMAIL', 'SMS', 'PUSH', 'WEBHOOK', 'OTHER')),
    escalation_level SMALLINT NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'CANCELLED')),
    attempts SMALLINT NOT NULL DEFAULT 0,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    failure_reason TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- ==============================================================================
-- DOMAIN 8: INVENTORY
-- ==============================================================================

-- 31. Inventory Item
CREATE TABLE IF NOT EXISTS dwms.inventory_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES dwms.tenant(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES dwms.site(id) ON DELETE CASCADE,
    liner_part_id UUID REFERENCES dwms.liner_part(id),
    code VARCHAR(100) NOT NULL,
    name VARCHAR(200) NOT NULL,
    current_quantity NUMERIC(18,3) NOT NULL DEFAULT 0 CHECK (current_quantity >= 0),
    reorder_level NUMERIC(18,3) NOT NULL DEFAULT 5,
    unit VARCHAR(30) NOT NULL DEFAULT 'PCS',
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'RETIRED')),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_inventory_item_code UNIQUE (site_id, code)
);

-- 32. Inventory Transaction
CREATE TABLE IF NOT EXISTS dwms.inventory_transaction (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES dwms.tenant(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES dwms.site(id) ON DELETE CASCADE,
    inventory_item_id UUID NOT NULL REFERENCES dwms.inventory_item(id) ON DELETE CASCADE,
    transaction_type VARCHAR(40) NOT NULL CHECK (transaction_type IN ('RECEIPT', 'ISSUE', 'ADJUSTMENT', 'TRANSFER', 'RETURN', 'CONSUMPTION')),
    reference_type VARCHAR(80) CHECK (reference_type IN ('WORK_ITEM', 'PURCHASE_ORDER', 'TRANSFER', 'OTHER')),
    reference_id UUID,
    quantity NUMERIC(18,3) NOT NULL CHECK (quantity <> 0),
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    performed_by UUID REFERENCES dwms.app_user(id),
    remarks TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- ==============================================================================
-- DOMAIN 9: GOVERNANCE
-- ==============================================================================

-- 33. Audit Log
CREATE TABLE IF NOT EXISTS dwms.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES dwms.tenant(id) ON DELETE SET NULL,
    site_id UUID REFERENCES dwms.site(id) ON DELETE SET NULL,
    user_id UUID REFERENCES dwms.app_user(id) ON DELETE SET NULL,
    actor_role VARCHAR(50),
    entity_name VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGIN_FAILED', 'PASSWORD_CHANGE', 'TOKEN_INVALID')),
    old_value JSONB,
    new_value JSONB,
    reason TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 34. Request Log
CREATE TABLE IF NOT EXISTS dwms.request_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES dwms.tenant(id) ON DELETE SET NULL,
    user_id UUID REFERENCES dwms.app_user(id) ON DELETE SET NULL,
    actor_identifier TEXT,
    event_type VARCHAR(20) NOT NULL DEFAULT 'API_CALL' CHECK (event_type IN ('API_CALL', 'AUTH_FAILURE', 'AUTH_SUCCESS', 'ERROR')),
    method VARCHAR(10) NOT NULL,
    url TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    request_headers JSONB NOT NULL DEFAULT '{}'::jsonb,
    request_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    response_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    response_headers JSONB NOT NULL DEFAULT '{}'::jsonb,
    error_message TEXT,
    ip_address INET,
    user_agent TEXT,
    duration_ms INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- ==============================================================================
-- DOMAIN 10: DOCUMENTS
-- ==============================================================================

-- 35. Document (Polymorphic attachments backed by object storage)
CREATE TABLE IF NOT EXISTS dwms.document (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES dwms.tenant(id) ON DELETE CASCADE,
    site_id UUID REFERENCES dwms.site(id) ON DELETE CASCADE,
    entity_type VARCHAR(40) NOT NULL CHECK (entity_type IN ('WORK_ITEM', 'INSPECTION', 'INCIDENT', 'SENSOR_CALIBRATION', 'LINER', 'ALERT', 'SITE_ACTIVITY')),
    entity_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(150) NOT NULL,
    size_bytes BIGINT NOT NULL,
    storage_bucket VARCHAR(255) NOT NULL,
    storage_key TEXT NOT NULL,
    checksum_sha256 VARCHAR(64),
    uploaded_by UUID REFERENCES dwms.app_user(id),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_document_storage UNIQUE (storage_bucket, storage_key)
);

-- ==============================================================================
-- CORE TRIGGER FUNCTIONS
-- ==============================================================================

-- Trigger: update updated_at timestamp
CREATE OR REPLACE FUNCTION dwms.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = clock_timestamp();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: bump work_item row_version
CREATE OR REPLACE FUNCTION dwms.bump_row_version()
RETURNS TRIGGER AS $$
BEGIN
    NEW.row_version = OLD.row_version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: maintain inventory on-hand quantity
CREATE OR REPLACE FUNCTION dwms.apply_inventory_transaction()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE dwms.inventory_item
    SET current_quantity = current_quantity + NEW.quantity,
        updated_at = clock_timestamp()
    WHERE id = NEW.inventory_item_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Partition creation helper function
CREATE OR REPLACE FUNCTION dwms.ensure_sensor_reading_partitions(months_back INTEGER DEFAULT 1, months_ahead INTEGER DEFAULT 6)
RETURNS VOID AS $$
DECLARE
    cur_date DATE := date_trunc('month', CURRENT_DATE);
    target_start DATE;
    target_end DATE;
    tbl_name TEXT;
    sql TEXT;
BEGIN
    FOR i IN -months_back..months_ahead LOOP
        target_start := cur_date + (i || ' month')::interval;
        target_end := target_start + '1 month'::interval;
        tbl_name := 'sensor_reading_' || to_char(target_start, 'YYYY_MM');
        
        sql := format(
            'CREATE TABLE IF NOT EXISTS dwms.%I PARTITION OF dwms.sensor_reading FOR VALUES FROM (%L) TO (%L);',
            tbl_name, target_start, target_end
        );
        EXECUTE sql;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach updated_at triggers
DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'tenant', 'app_user', 'user_credential', 'role_sys_master', 'site', 'user_access',
        'junction_house', 'floor', 'chute', 'liner_part', 'liner', 'sensor', 'sensor_assignment',
        'ingestion_quarantine', 'liner_state', 'configuration', 'threshold_profile', 'threshold_metric',
        'alert_rule', 'work_item', 'inspection', 'shutdown_window', 'site_activity', 'incident',
        'alert', 'notification', 'inventory_item', 'document'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON dwms.%I;', t, t);
        EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON dwms.%I FOR EACH ROW EXECUTE FUNCTION dwms.set_updated_at();', t, t);
    END LOOP;
END;
$$;

-- Attach inventory trigger
DROP TRIGGER IF EXISTS trg_inventory_transaction_apply ON dwms.inventory_transaction;
CREATE TRIGGER trg_inventory_transaction_apply
AFTER INSERT ON dwms.inventory_transaction
FOR EACH ROW EXECUTE FUNCTION dwms.apply_inventory_transaction();

-- Attach work_item row_version trigger
DROP TRIGGER IF EXISTS trg_work_item_bump_version ON dwms.work_item;
CREATE TRIGGER trg_work_item_bump_version
BEFORE UPDATE ON dwms.work_item
FOR EACH ROW EXECUTE FUNCTION dwms.bump_row_version();

-- ==============================================================================
-- 7 VIEWS (as specified in Section 6)
-- ==============================================================================

-- 1. v_hierarchy_path: Site > Junction House > Floor > Chute > Liner codes & positions
CREATE OR REPLACE VIEW dwms.v_hierarchy_path AS
SELECT
    l.id AS liner_id,
    l.tenant_id,
    l.site_id,
    s.code AS site_code,
    s.name AS site_name,
    jh.id AS junction_house_id,
    jh.code AS junction_house_code,
    jh.name AS junction_house_name,
    f.id AS floor_id,
    f.code AS floor_code,
    f.name AS floor_name,
    c.id AS chute_id,
    c.code AS chute_code,
    c.name AS chute_name,
    l.code AS liner_code,
    l.position_code,
    l.row_no,
    l.column_no,
    l.zone,
    lp.id AS liner_part_id,
    lp.code AS part_code,
    lp.name AS part_name,
    lp.material_type,
    lp.thickness_mm AS nominal_thickness_mm,
    l.original_thickness_mm,
    l.minimum_thickness_mm,
    l.status AS liner_status
FROM dwms.liner l
JOIN dwms.chute c ON l.chute_id = c.id
JOIN dwms.floor f ON c.floor_id = f.id
JOIN dwms.junction_house jh ON f.junction_house_id = jh.id
JOIN dwms.site s ON jh.site_id = s.id
LEFT JOIN dwms.liner_part lp ON l.liner_part_id = lp.id;

-- 2. v_liner_live: Live liner condition, path, wear, thickness, and primary sensor
CREATE OR REPLACE VIEW dwms.v_liner_live AS
SELECT
    h.*,
    ls.current_thickness_mm,
    ls.wear_percentage,
    ls.vibration_mm_s,
    ls.temperature_c,
    ls.remaining_life_days,
    ls.predicted_eol_date,
    ls.condition,
    ls.last_reading_time,
    ls.last_inspection_at,
    ls.last_updated_at AS state_updated_at,
    sa.sensor_id AS primary_sensor_id,
    sen.code AS sensor_code,
    sen.health_status AS sensor_health_status,
    sen.battery_pct AS sensor_battery_pct
FROM dwms.v_hierarchy_path h
LEFT JOIN dwms.liner_state ls ON h.liner_id = ls.liner_id
LEFT JOIN dwms.sensor_assignment sa ON h.liner_id = sa.liner_id AND sa.config_state = 'ACTIVE' AND sa.measurement_role = 'PRIMARY'
LEFT JOIN dwms.sensor sen ON sa.sensor_id = sen.id
WHERE h.liner_status IN ('ACTIVE', 'MONITORED', 'PLANNED');

-- 3. v_alert_inbox: Open, acknowledged and escalated alerts with rule name
CREATE OR REPLACE VIEW dwms.v_alert_inbox AS
SELECT
    a.id AS alert_id,
    a.tenant_id,
    a.site_id,
    s.code AS site_code,
    s.name AS site_name,
    a.liner_id,
    l.code AS liner_code,
    l.position_code,
    c.code AS chute_code,
    a.sensor_id,
    sen.code AS sensor_code,
    a.alert_rule_id,
    ar.name AS rule_name,
    ar.requires_ack,
    a.source,
    a.severity,
    a.title,
    a.description,
    a.dedupe_key,
    a.occurrence_count,
    a.triggered_at,
    a.last_seen_at,
    a.status,
    a.escalation_level,
    a.acknowledged_at,
    a.acknowledged_by,
    u_ack.display_name AS acknowledged_by_name,
    a.metadata
FROM dwms.alert a
JOIN dwms.site s ON a.site_id = s.id
LEFT JOIN dwms.liner l ON a.liner_id = l.id
LEFT JOIN dwms.chute c ON l.chute_id = c.id
LEFT JOIN dwms.sensor sen ON a.sensor_id = sen.id
LEFT JOIN dwms.alert_rule ar ON a.alert_rule_id = ar.id
LEFT JOIN dwms.app_user u_ack ON a.acknowledged_by = u_ack.id
WHERE a.status IN ('OPEN', 'ACKNOWLEDGED', 'ESCALATED');

-- 4. v_approval_queue: Work items pending approval (checker screen)
CREATE OR REPLACE VIEW dwms.v_approval_queue AS
SELECT
    w.id AS work_item_id,
    w.tenant_id,
    w.site_id,
    s.code AS site_code,
    s.name AS site_name,
    w.work_type,
    w.request_type,
    w.title,
    w.description,
    w.priority,
    w.status,
    w.approval_status,
    w.requested_by,
    u_req.display_name AS requested_by_name,
    u_req.email AS requested_by_email,
    w.assigned_to,
    u_ass.display_name AS assigned_to_name,
    w.chute_id,
    c.code AS chute_code,
    w.liner_id,
    l.code AS liner_code,
    l.position_code,
    w.work_order_no,
    w.scheduled_at,
    w.created_at
FROM dwms.work_item w
JOIN dwms.site s ON w.site_id = s.id
LEFT JOIN dwms.app_user u_req ON w.requested_by = u_req.id
LEFT JOIN dwms.app_user u_ass ON w.assigned_to = u_ass.id
LEFT JOIN dwms.chute c ON w.chute_id = c.id
LEFT JOIN dwms.liner l ON w.liner_id = l.id
WHERE w.approval_status = 'PENDING';

-- 5. v_prediction_accuracy: Ground truth inspection vs model wear prediction
CREATE OR REPLACE VIEW dwms.v_prediction_accuracy AS
SELECT
    i.id AS inspection_id,
    i.tenant_id,
    i.site_id,
    i.liner_id,
    l.code AS liner_code,
    i.inspection_date,
    i.inspection_type,
    i.measured_thickness_mm,
    i.measured_wear_pct,
    p.id AS prediction_id,
    p.prediction_time,
    p.model_name,
    p.model_version,
    p.thickness_at_prediction_mm,
    p.confidence_score,
    (i.measured_thickness_mm - p.thickness_at_prediction_mm) AS error_mm,
    ROUND(ABS(i.measured_thickness_mm - p.thickness_at_prediction_mm) / NULLIF(i.measured_thickness_mm, 0) * 100, 2) AS error_pct
FROM dwms.inspection i
JOIN dwms.liner l ON i.liner_id = l.id
LEFT JOIN LATERAL (
    SELECT * FROM dwms.wear_prediction wp
    WHERE wp.liner_id = i.liner_id
      AND wp.prediction_time <= i.inspection_date
      AND wp.status = 'VALID'
    ORDER BY wp.prediction_time DESC
    LIMIT 1
) p ON TRUE;

-- 6. v_sensor_health: Derived sensor health and telemetry freshness
CREATE OR REPLACE VIEW dwms.v_sensor_health AS
SELECT
    sen.id AS sensor_id,
    sen.tenant_id,
    sen.site_id,
    s.code AS site_code,
    s.name AS site_name,
    sen.code AS sensor_code,
    sen.device_uid,
    sen.sensor_type,
    sen.status AS lifecycle_status,
    sen.health_status,
    sen.last_seen_at,
    sen.battery_pct,
    EXTRACT(EPOCH FROM (clock_timestamp() - sen.last_seen_at)) / 60.0 AS minutes_since_seen,
    sa.liner_id,
    l.code AS liner_code,
    sc.valid_until AS calibration_valid_until,
    CASE
        WHEN sc.valid_until IS NOT NULL AND sc.valid_until < clock_timestamp() THEN TRUE
        ELSE FALSE
    END AS is_calibration_expired
FROM dwms.sensor sen
JOIN dwms.site s ON sen.site_id = s.id
LEFT JOIN dwms.sensor_assignment sa ON sen.id = sa.sensor_id AND sa.config_state = 'ACTIVE'
LEFT JOIN dwms.liner l ON sa.liner_id = l.id
LEFT JOIN LATERAL (
    SELECT valid_until FROM dwms.sensor_calibration c
    WHERE c.sensor_id = sen.id AND c.status = 'VALID'
    ORDER BY c.calibration_date DESC
    LIMIT 1
) sc ON TRUE;

-- 7. v_site_dashboard: High-level site KPIs (active liners, alerts, approvals)
CREATE OR REPLACE VIEW dwms.v_site_dashboard AS
SELECT
    s.id AS site_id,
    s.tenant_id,
    s.code AS site_code,
    s.name AS site_name,
    COUNT(DISTINCT l.id) AS total_liners,
    COUNT(DISTINCT CASE WHEN ls.condition IN ('CRITICAL', 'FAILED') THEN l.id END) AS critical_liners,
    COUNT(DISTINCT CASE WHEN ls.condition = 'WARNING' THEN l.id END) AS warning_liners,
    COUNT(DISTINCT CASE WHEN ls.condition = 'HEALTHY' THEN l.id END) AS healthy_liners,
    COUNT(DISTINCT CASE WHEN sen.health_status IN ('OFFLINE', 'FAULT', 'STALE') THEN sen.id END) AS unhealthy_sensors,
    COUNT(DISTINCT CASE WHEN a.status IN ('OPEN', 'ESCALATED') THEN a.id END) AS open_alerts,
    COUNT(DISTINCT CASE WHEN w.approval_status = 'PENDING' THEN w.id END) AS pending_approvals,
    COUNT(DISTINCT CASE WHEN q.status = 'OPEN' THEN q.id END) AS open_quarantine_items
FROM dwms.site s
LEFT JOIN dwms.liner l ON s.id = l.site_id AND l.status IN ('ACTIVE', 'MONITORED')
LEFT JOIN dwms.liner_state ls ON l.id = ls.liner_id
LEFT JOIN dwms.sensor sen ON s.id = sen.site_id AND sen.status = 'ACTIVE'
LEFT JOIN dwms.alert a ON s.id = a.site_id AND a.status IN ('OPEN', 'ESCALATED')
LEFT JOIN dwms.work_item w ON s.id = w.site_id AND w.approval_status = 'PENDING'
LEFT JOIN dwms.ingestion_quarantine q ON s.id = q.site_id AND q.status = 'OPEN'
GROUP BY s.id, s.tenant_id, s.code, s.name;
