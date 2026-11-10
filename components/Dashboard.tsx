"use client";

import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import AppLayout from "./AppLayout";
import { useWorkflow } from "@/contexts/WorkflowContext";
import { useAuth } from "@/contexts/AuthContext";

const wearData = [28, 28.5, 29, 29.5, 30, 30.5, 31, 31.5, 32, 32.5, 33, 33.5, 34, 34.3, 34.6, 35, 35.3, 35.6, 35.8, 36.2, 36.6, 37, 37.4, 37.8, 38.2, 38.6, 39, 39.3, 39.6, 40];

const worstLiners = [
  { id: "CH-001·2B", wear: "93.4%", status: "FAILURE IMMINENT", type: "imminent" },
  { id: "CH-003·2J", wear: "91.6%", status: "FAILURE IMMINENT", type: "imminent" },
  { id: "CH-002·4B", wear: "88.1%", status: "CRITICAL", type: "critical" },
  { id: "CH-001·1B", wear: "81.2%", status: "CRITICAL", type: "critical" },
  { id: "CH-003·1A", wear: "79.2%", status: "CRITICAL", type: "critical" },
];

const alerts = [
  {
    liner: "CH-001·1A",
    level: "WARNING",
    text: "Wear threshold exceeded — 58.8% · RUL 59 d · schedule PN-001-A",
  },
  {
    liner: "CH-001·1G",
    level: "WARNING",
    text: "Wear threshold exceeded — 64.7% · RUL 48 d · schedule PN-001-G",
  },
  {
    liner: "CH-001·2B",
    level: "CRITICAL",
    text: "Failure imminent — wear 93.4% · remaining 1.1 mm (min 6 mm) · replace with PN-002-B",
  },
];

// 15 date ticks spanning 30 days matching reference image
const wearDates = [
  "08-24",
  "08-26",
  "08-28",
  "08-30",
  "09-01",
  "09-03",
  "09-05",
  "09-07",
  "09-09",
  "09-11",
  "09-13",
  "09-15",
  "09-17",
  "09-19",
  "09-21",
];

// Wear percentage starting at 28.0% and rising to 40.0%
const fleetWearValues = [
  28.0, 28.8, 29.6, 30.6, 31.8, 33.0, 34.0, 34.9, 35.8, 36.6, 37.4, 38.2, 38.9, 39.5, 40.0,
];

