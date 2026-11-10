"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "./AppLayout";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Filter,
  Info,
  Pause,
  Play,
  RefreshCw,
  Search,
  TrendingDown,
  Waves,
  Zap,
} from "lucide-react";

export interface SensorRecord {
  linerId: string;
  sensorId: string;
  chuteId: string;
  wear: number;
  thickness: number;
  vibration: number;
  rate: number;
  rulDays: number;
  status: "Failure Imminent" | "Critical" | "Action Required" | "Monitor" | "Healthy";
  lastPing: string;
}

const INITIAL_SENSORS: SensorRecord[] = [
  {
    linerId: "CH-003·2J",
    sensorId: "CW-003-2J-1",
    chuteId: "CH-003",
    wear: 91.6,
    thickness: 1.3,
    vibration: 5.30,
    rate: 0.49,
    rulDays: 17,
    status: "Failure Imminent",
    lastPing: "Just now",
  },
  {
    linerId: "CH-001·2B",
    sensorId: "CW-001-2B-1",
    chuteId: "CH-001",
    wear: 93.4,
    thickness: 1.1,
    vibration: 5.42,
    rate: 0.52,
    rulDays: 15,
    status: "Failure Imminent",
    lastPing: "Just now",
  },
  {
    linerId: "CH-002·4B",
    sensorId: "CW-002-4B-2",
    chuteId: "CH-002",
    wear: 88.1,
    thickness: 2.4,
    vibration: 5.14,
    rate: 0.80,
    rulDays: 15,
    status: "Critical",
    lastPing: "Just now",
  },
  {
    linerId: "CH-001·1B",
    sensorId: "CW-001-1B-1",
    chuteId: "CH-001",
    wear: 81.2,
    thickness: 4.7,
    vibration: 4.71,
    rate: 0.14,
    rulDays: 134,
    status: "Critical",
    lastPing: "Just now",
  },
  {
    linerId: "CH-003·1A",
    sensorId: "CW-003-1A-1",
    chuteId: "CH-003",
    wear: 79.8,
    thickness: 5.1,
    vibration: 4.88,
    rate: 0.38,
    rulDays: 52,
    status: "Critical",
    lastPing: "Just now",
  },
  {
    linerId: "CH-005·3F",
    sensorId: "CW-005-3F-1",
    chuteId: "CH-005",
    wear: 77.5,
    thickness: 4.5,
    vibration: 5.04,
    rate: 0.33,
    rulDays: 68,
    status: "Critical",
    lastPing: "Just now",
  },
  {
    linerId: "CH-003·4B",
    sensorId: "CW-003-4B-1",
    chuteId: "CH-003",
    wear: 56.9,
    thickness: 8.6,
    vibration: 4.52,
    rate: 0.80,
    rulDays: 54,
    status: "Action Required",
    lastPing: "Just now",
  },
  {
    linerId: "CH-001·1G",
    sensorId: "CW-001-1G-1",
    chuteId: "CH-001",
    wear: 64.7,
    thickness: 7.1,
    vibration: 4.25,
    rate: 0.28,
    rulDays: 48,
    status: "Action Required",
    lastPing: "Just now",
  },
  {
    linerId: "CH-005·3E",
    sensorId: "CW-005-3E-1",
    chuteId: "CH-005",
    wear: 64.3,
    thickness: 7.2,
    vibration: 4.31,
    rate: 0.29,
    rulDays: 53,
    status: "Action Required",
    lastPing: "Just now",
  },
  {
    linerId: "CH-003·3D",
    sensorId: "CW-003-3D-1",
    chuteId: "CH-003",
    wear: 40.0,
    thickness: 12.0,
    vibration: 4.47,
    rate: 0.33,
    rulDays: 182,
    status: "Monitor",
    lastPing: "Just now",
  },
  {
    linerId: "CH-003·2B",
    sensorId: "CW-003-2B-3",
    chuteId: "CH-003",
    wear: 28.1,
    thickness: 11.5,
    vibration: 4.43,
    rate: 0.33,
    rulDays: 218,
    status: "Monitor",
    lastPing: "Just now",
  },
  {
    linerId: "CH-001·2C",
    sensorId: "CW-001-2C-1",
    chuteId: "CH-001",
    wear: 44.4,
    thickness: 8.9,
    vibration: 4.40,
    rate: 0.68,
    rulDays: 82,
    status: "Monitor",
    lastPing: "Just now",
  },
  {
    linerId: "CH-004·1A",
    sensorId: "CW-004-1A-1",
    chuteId: "CH-004",
    wear: 37.8,
    thickness: 15.6,
    vibration: 4.40,
    rate: 0.19,
    rulDays: 327,
    status: "Monitor",
    lastPing: "Just now",
  },
  {
    linerId: "CH-004·2F",
    sensorId: "CW-004-2F-1",
    chuteId: "CH-004",
    wear: 22.8,
    thickness: 12.4,
    vibration: 4.44,
    rate: 0.23,
    rulDays: 336,
    status: "Healthy",
    lastPing: "Just now",
  },
  {
    linerId: "CH-001·4E",
    sensorId: "CW-001-4E-1",
    chuteId: "CH-001",
    wear: 1.2,
    thickness: 24.8,
    vibration: 2.15,
    rate: 0.05,
    rulDays: 850,
    status: "Healthy",
    lastPing: "Just now",
  },
  {
    linerId: "CH-002·4D",
    sensorId: "CW-002-4D-1",
    chuteId: "CH-002",
    wear: 4.0,
    thickness: 23.8,
    vibration: 2.40,
    rate: 0.08,
    rulDays: 780,
    status: "Healthy",
    lastPing: "Just now",
  },
];

