"use client";

import React, { useState } from "react";
import AppLayout from "./AppLayout";
import {
  Calendar,
  ChevronDown,
  Download,
  Filter,
  History,
  LineChart,
  Search,
  Timer,
  Wrench,
} from "lucide-react";

interface HistoryRecord {
  id: string;
  linerId: string;
  chuteId: string;
  replacedAt: string;
  installedThickness: number;
  finalThickness: number;
  totalWear: number;
  operatingHours: number;
  replacementReason: string;
  installedPart: string;
  replacedBy: string;
}

const HISTORICAL_REPLACEMENTS: HistoryRecord[] = [
  {
    id: "REP-HIST-091",
    linerId: "CH-001·2B",
    chuteId: "CH-001",
    replacedAt: "15 Jun 2026",
    installedThickness: 60,
    finalThickness: 5.8,
    totalWear: 90.3,
    operatingHours: 4200,
    replacementReason: "Safety limit reached; high impact grooving on surface.",
    installedPart: "PN-002-B (Hardox 500)",
    replacedBy: "BEUMER Certified Field Service",
  },
  {
    id: "REP-HIST-088",
    linerId: "CH-003·1A",
    chuteId: "CH-003",
    replacedAt: "22 May 2026",
    installedThickness: 50,
    finalThickness: 8.2,
    totalWear: 83.6,
    operatingHours: 5100,
    replacementReason: "Scheduled shutdown maintenance before ore expansion.",
    installedPart: "PN-001-A (Ceramic Composite)",
    replacedBy: "HZMR Plant Floor Team",
  },
  {
    id: "REP-HIST-076",
    linerId: "CH-002·4B",
    chuteId: "CH-002",
    replacedAt: "08 Apr 2026",
    installedThickness: 55,
    finalThickness: 7.5,
    totalWear: 86.4,
    operatingHours: 3950,
    replacementReason: "Bi-metallic tile corner spalling observed during inspection.",
    installedPart: "PN-004-B (White Iron)",
    replacedBy: "BEUMER Certified Field Service",
  },
  {
    id: "REP-HIST-062",
    linerId: "CH-005·3F",
    chuteId: "CH-005",
    replacedAt: "19 Feb 2026",
    installedThickness: 40,
    finalThickness: 7.0,
    totalWear: 82.5,
    operatingHours: 4800,
    replacementReason: "Polyurethane liner bond delamination due to coarse screen reject.",
    installedPart: "PN-003-F (Polyurethane)",
    replacedBy: "HZMR Plant Floor Team",
  },
];

