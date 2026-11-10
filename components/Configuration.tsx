"use client";

import React, { useState } from "react";
import AppLayout from "./AppLayout";
import {
  Bell,
  CheckCircle2,
  Database,
  Globe,
  Radio,
  Save,
  Server,
  Settings2,
  Shield,
  Sliders,
  SlidersHorizontal,
  Zap,
} from "lucide-react";

export default function Configuration() {
  const [warnThreshold, setWarnThreshold] = useState("60");
  const [critThreshold, setCritThreshold] = useState("80");
  const [imminentThreshold, setImminentThreshold] = useState("90");
  const [vibLimit, setVibLimit] = useState("4.2");
  const [pollInterval, setPollInterval] = useState("3000");
  const [enforceMakerChecker, setEnforceMakerChecker] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [iotHeartbeat, setIotHeartbeat] = useState(true);
  const [facilityName, setFacilityName] = useState("Rajasthan Ore Hub");

  const [notification, setNotification] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification("Configuration updated and propagated to condition monitoring edge gateway!");
    setTimeout(() => setNotification(""), 4000);
  };

  return (
    <AppLayout>
      <div className="dwms-page-container">
        {/* Header */}
        <div className="dwms-page-header">
          <div>
            <div className="dwms-breadcrumbs">Administration / Platform Settings</div>
            <h1 className="dwms-page-title">Configuration</h1>
            <p className="dwms-page-desc">
              Alarm thresholds, predictive wear engine parameters, IoT edge communication, and security rules
            </p>
          </div>

          <div className="dwms-header-actions">
            <button onClick={handleSave} className="dwms-btn dwms-btn-primary">
              <Save size={16} />
              <span>Save System Settings</span>
            </button>
          </div>
        </div>

        {notification && (
          <div className="dwms-alert-banner success mb-6">
            <CheckCircle2 size={18} />
            <span>{notification}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Wear & Vibration Alarm Thresholds */}
          <div className="dwms-panel">
            <div className="dwms-panel-header">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Sliders size={18} className="text-primary" />
                Condition Monitoring Alarm Thresholds
              </h2>
              <p className="text-xs text-muted">
                Define the trigger boundaries for automated condition alerts and health classification.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
              <div className="dwms-form-group">
                <label className="dwms-label">Warning Threshold (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="dwms-input"
                    value={warnThreshold}
                    onChange={(e) => setWarnThreshold(e.target.value)}
                    min="40"
                    max="75"
                  />
                  <span className="text-xs text-muted">%</span>
                </div>
                <span className="text-[11px] text-muted">Triggers yellow "Watchlist" alert</span>
              </div>

              <div className="dwms-form-group">
                <label className="dwms-label">Critical Threshold (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="dwms-input"
                    value={critThreshold}
                    onChange={(e) => setCritThreshold(e.target.value)}
                    min="70"
                    max="89"
                  />
                  <span className="text-xs text-muted">%</span>
                </div>
                <span className="text-[11px] text-danger">Requires planned outage schedule</span>
              </div>

              <div className="dwms-form-group">
                <label className="dwms-label">Failure Imminent (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="dwms-input"
                    value={imminentThreshold}
                    onChange={(e) => setImminentThreshold(e.target.value)}
                    min="85"
                    max="98"
                  />
                  <span className="text-xs text-muted">%</span>
                </div>
                <span className="text-[11px] text-danger font-semibold">Immediate shutdown protocol</span>
              </div>

              <div className="dwms-form-group">
                <label className="dwms-label">Vibration Alarm Velocity</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    className="dwms-input"
                    value={vibLimit}
                    onChange={(e) => setVibLimit(e.target.value)}
                  />
                  <span className="text-xs text-muted">mm/s</span>
                </div>
                <span className="text-[11px] text-muted">Tri-axial RMS impact limit</span>
              </div>
            </div>
          </div>

          {/* Section 2: Maker-Checker Governance & Workflow */}
          <div className="dwms-panel">
            <div className="dwms-panel-header">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Shield size={18} className="text-primary" />
                Operational Governance & Approvals
              </h2>
              <p className="text-xs text-muted">
                Control the maintenance authorization process between operators and managers.
              </p>
            </div>

            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-panel/70 border border-border">
                <div>
                  <div className="font-semibold text-sm">Enforce Maker–Checker Approval Gate</div>
                  <div className="text-xs text-muted">
                    When enabled, work orders created by Site Operators MUST be authorized by a Site Manager before dispatch.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enforceMakerChecker}
                  onChange={(e) => setEnforceMakerChecker(e.target.checked)}
                  className="size-5 rounded text-primary focus:ring-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-panel/70 border border-border">
                <div>
                  <div className="font-semibold text-sm">Automated Email Alerts on Critical Thresholds</div>
                  <div className="text-xs text-muted">
                    Broadcast immediate email alerts via Resend / SMTP when any liner reaches Critical status (wear &gt; 80%).
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="size-5 rounded text-primary focus:ring-primary cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Telemetry & Facility Infrastructure */}
          <div className="dwms-panel">
            <div className="dwms-panel-header">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Server size={18} className="text-primary" />
                IoT Gateway & Plant Telemetry Settings
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div className="dwms-form-group">
                <label className="dwms-label">Plant Facility Name</label>
                <input
                  type="text"
                  className="dwms-input"
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                />
              </div>

              <div className="dwms-form-group">
                <label className="dwms-label">Telemetry Polling Interval</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="dwms-input"
                    value={pollInterval}
                    onChange={(e) => setPollInterval(e.target.value)}
                    step="500"
                    min="1000"
                    max="30000"
                  />
                  <span className="text-xs text-muted">ms</span>
                </div>
              </div>

              <div className="dwms-form-group">
                <label className="dwms-label">Local Plant Timezone</label>
                <input
                  type="text"
                  className="dwms-input"
                  value="Asia/Kolkata (IST, UTC +05:30)"
                  readOnly
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