export default function RealTimeWearData() {
  const [activeTab, setActiveTab] = useState<"stream" | "chutes" | "details">("stream");
  const [sensors, setSensors] = useState<SensorRecord[]>(INITIAL_SENSORS);
  const [isLive, setIsLive] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedSensor, setSelectedSensor] = useState<SensorRecord | null>(INITIAL_SENSORS[0]);

  // Live simulation ticker
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setSensors((prev) =>
        prev.map((s) => {
          // slight vibration micro-fluctuation
          const deltaVib = (Math.random() - 0.48) * 0.06;
          const newVib = Math.max(1.5, Math.min(6.5, Number((s.vibration + deltaVib).toFixed(2))));
          return {
            ...s,
            vibration: newVib,
            lastPing: "Just now",
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  const filtered = sensors.filter((s) => {
    const matchSearch =
      s.linerId.toLowerCase().includes(search.toLowerCase()) ||
      s.sensorId.toLowerCase().includes(search.toLowerCase()) ||
      s.chuteId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const criticalCount = sensors.filter((s) => s.status === "Critical" || s.status === "Failure Imminent").length;
  const avgVibration = (sensors.reduce((acc, s) => acc + s.vibration, 0) / sensors.length).toFixed(2);
  const avgWear = (sensors.reduce((acc, s) => acc + s.wear, 0) / sensors.length).toFixed(1);

  return (
    <AppLayout>
      <div className="dwms-page-container">
        {/* Top Header */}
        <div className="dwms-page-header">
          <div>
            <div className="dwms-breadcrumbs">Monitoring / Real-Time Telemetry</div>
            <h1 className="dwms-page-title">Real-Time Wear Data</h1>
            <p className="dwms-page-desc">
              High-frequency condition monitoring stream · sensor telemetry updated in real time (simulated)
            </p>
          </div>

          <div className="dwms-header-actions">
            <div className={`live-pulse-badge ${isLive ? "active" : "paused"}`}>
              <span className="live-dot" />
              <span>{isLive ? "LIVE TELEMETRY" : "STREAM PAUSED"}</span>
            </div>

            {/* <button
              onClick={() => setIsLive(!isLive)}
              className="dwms-btn dwms-btn-secondary"
              title={isLive ? "Pause stream" : "Resume stream"}
            >
              {isLive ? <Pause size={15} /> : <Play size={15} />}
              <span>{isLive ? "Pause" : "Resume"}</span>
            </button> */}
          </div>
        </div>

        {/* Top Quick Stats */}
        <div className="stats-grid mb-6">
          <div className="stat-card">
            <div className="stat-label">ACTIVE SENSORS</div>
            <div className="stat-value">{sensors.length}</div>
            <div className="stat-sub">100% telemetry online</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">CRITICAL & IMMINENT</div>
            <div className="stat-value red">{criticalCount}</div>
            <div className="stat-sub">Above wear or vibration limit</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">AVG VIBRATION VELOCITY</div>
            <div className="stat-value orange">{avgVibration} mm/s</div>
            <div className="stat-sub">Alarm threshold: 4.2 mm/s</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">AVERAGE WEAR RATE</div>
            <div className="stat-value">{avgWear}%</div>
            <div className="stat-sub">Est. fleet lifecycle safe</div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="dwms-tab-bar mb-6">
          <button
            className={`dwms-tab-btn ${activeTab === "stream" ? "active" : ""}`}
            onClick={() => setActiveTab("stream")}
          >
            <Activity size={16} />
            <span>Live Sensor Stream</span>
          </button>
          <button
            className={`dwms-tab-btn ${activeTab === "chutes" ? "active" : ""}`}
            onClick={() => setActiveTab("chutes")}
          >
            <Waves size={16} />
            <span>Chute Overview</span>
          </button>
          {/* <button
            className={`dwms-tab-btn ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            <Info size={16} />
            <span>Liner Details & Telemetry</span>
          </button> */}
        </div>

        {/* Tab 1: Live Sensor Stream Table */}
        {activeTab === "stream" && (
          <div className="dwms-panel">
            {/* Filter and Search Toolbar */}
            <div className="dwms-table-toolbar">
              <div className="dwms-search-box">
                <Search size={16} className="dwms-search-icon" />
                <input
                  type="text"
                  placeholder="Filter liner, sensor ID, chute..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="dwms-search-input"
                />
              </div>

              <div className="dwms-filter-group">
                <Filter size={15} className="text-muted" />
                <span className="text-xs text-muted mr-1">Status:</span>
                {["All", "Failure Imminent", "Critical", "Action Required", "Monitor", "Healthy"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`dwms-pill-btn ${statusFilter === status ? "active" : ""}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="dwms-table-responsive">
              <table className="dwms-data-table">
                <thead>
                  <tr>
                    <th>Liner</th>
                    <th>Sensor</th>
                    <th>Wear</th>
                    <th>Thickness</th>
                    <th>Vibration</th>
                    <th>Rate</th>
                    <th>RUL</th>
                    <th>Status</th>
                    <th>Last Telemetry</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="dwms-empty-cell">
                        No sensor records match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((s) => (
                      <tr
                        key={s.sensorId}
                        className={selectedSensor?.sensorId === s.sensorId ? "row-selected" : ""}
                        onClick={() => setSelectedSensor(s)}
                      >
                        <td className="font-semibold text-primary">{s.linerId}</td>
                        <td className="mono-num text-muted">{s.sensorId}</td>
                        <td>
                          <div className="dwms-wear-cell">
                            <div className="dwms-wear-meter">
                              <span
                                style={{ width: `${s.wear}%` }}
                                className={`meter-bar ${s.wear > 90 ? "bg-purple" : s.wear > 75 ? "bg-red" : s.wear > 50 ? "bg-orange" : "bg-green"
                                  }`}
                              />
                            </div>
                            <span className="dwms-wear-val">{s.wear}%</span>
                          </div>
                        </td>
                        <td className="mono-num">{s.thickness} mm</td>
                        <td className="mono-num">
                          <span className={s.vibration > 4.2 ? "text-danger font-bold" : ""}>
                            {s.vibration} mm/s
                          </span>
                        </td>
                        <td className="mono-num text-muted">{s.rate} %/d</td>
                        <td className="mono-num">
                          <span className={s.rulDays < 30 ? "text-danger font-bold" : ""}>
                            {s.rulDays} d
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status-pill ${s.status === "Failure Imminent"
                              ? "imminent"
                              : s.status === "Critical"
                                ? "critical"
                                : s.status === "Action Required"
                                  ? "action"
                                  : s.status === "Monitor"
                                    ? "warning"
                                    : "healthy"
                              }`}
                          >
                            <span className="status-dot" />
                            {s.status}
                          </span>
                        </td>
                        <td className="text-xs text-muted">{s.lastPing}</td>
                        <td>
                          <button
                            className="dwms-table-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSensor(s);
                              setActiveTab("details");
                            }}
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="dwms-table-footer">
              <span>Showing {filtered.length} of {sensors.length} sensor telemetry feeds</span>
              <span className="text-muted text-xs">Sampling frequency: 1 Hz · Auto-synced with IoT gateway</span>
            </div>
          </div>
        )}

        {/* Tab 2: Chute Overview Cards */}
        {activeTab === "chutes" && (
          <div className="chute-overview-grid">
            {["CH-001", "CH-002", "CH-003", "CH-004", "CH-005"].map((chute) => {
              const chuteSensors = sensors.filter((s) => s.chuteId === chute);
              const maxWear = chuteSensors.length ? Math.max(...chuteSensors.map((s) => s.wear)) : 0;
              const hasCrit = chuteSensors.some((s) => s.status === "Critical" || s.status === "Failure Imminent");

              return (
                <div key={chute} className="chute-overview-card">
                  <div className="chute-overview-head">
                    <div>
                      <h3 className="chute-card-title">{chute}</h3>
                      <p className="chute-card-subtitle">Junction House Transfer Chute</p>
                    </div>
                    <span className={`status-pill ${hasCrit ? "critical" : "healthy"}`}>
                      <span className="status-dot" />
                      {hasCrit ? "Attention Required" : "Optimal"}
                    </span>
                  </div>

                  <div className="chute-overview-body">
                    <div className="chute-stat-row">
                      <span className="stat-name">Sensor Count</span>
                      <span className="stat-val">{chuteSensors.length} active</span>
                    </div>
                    <div className="chute-stat-row">
                      <span className="stat-name">Peak Surface Wear</span>
                      <span className={`stat-val ${maxWear >= 80 ? "danger" : ""}`}>{maxWear}%</span>
                    </div>
                    <div className="chute-stat-row">
                      <span className="stat-name">Average Vibration</span>
                      <span className="stat-val">
                        {(chuteSensors.reduce((a, b) => a + b.vibration, 0) / (chuteSensors.length || 1)).toFixed(2)} mm/s
                      </span>
                    </div>
                  </div>

                  <div className="chute-overview-foot">
                    <button
                      type="button"
                      className="dwms-btn dwms-btn-primary w-full"
                      onClick={() => {
                        setSearch(chute);
                        setActiveTab("stream");
                      }}
                    >
                      View {chute} Telemetry Stream
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Detailed Telemetry View */}
        {/* {activeTab === "details" && selectedSensor && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="dwms-panel lg:col-span-1">
              <h2 className="text-lg font-bold mb-4">Liner Asset Summary</h2>
              <div className="space-y-3">
                <div className="dwms-detail-row">
                  <span className="text-muted">Liner Position:</span>
                  <span className="font-bold text-primary">{selectedSensor.linerId}</span>
                </div>
                <div className="dwms-detail-row">
                  <span className="text-muted">Sensor Hardware:</span>
                  <span className="mono-num">{selectedSensor.sensorId}</span>
                </div>
                <div className="dwms-detail-row">
                  <span className="text-muted">Chute Assembly:</span>
                  <span>{selectedSensor.chuteId}</span>
                </div>
                <div className="dwms-detail-row">
                  <span className="text-muted">Current Wear Level:</span>
                  <span className="font-bold text-danger">{selectedSensor.wear}%</span>
                </div>
                <div className="dwms-detail-row">
                  <span className="text-muted">Plate Thickness:</span>
                  <span>{selectedSensor.thickness} mm (Min: 6.0 mm)</span>
                </div>
                <div className="dwms-detail-row">
                  <span className="text-muted">Vibration Velocity:</span>
                  <span className="font-semibold text-danger">{selectedSensor.vibration} mm/s</span>
                </div>
                <div className="dwms-detail-row">
                  <span className="text-muted">Depletion Rate:</span>
                  <span>{selectedSensor.rate} % per operational day</span>
                </div>
                <div className="dwms-detail-row">
                  <span className="text-muted">Remaining Useful Life:</span>
                  <span className="font-bold">{selectedSensor.rulDays} days</span>
                </div>
                <div className="dwms-detail-row">
                  <span className="text-muted">Status Verdict:</span>
                  <span className={`status-pill ${selectedSensor.status === "Failure Imminent" ? "imminent" : "critical"}`}>
                    <span className="status-dot" />
                    {selectedSensor.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="dwms-panel lg:col-span-2">
              <h2 className="text-lg font-bold mb-2">Live Waveform & Vibration Telemetry</h2>
              <p className="text-xs text-muted mb-4">
                Tri-axial accelerometer telemetry sampled at 1 kHz — mechanical impact spectrum
              </p>

              
              <div className="waveform-box p-4 bg-navy-2 rounded border border-border">
                <div className="flex justify-between text-xs text-muted mb-2">
                  <span>RMS Vibration (mm/s)</span>
                  <span className="text-success font-semibold">● Sensor Synced & Calibrated</span>
                </div>
                <div className="h-40 flex items-end gap-1.5 px-2 pb-2 border-b border-border/50">
                  {[4.2, 4.8, 5.1, 5.4, 5.0, 4.6, 5.2, 5.5, 5.3, 5.1, 5.6, 5.4, 5.2, 5.1, 5.3, 5.5, 5.2, 5.1, 5.4, 5.3].map((v, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-blue/80 hover:bg-primary transition-all rounded-t"
                      style={{ height: `${(v / 6.0) * 100}%` }}
                      title={`Step ${i}: ${v} mm/s`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[11px] text-muted mt-2">
                  <span>T - 60s</span>
                  <span>T - 30s</span>
                  <span>Live (Now)</span>
                </div>
              </div>

              <div className="mt-5 p-4 rounded bg-panel/50 border border-border">
                <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-warning" />
                  Predictive Engineering Recommendation
                </h4>
                <p className="text-xs text-muted leading-relaxed">
                  Liner <span className="font-semibold text-primary">{selectedSensor.linerId}</span> has surpassed the warning threshold with surface wear at{" "}
                  <span className="text-danger font-semibold">{selectedSensor.wear}%</span> and vibration peaking at{" "}
                  <span className="font-semibold text-danger">{selectedSensor.vibration} mm/s</span>. Recommend issuing a maintenance replacement request before remaining thickness drops below safety limit.
                </p>
              </div>
            </div>
          </div>
        )} */}

        <style jsx>{`
          .chute-overview-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }

          @media (max-width: 1024px) {
            .chute-overview-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (max-width: 640px) {
            .chute-overview-grid {
              grid-template-columns: 1fr;
            }
          }

          .chute-overview-card {
            background: #ffffff;
            border: 1px solid #d6dde1;
            border-radius: 8px;
            padding: 18px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          .chute-overview-head {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            padding-bottom: 12px;
            border-bottom: 1px solid #eaeff1;
            margin-bottom: 14px;
          }

          .chute-card-title {
            font-size: 18px;
            font-weight: 800;
            color: #043541;
            margin: 0;
            line-height: 1.2;
          }

          .chute-card-subtitle {
            font-size: 12px;
            color: #647b86;
            margin: 2px 0 0;
          }

          .chute-overview-body {
            margin-bottom: 16px;
          }

          .chute-stat-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 9px 0;
            border-bottom: 1px solid #f1f5f7;
            font-size: 13px;
          }

          .chute-stat-row .stat-name {
            color: #647b86;
          }

          .chute-stat-row .stat-val {
            font-weight: 700;
            color: #1e293b;
          }

          .chute-stat-row .stat-val.danger {
            color: #e9282d;
          }

          .chute-overview-foot {
            margin-top: auto;
          }

          .status-pill {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            height: 26px;
            padding: 0 10px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
            width: fit-content;
          }

          .status-pill.critical {
            background: #fee2e2;
            color: #b91c1c;
            border: 1px solid #fca5a5;
          }

          .status-pill.healthy {
            background: #dcfce7;
            color: #15803d;
            border: 1px solid #86efac;
          }

          .status-pill.imminent {
            background: #f3e8ff;
            color: #7c3aed;
            border: 1px solid #d8b4fe;
          }

          .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: currentColor;
          }

          .dwms-tab-bar {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 20px;
            flex-wrap: wrap;
          }

          .dwms-tab-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            height: 38px;
            padding: 0 16px;
            font-size: 13px;
            font-weight: 600;
            color: #536b75;
            background: #ffffff;
            border: 1px solid #d6dde1;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.15s ease;
          }

          .dwms-tab-btn:hover {
            background: #f8fafc;
            border-color: #cbd5e1;
            color: #043541;
          }

          .dwms-tab-btn.active {
            background: #043541;
            border-color: #043541;
            color: #ffffff;
            box-shadow: 0 2px 4px rgba(4, 53, 65, 0.15);
          }
        `}</style>
      </div>
    </AppLayout>
  );
}