export default function HistoricalData() {
  const [records, setRecords] = useState<HistoryRecord[]>(HISTORICAL_REPLACEMENTS);
  const [selectedChute, setSelectedChute] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = records.filter((r) => {
    const matchChute = selectedChute === "All" || r.chuteId === selectedChute;
    const matchSearch =
      r.linerId.toLowerCase().includes(search.toLowerCase()) ||
      r.installedPart.toLowerCase().includes(search.toLowerCase()) ||
      r.replacementReason.toLowerCase().includes(search.toLowerCase());
    return matchChute && matchSearch;
  });

  return (
    <AppLayout>
      <div className="dwms-page-container">
        {/* Header */}
        <div className="dwms-page-header">
          <div>
            <div className="dwms-breadcrumbs">Analysis / Historical Records</div>
            <h1 className="dwms-page-title">Historical Data</h1>
            <p className="dwms-page-desc">
              Long-term wear trend analytics, replacement logs, and historical lifecycle performance
            </p>
          </div>
        </div>

        {/* Aggregate Stats */}
        <div className="stats-grid mb-6">
          <div className="stat-card">
            <div className="stat-label">TOTAL HISTORICAL REPLACEMENTS</div>
            <div className="stat-value">{records.length + 18}</div>
            <div className="stat-sub">Since facility commissioning</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">AVG OPERATING LIFECYCLE</div>
            <div className="stat-value text-primary font-bold">4,510 hrs</div>
            <div className="stat-sub">~6.2 months continuous feed</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">MEAN TIME BETWEEN REPLACEMENTS</div>
            <div className="stat-value font-bold">48 days</div>
            <div className="stat-sub">Across 5 transfer chutes</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">AI RUL PREDICTIVE ACCURACY</div>
            <div className="stat-value text-success font-bold">96.4%</div>
            <div className="stat-sub">Measured vs actual wear at shutdown</div>
          </div>
        </div>

        {/* 90-Day Fleet Trend Chart Representation */}
        <div className="dwms-panel mb-8">
          <div className="dwms-panel-header">
            <h2 className="text-base font-bold flex items-center gap-2">
              <LineChart size={18} className="text-primary" />
              Multi-Month Wear Progression by Chute (90 Days)
            </h2>
            <p className="text-xs text-muted">Comparative degradation rates across Rajasthan Ore Hub transfer points.</p>
          </div>

          <div className="trend-barchart-container">
            <div className="trend-barchart-grid">
              {[
                { code: "CH-001", name: "Primary Feeder", wear: 78 },
                { code: "CH-002", name: "Coarse Return", wear: 62 },
                { code: "CH-003", name: "Transfer Point", wear: 84 },
                { code: "CH-004", name: "Surge Bin", wear: 45 },
                { code: "CH-005", name: "Screen House", wear: 69 },
              ].map((item) => {
                const statusClass =
                  item.wear >= 80 ? "critical" : item.wear >= 60 ? "action" : "healthy";
                return (
                  <div key={item.code} className="trend-bar-col">
                    <div className="trend-bar-val">{item.wear}%</div>
                    <div className="trend-bar-track">
                      <div
                        className={`trend-bar-fill ${statusClass}`}
                        style={{ height: `${item.wear}%` }}
                      />
                    </div>
                    <div className="trend-bar-label">
                      {item.code}
                      <span className="trend-bar-sub block">{item.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Replacement Audit Log Table */}
        <div className="dwms-panel">
          <div className="dwms-table-toolbar">
            <div className="dwms-search-box">
              <Search size={16} className="dwms-search-icon" />
              <input
                type="text"
                placeholder="Search liner, part number, justification..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="dwms-search-input"
              />
            </div>

            <div className="dwms-filter-group">
              <Filter size={15} className="text-muted" />
              <span className="text-xs text-muted mr-1">Chute:</span>
              {["All", "CH-001", "CH-002", "CH-003", "CH-004", "CH-005"].map((ch) => (
                <button
                  key={ch}
                  onClick={() => setSelectedChute(ch)}
                  className={`dwms-pill-btn ${selectedChute === ch ? "active" : ""}`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          <div className="dwms-table-responsive">
            <table className="dwms-data-table">
              <thead>
                <tr>
                  <th>Liner Asset</th>
                  <th>Chute</th>
                  <th>Replaced Date</th>
                  <th>Thickness (Start → End)</th>
                  <th>Total Wear</th>
                  <th>Operating Hours</th>
                  <th>Installed Part Number</th>
                  <th>Cause of Maintenance</th>
                  <th>Executed By</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td className="font-bold text-primary">{item.linerId}</td>
                    <td className="mono-num text-xs font-semibold">{item.chuteId}</td>
                    <td className="text-xs">{item.replacedAt}</td>
                    <td className="mono-num text-xs">
                      {item.installedThickness} mm → <span className="text-danger font-semibold">{item.finalThickness} mm</span>
                    </td>
                    <td className="mono-num font-bold text-danger">{item.totalWear}%</td>
                    <td className="mono-num text-xs">{item.operatingHours.toLocaleString()} hrs</td>
                    <td className="text-xs font-semibold text-foreground">{item.installedPart}</td>
                    <td className="text-xs text-muted max-w-xs">{item.replacementReason}</td>
                    <td className="text-xs text-muted">{item.replacedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="dwms-table-footer">
            <span>Showing {filtered.length} of {records.length} historical replacement logs</span>
            <span className="text-muted text-xs">Certified to BEUMER LifeCycle Management Database</span>
          </div>
        </div>

        <style jsx>{`
          .trend-barchart-container {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 24px 20px 18px;
            margin: 16px 0 24px;
          }

          .trend-barchart-grid {
            display: flex;
            align-items: flex-end;
            justify-content: space-around;
            height: 200px;
            gap: 16px;
          }

          .trend-bar-col {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex: 1;
            max-width: 100px;
            height: 100%;
            justify-content: flex-end;
          }

          .trend-bar-val {
            font-size: 13px;
            font-weight: 800;
            color: #043541;
            margin-bottom: 6px;
          }

          .trend-bar-track {
            width: 100%;
            max-width: 44px;
            height: 140px;
            background: #e2e8f0;
            border-radius: 6px 6px 0 0;
            display: flex;
            align-items: flex-end;
            overflow: hidden;
          }

          .trend-bar-fill {
            width: 100%;
            border-radius: 6px 6px 0 0;
            transition: height 0.4s ease;
          }

          .trend-bar-fill.critical { background: #e9282d; }
          .trend-bar-fill.action { background: #ef5c11; }
          .trend-bar-fill.healthy { background: #079bd8; }

          .trend-bar-label {
            font-size: 12px;
            font-weight: 700;
            color: #1e293b;
            margin-top: 8px;
            text-align: center;
          }

          .trend-bar-sub {
            font-size: 11px;
            color: #647b86;
          }

          .dwms-table-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 14px;
            border-top: 1px solid #eaeff1;
            font-size: 12px;
            color: #647b86;
            background: #fafbfc;
          }
        `}</style>
      </div>
    </AppLayout>
  );
}