function WearChart() {
  const width = 680;
  const height = 190;
  const left = 38;
  const right = 16;
  const top = 16;
  const bottom = 32;
  const plotW = width - left - right;
  const plotH = height - top - bottom;

  const yTicks = [100, 75, 50, 25, 0];

  const points = fleetWearValues
    .map((val, i) => {
      const x = left + (i / (fleetWearValues.length - 1)) * plotW;
      const y = top + ((100 - val) / 100) * plotH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const areaPath =
    `M ${left},${top + plotH} L ` +
    fleetWearValues
      .map((val, i) => {
        const x = left + (i / (fleetWearValues.length - 1)) * plotW;
        const y = top + ((100 - val) / 100) * plotH;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" L ") +
    ` L ${left + plotW},${top + plotH} Z`;

  return (
    <div className="chart-box">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="chart-svg-main"
        preserveAspectRatio="none"
      >
        {/* Horizontal dashed grid lines at y = 100, 75, 50, 25 */}
        {yTicks.map((tick) => {
          const y = top + ((100 - tick) / 100) * plotH;
          return (
            <g key={tick}>
              {tick > 0 ? (
                <line
                  x1={left}
                  y1={y}
                  x2={left + plotW}
                  y2={y}
                  stroke="#9cb2be"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              ) : null}
              {/* Y-axis tick label */}
              <text
                x={left - 7}
                y={y + 3}
                textAnchor="end"
                className="chart-axis-text chart-axis-num"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Vertical dashed grid lines and X-axis date labels */}
        {wearDates.map((date, i) => {
          const x = left + (i / (wearDates.length - 1)) * plotW;
          return (
            <g key={date}>
              {/* Vertical line: dashed grid */}
              {i > 0 && (
                <line
                  x1={x}
                  y1={top}
                  x2={x}
                  y2={top + plotH}
                  stroke="#9cb2be"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              )}
              {/* Date label */}
              <text
                x={x}
                y={top + plotH + 15}
                textAnchor="middle"
                fontSize="8"
                className="chart-axis-text chart-axis-date"
              >
                {date}
              </text>
            </g>
          );
        })}

        {/* Solid bottom axis line at y=0 */}
        <line
          x1={left}
          y1={top + plotH}
          x2={left + plotW}
          y2={top + plotH}
          stroke="#88a1ae"
          strokeWidth="1"
        />

        {/* Solid left axis line */}
        <line
          x1={left}
          y1={top}
          x2={left}
          y2={top + plotH}
          stroke="#88a1ae"
          strokeWidth="1"
        />

        {/* Shaded Area underneath the wear line */}
        <path d={areaPath} fill="rgba(0, 159, 227, 0.16)" />

        {/* Main Wear Trend Line */}
        <polyline
          fill="none"
          stroke="#009fe3"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </div>
  );
}

// 3 Junction Houses matching reference image: JH-01, JH-02, JH-05
const junctionHouses = [
  { name: "JH-01", healthy: 0, warning: 0, critical: 0 },
  { name: "JH-02", healthy: 0, warning: 0, critical: 0 },
  { name: "JH-05", healthy: 0, warning: 0, critical: 0 },
];

function HealthChart() {
  const width = 360;
  const height = 190;
  const left = 30;
  const right = 16;
  const top = 16;
  const bottom = 32;
  const plotW = width - left - right;
  const plotH = height - top - bottom;

  const yTicks = [4, 3, 2, 1, 0];

  return (
    <div className="health-card-container">
      <div className="chart-box">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="chart-svg-main"
          preserveAspectRatio="none"
        >
          {/* Horizontal dashed grid lines at y = 4, 3, 2, 1 */}
          {yTicks.map((tick) => {
            const y = top + ((4 - tick) / 4) * plotH;
            return (
              <g key={tick}>
                {tick > 0 && (
                  <line
                    x1={left}
                    y1={y}
                    x2={left + plotW}
                    y2={y}
                    stroke="#9cb2be"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                )}
                {/* Y-axis label */}
                <text
                  x={left - 7}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="7.5"
                  className="chart-axis-text chart-axis-num"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* 3 Junction Houses vertical dashed lines and X-axis labels */}
          {junctionHouses.map((house, i) => {
            const x = left + ((i + 1) / 4) * plotW;
            const barW = 10;
            const hSafe = (house.healthy / 4) * plotH;
            const hWarn = (house.warning / 4) * plotH;
            const hCrit = (house.critical / 4) * plotH;

            return (
              <g key={house.name}>
                {/* Vertical dashed line aligned with junction house label */}
                <line
                  x1={x}
                  y1={top}
                  x2={x}
                  y2={top + plotH}
                  stroke="#9cb2be"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />

                {/* Bars if values exist */}
                {hSafe > 0 && (
                  <rect
                    x={x - 17}
                    y={top + plotH - hSafe}
                    width={barW}
                    height={hSafe}
                    fill="#00a651"
                  />
                )}
                {hWarn > 0 && (
                  <rect
                    x={x - 5}
                    y={top + plotH - hWarn}
                    width={barW}
                    height={hWarn}
                    fill="#ea580c"
                  />
                )}
                {hCrit > 0 && (
                  <rect
                    x={x + 7}
                    y={top + plotH - hCrit}
                    width={barW}
                    height={hCrit}
                    fill="#dc2626"
                  />
                )}

                {/* House Name label */}
                <text
                  x={x}
                  y={top + plotH + 15}
                  textAnchor="middle"
                  fontSize="7.5"
                  className="chart-axis-text chart-axis-house"
                >
                  {house.name}
                </text>
              </g>
            );
          })}

          {/* Right boundary vertical dashed line */}
          <line
            x1={left + plotW}
            y1={top}
            x2={left + plotW}
            y2={top + plotH}
            stroke="#9cb2be"
            strokeWidth="1"
            strokeDasharray="3 3"
          />

          {/* Solid bottom axis line at y=0 */}
          <line
            x1={left}
            y1={top + plotH}
            x2={left + plotW}
            y2={top + plotH}
            stroke="#88a1ae"
            strokeWidth="1"
          />

          {/* Solid left axis line */}
          <line
            x1={left}
            y1={top}
            x2={left}
            y2={top + plotH}
            stroke="#88a1ae"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Legend matching reference image */}
      {/* <div className="health-legend-row">
        <div className="legend-entry">
          <span className="swatch-rect healthy" />
          <span className="swatch-label">healthy</span>
        </div>
        <div className="legend-entry">
          <span className="swatch-rect warning" />
          <span className="swatch-label">warning</span>
        </div>
        <div className="legend-entry">
          <span className="swatch-rect critical" />
          <span className="swatch-label">critical</span>
        </div>
      </div> */}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "red" | "orange";
}) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${tone ?? ""}`}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { pendingCount } = useWorkflow();
  const { user } = useAuth();

  const handleOpenRequestsClick = () => {
    if (user?.role === "manager" || user?.role === "admin") {
      router.push("/approvals");
    } else {
      router.push("/operations");
    }
  };

  return (
    <AppLayout>
      <div className="page-heading">
        <h1>Rajasthan Ore Hub — Operations Dashboard</h1>
        <p>3 junction houses · 200 monitored liners · live telemetry</p>
      </div>

      <section className="stats-grid">
        <div onClick={() => router.push("/my-site")} className="cursor-pointer">
          <StatCard label="MONITORED LINERS" value="200" sub="All 5 chutes online" />
        </div>
        <div onClick={() => router.push("/real-time-wear")} className="cursor-pointer">
          <StatCard label="CRITICAL / FAILED" value="6" tone="red" sub="Immediate attention" />
        </div>
        <div onClick={() => router.push("/my-site")} className="cursor-pointer">
          <StatCard label="WATCHLIST" value="135" tone="orange" sub="Threshold warning" />
        </div>
        <StatCard label="AVERAGE WEAR" value="40.0%" sub="Across 3 junction houses" />
        <div onClick={handleOpenRequestsClick} className="cursor-pointer">
          <StatCard
            label="OPEN REQUESTS"
            value={String(pendingCount)}
            tone={pendingCount > 0 ? "orange" : undefined}
            sub={user?.role === "operator" ? "Submitted for approval" : "Awaiting manager approval"}
          />
        </div>
      </section>

      <section className="chart-grid">
        <article className="panel fleet-panel">
          <h2>Fleet average wear — last 30 days</h2>
          <WearChart />
        </article>

        <article className="panel health-panel">
          <h2>Health by junction house</h2>
          <HealthChart />
        </article>
      </section>

      <section className="lower-grid">
        <article className="panel worst-panel">
          <h2>Worst liners</h2>
          <div className="liner-list">
            {worstLiners.map((liner) => (
              <div
                className="liner-row cursor-pointer hover:bg-panel/50 transition-colors"
                key={liner.id}
                onClick={() => router.push("/my-site")}
                title="Inspect in My Site liner wear map"
              >
                <div className="liner-id">{liner.id}</div>
                <div className="liner-meter"><span style={{ width: liner.wear }} /></div>
                <div className="liner-percent">{liner.wear}</div>
                <div className={`status-pill ${liner.type}`}>
                  <span className="status-dot" />
                  {liner.status}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel alerts-panel">
          <div className="alerts-heading">
            <h2>Active alerts (28)</h2>
            <Bell size={17} />
          </div>
          <div className="alerts-list">
            {alerts.map((alert) => (
              <div
                className="alert-row cursor-pointer hover:bg-panel/50 transition-colors"
                key={alert.liner}
                onClick={() => router.push("/real-time-wear")}
                title="View in Real-Time Telemetry"
              >
                <div className="alert-top">
                  <span className="alert-liner">{alert.liner}</span>
                  <span className={`alert-badge ${alert.level.toLowerCase()}`}>{alert.level}</span>
                </div>
                <div className="alert-text">{alert.text}</div>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* Scoped styles matching reference chart design */}
      <style jsx>{`
        .chart-box {
          width: 100%;
          padding: 2px 14px 6px;
        }

        .chart-svg-main {
          display: block;
          width: 100%;
          height: auto;
          overflow: visible;
        }

        :global(.chart-axis-text) {
          fill: #728a96 !important;
          font-size: 7.5px !important;
          font-family: Arial, sans-serif !important;
        }

        :global(.chart-axis-date) {
          font-size: 9px !important;
          fill: #728a96 !important;
        }

        :global(.chart-axis-num) {
          font-size: 9px !important;
          fill: #728a96 !important;
        }

        :global(.chart-axis-house) {
          font-size: 7.5px !important;
          fill: #728a96 !important;
        }

        .health-card-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          justify-content: space-between;
        }

        .health-legend-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-top: 6px;
          margin-bottom: 12px;
        }

        .legend-entry {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .swatch-rect {
          display: inline-block;
          width: 12px;
          height: 9px;
          border-radius: 1px;
        }

        .swatch-rect.healthy {
          background: #00a651;
        }

        .swatch-rect.warning {
          background: #ea580c;
        }

        .swatch-rect.critical {
          background: #dc2626;
        }

        .swatch-label {
          font-size: 11px;
          color: #556c78;
          font-weight: 500;
        }

        :global(.fleet-panel),
        :global(.health-panel) {
          min-height: auto !important;
          background: #ffffff;
          border: 1px solid #d6dde1;
          border-radius: 4px;
        }

        :global(.fleet-panel h2),
        :global(.health-panel h2) {
          font-size: 14px !important;
          font-weight: 700 !important;
          color: #0b343f !important;
          margin: 14px 18px 6px !important;
        }
      `}</style>
    </AppLayout>
  );
}