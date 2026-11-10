"use client";

import React, { useState, useMemo } from "react";
import AppLayout from "./AppLayout";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  Printer,
  X,
} from "lucide-react";

export interface ReportLinerRow {
  position: string;
  liner: string;
  chute: string;
  junction: string;
  zone: "Back Plate" | "Impact" | "Side Wall" | "Discharge";
  material: string;
  wear: number;
  thickness: number;
  rul: number;
  status: "Failure Imminent" | "Critical" | "Action Required" | "Monitor" | "Healthy";
}

// Complete 40 liners dataset for CH-001 matching reference image media_1793783158106_338a113a.jpg
const CH001_LINERS: ReportLinerRow[] = [
  { position: "2B", liner: "CH-001·2B", chute: "CH-001", junction: "JH-01", zone: "Back Plate", material: "Chromium Carbide Overlay 8+8", wear: 93.4, thickness: 1.1, rul: 15, status: "Failure Imminent" },
  { position: "1B", liner: "CH-001·1B", chute: "CH-001", junction: "JH-01", zone: "Impact", material: "Ceramic Composite 92% Al2O3", wear: 81.2, thickness: 4.7, rul: 134, status: "Critical" },
  { position: "2G", liner: "CH-001·2G", chute: "CH-001", junction: "JH-01", zone: "Back Plate", material: "Chromium Carbide Overlay 8+8", wear: 72.9, thickness: 4.3, rul: 48, status: "Action Required" },
  { position: "2E", liner: "CH-001·2E", chute: "CH-001", junction: "JH-01", zone: "Back Plate", material: "Chromium Carbide Overlay 8+8", wear: 72.2, thickness: 4.4, rul: 42, status: "Action Required" },
  { position: "4A", liner: "CH-001·4A", chute: "CH-001", junction: "JH-01", zone: "Side Wall", material: "AR400 Wear Steel", wear: 72.0, thickness: 5.6, rul: 46, status: "Action Required" },
  { position: "3G", liner: "CH-001·3G", chute: "CH-001", junction: "JH-01", zone: "Discharge", material: "AR400 Wear Steel", wear: 71.9, thickness: 5.6, rul: 78, status: "Action Required" },
  { position: "2H", liner: "CH-001·2H", chute: "CH-001", junction: "JH-01", zone: "Discharge", material: "Chromium Carbide Overlay 8+8", wear: 70.2, thickness: 4.8, rul: 229, status: "Action Required" },
  { position: "2B", liner: "CH-001·2B", chute: "CH-001", junction: "JH-01", zone: "Back Plate", material: "Chromium Carbide Overlay 8+8", wear: 69.2, thickness: 4.9, rul: 154, status: "Action Required" },
  { position: "1E", liner: "CH-001·1E", chute: "CH-001", junction: "JH-01", zone: "Impact", material: "Ceramic Composite 92% Al2O3", wear: 67.9, thickness: 8.0, rul: 46, status: "Action Required" },
  { position: "1G", liner: "CH-001·1G", chute: "CH-001", junction: "JH-01", zone: "Discharge", material: "Ceramic Composite 92% Al2O3", wear: 64.7, thickness: 8.8, rul: 48, status: "Action Required" },
  { position: "2D", liner: "CH-001·2D", chute: "CH-001", junction: "JH-01", zone: "Back Plate", material: "Chromium Carbide Overlay 8+8", wear: 64.3, thickness: 5.7, rul: 54, status: "Action Required" },
  { position: "3B", liner: "CH-001·3B", chute: "CH-001", junction: "JH-01", zone: "Side Wall", material: "AR400 Wear Steel", wear: 61.6, thickness: 7.7, rul: 116, status: "Action Required" },
  { position: "3B", liner: "CH-001·3B", chute: "CH-001", junction: "JH-01", zone: "Side Wall", material: "AR400 Wear Steel", wear: 61.3, thickness: 7.7, rul: 88, status: "Action Required" },
  { position: "1D", liner: "CH-001·1D", chute: "CH-001", junction: "JH-01", zone: "Impact", material: "Ceramic Composite 92% Al2O3", wear: 59.3, thickness: 10.2, rul: 52, status: "Action Required" },
  { position: "1A", liner: "CH-001·1A", chute: "CH-001", junction: "JH-01", zone: "Impact", material: "Ceramic Composite 92% Al2O3", wear: 58.8, thickness: 10.3, rul: 59, status: "Action Required" },
  { position: "3C", liner: "CH-001·3C", chute: "CH-001", junction: "JH-01", zone: "Side Wall", material: "AR400 Wear Steel", wear: 55.4, thickness: 8.9, rul: 83, status: "Action Required" },
  { position: "4G", liner: "CH-001·4G", chute: "CH-001", junction: "JH-01", zone: "Discharge", material: "AR400 Wear Steel", wear: 47.8, thickness: 10.4, rul: 137, status: "Monitor" },
  { position: "1F", liner: "CH-001·1F", chute: "CH-001", junction: "JH-01", zone: "Discharge", material: "Ceramic Composite 92% Al2O3", wear: 47.3, thickness: 13.2, rul: 71, status: "Monitor" },
  { position: "2B", liner: "CH-001·2B", chute: "CH-001", junction: "JH-01", zone: "Back Plate", material: "Chromium Carbide Overlay 8+8", wear: 46.5, thickness: 8.6, rul: 82, status: "Monitor" },
  { position: "2A", liner: "CH-001·2A", chute: "CH-001", junction: "JH-01", zone: "Back Plate", material: "Chromium Carbide Overlay 8+8", wear: 46.1, thickness: 8.6, rul: 102, status: "Monitor" },
  { position: "2B", liner: "CH-001·2B", chute: "CH-001", junction: "JH-01", zone: "Back Plate", material: "Chromium Carbide Overlay 8+8", wear: 44.9, thickness: 8.8, rul: 110, status: "Monitor" },
  { position: "2C", liner: "CH-001·2C", chute: "CH-001", junction: "JH-01", zone: "Back Plate", material: "Chromium Carbide Overlay 8+8", wear: 44.4, thickness: 8.9, rul: 82, status: "Monitor" },
  { position: "4D", liner: "CH-001·4D", chute: "CH-001", junction: "JH-01", zone: "Side Wall", material: "AR400 Wear Steel", wear: 38.6, thickness: 12.3, rul: 90, status: "Monitor" },
  { position: "2B", liner: "CH-001·2B", chute: "CH-001", junction: "JH-01", zone: "Back Plate", material: "Chromium Carbide Overlay 8+8", wear: 31.7, thickness: 10.9, rul: 207, status: "Monitor" },
  { position: "3A", liner: "CH-001·3A", chute: "CH-001", junction: "JH-01", zone: "Side Wall", material: "AR400 Wear Steel", wear: 31.0, thickness: 13.8, rul: 197, status: "Monitor" },
  { position: "3D", liner: "CH-001·3D", chute: "CH-001", junction: "JH-01", zone: "Side Wall", material: "AR400 Wear Steel", wear: 30.5, thickness: 13.9, rul: 348, status: "Monitor" },
  { position: "1C", liner: "CH-001·1C", chute: "CH-001", junction: "JH-01", zone: "Impact", material: "Ceramic Composite 92% Al2O3", wear: 29.7, thickness: 17.6, rul: 227, status: "Monitor" },
  { position: "1B", liner: "CH-001·1B", chute: "CH-001", junction: "JH-01", zone: "Impact", material: "Ceramic Composite 92% Al2O3", wear: 28.9, thickness: 17.8, rul: 355, status: "Monitor" },
  { position: "2F", liner: "CH-001·2F", chute: "CH-001", junction: "JH-01", zone: "Back Plate", material: "Chromium Carbide Overlay 8+8", wear: 27.3, thickness: 11.6, rul: 128, status: "Monitor" },
  { position: "4C", liner: "CH-001·4C", chute: "CH-001", junction: "JH-01", zone: "Side Wall", material: "AR400 Wear Steel", wear: 25.4, thickness: 14.9, rul: 412, status: "Healthy" },
  { position: "4B", liner: "CH-001·4B", chute: "CH-001", junction: "JH-01", zone: "Side Wall", material: "AR400 Wear Steel", wear: 24.1, thickness: 15.2, rul: 430, status: "Healthy" },
  { position: "1H", liner: "CH-001·1H", chute: "CH-001", junction: "JH-01", zone: "Discharge", material: "Ceramic Composite 92% Al2O3", wear: 22.8, thickness: 19.3, rul: 460, status: "Healthy" },
  { position: "3E", liner: "CH-001·3E", chute: "CH-001", junction: "JH-01", zone: "Discharge", material: "AR400 Wear Steel", wear: 21.5, thickness: 15.7, rul: 480, status: "Healthy" },
  { position: "3F", liner: "CH-001·3F", chute: "CH-001", junction: "JH-01", zone: "Discharge", material: "AR400 Wear Steel", wear: 20.2, thickness: 16.0, rul: 510, status: "Healthy" },
  { position: "4E", liner: "CH-001·4E", chute: "CH-001", junction: "JH-01", zone: "Side Wall", material: "AR400 Wear Steel", wear: 18.9, thickness: 16.2, rul: 540, status: "Healthy" },
  { position: "4F", liner: "CH-001·4F", chute: "CH-001", junction: "JH-01", zone: "Side Wall", material: "AR400 Wear Steel", wear: 17.5, thickness: 16.5, rul: 580, status: "Healthy" },
  { position: "2J", liner: "CH-001·2J", chute: "CH-001", junction: "JH-01", zone: "Back Plate", material: "Chromium Carbide Overlay 8+8", wear: 15.2, thickness: 13.6, rul: 620, status: "Healthy" },
  { position: "1J", liner: "CH-001·1J", chute: "CH-001", junction: "JH-01", zone: "Discharge", material: "Ceramic Composite 92% Al2O3", wear: 14.0, thickness: 21.5, rul: 650, status: "Healthy" },
  { position: "2K", liner: "CH-001·2K", chute: "CH-001", junction: "JH-01", zone: "Back Plate", material: "Chromium Carbide Overlay 8+8", wear: 12.8, thickness: 13.9, rul: 690, status: "Healthy" },
  { position: "1K", liner: "CH-001·1K", chute: "CH-001", junction: "JH-01", zone: "Impact", material: "Ceramic Composite 92% Al2O3", wear: 10.5, thickness: 22.4, rul: 720, status: "Healthy" },
];

// Helper to synthesize liners for CH-002 through CH-005 to make the full 200 plant fleet
function generatePlantLiners(): ReportLinerRow[] {
  const allLiners: ReportLinerRow[] = [...CH001_LINERS];

  const chuteConfigs = [
    { chute: "CH-002", junction: "JH-01", wearOffset: -4 },
    { chute: "CH-003", junction: "JH-02", wearOffset: 2 },
    { chute: "CH-004", junction: "JH-02", wearOffset: -8 },
    { chute: "CH-005", junction: "JH-05", wearOffset: -3 },
  ];

  chuteConfigs.forEach(({ chute, junction, wearOffset }) => {
    CH001_LINERS.forEach((base) => {
      const wear = Math.min(98, Math.max(8, Number((base.wear + wearOffset).toFixed(1))));
      let status: ReportLinerRow["status"] = "Healthy";
      if (wear >= 90) status = "Failure Imminent";
      else if (wear >= 80) status = "Critical";
      else if (wear >= 50) status = "Action Required";
      else if (wear >= 26) status = "Monitor";

      allLiners.push({
        position: base.position,
        liner: `${chute}·${base.position}`,
        chute,
        junction,
        zone: base.zone,
        material: base.material,
        wear,
        thickness: Number((base.thickness * (100 - wear) / (100 - base.wear)).toFixed(1)),
        rul: Math.max(12, Math.round(base.rul * ((100 - wear) / (100 - base.wear)))),
        status,
      });
    });
  });

  return allLiners;
}

const ALL_FLEET_LINERS = generatePlantLiners();

export default function Reports() {
  const [timeframe, setTimeframe] = useState("Last 30 days");
  const [selectedJunction, setSelectedJunction] = useState("All");
  const [selectedChute, setSelectedChute] = useState("CH-001");
  const [selectedWearType, setSelectedWearType] = useState("all");
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  // Live database state from PostgreSQL
  const [dbLiners, setDbLiners] = useState<ReportLinerRow[]>([]);
  const [distribution, setDistribution] = useState({
    healthy: 58,
    monitor: 74,
    action: 61,
    critical: 4,
    imminent: 2,
    offline: 1,
    total: 200,
  });
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);

  // Fetch all 200 plant liners and distribution directly from PostgreSQL
  React.useEffect(() => {
    fetch("/api/liners?view=report")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.liners && data.liners.length > 0) {
          setDbLiners(data.liners);
          setDbConnected(data.source === "database");
          if (data.distribution) {
            setDistribution(data.distribution);
          }
        }
      })
      .catch((err) => {
        console.warn("[DWMS Reports] DB query fallback:", err);
        setDbConnected(false);
      });
  }, []);

  // Report Modal / Print View state
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [reportGenDate, setReportGenDate] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Filtered liners for the report (uses live PostgreSQL DB records when available)
  const sourceLiners = dbLiners.length > 0 ? dbLiners : ALL_FLEET_LINERS;

  const filteredReportLiners = useMemo(() => {
    return sourceLiners.filter((l) => {
      const matchJunction = selectedJunction === "All" || l.junction === selectedJunction;
      const matchChute = selectedChute === "All" || l.chute === selectedChute;
      const matchZone =
        selectedWearType === "all" ||
        selectedWearType === "All" ||
        l.zone.toLowerCase().includes(selectedWearType.toLowerCase());
      return matchJunction && matchChute && matchZone;
    }).sort((a, b) => b.wear - a.wear);
  }, [sourceLiners, selectedJunction, selectedChute, selectedWearType]);

  // Handle Print PDF action: opens the exact report sheet and triggers browser print
  const handleOpenPrintReport = () => {
    const now = new Date();
    const formatted = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}, ${now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true }).toLowerCase()}`;
    setReportGenDate(formatted);
    setShowPrintModal(true);

    // Give state a moment to render the document, then open the print dialog
    setTimeout(() => {
      window.print();
    }, 350);
  };

  // Helper to trigger realistic CSV downloads
  const handleExportCsv = (reportType: "condition" | "shutdown" | "sensors") => {
    setIsExporting(reportType);

    setTimeout(() => {
      let filename = "";
      let csvContent = "";

      if (reportType === "condition") {
        filename = `beumer_dwms_liner_condition_report_${new Date().toISOString().slice(0, 10)}.csv`;
        csvContent =
          "Position,Liner,Chute,Zone,Material,Wear (%),Thickness (mm),RUL (days),Status\n" +
          filteredReportLiners
            .map(
              (r) =>
                `"${r.position}","${r.liner}","${r.chute}","${r.zone}","${r.material}",${r.wear},${r.thickness},${r.rul},"${r.status}"`
            )
            .join("\n");
      } else if (reportType === "shutdown") {
        filename = `beumer_dwms_shutdown_planning_report_${new Date().toISOString().slice(0, 10)}.csv`;
        const shutdownList = filteredReportLiners.filter(
          (r) => r.status === "Failure Imminent" || r.status === "Critical" || r.status === "Action Required"
        );
        csvContent =
          "Priority,Liner,Chute,Zone,Material,Wear (%),Thickness (mm),RUL (days),Status,Action Window\n" +
          shutdownList
            .map(
              (r, i) =>
                `${i + 1},"${r.liner}","${r.chute}","${r.zone}","${r.material}",${r.wear},${r.thickness},${r.rul},"${r.status}","Upcoming Outage Window Q4"`
            )
            .join("\n");
      } else {
        filename = `beumer_dwms_sensor_health_report_${new Date().toISOString().slice(0, 10)}.csv`;
        csvContent =
          "Sensor ID,Target Liner,Chute,Vibration (mm/s),Battery (%),Loop Status,Sampling,Diagnostic\n" +
          filteredReportLiners
            .slice(0, 20)
            .map(
              (r, i) =>
                `"SN-001-${r.position}","${r.liner}","${r.chute}",${(3.8 + (r.wear / 50)).toFixed(2)},${98 - i},"Closed Loop Nominal","1 kHz","Synchronized Telemetry"`
            )
            .join("\n");
      }

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExporting(null);
      showToast(`Export completed: ${filename}`);
    }, 500);
  };

  return (
    <AppLayout>
      <div className="reports-page-wrapper">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="reports-toast">
            <CheckCircle2 size={16} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 1. Header with Title, Subtitle, and Timeframe Selector */}
        <div className="reports-header-row">
          <div>
            <h1 className="reports-title">Reports</h1>
            <p className="reports-subtitle">
              Condition summaries, export and compliance documents
            </p>
          </div>

          <div className="reports-timeframe-box">
            <select
              className="reports-timeframe-select"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option value="Last 7 days">Last 7 days</option>
              <option value="Last 30 days">Last 30 days</option>
              <option value="Last 90 days">Last 90 days</option>
              <option value="Year to date">Year to date</option>
            </select>
          </div>
        </div>

        {/* 2. Top 4 Metric Summary Cards */}
        <div className="reports-metrics-row">
          <div className="reports-metric-card">
            <div className="metric-label">SITE</div>
            <div className="metric-value site-name">
              Rajasthan Ore Hub
            </div>
          </div>

          <div className="reports-metric-card">
            <div className="metric-label">LINERS REPORTED</div>
            <div className="metric-value">{distribution.total ?? 200}</div>
          </div>

          <div className="reports-metric-card">
            <div className="metric-label">ALERTS IN PERIOD</div>
            <div className="metric-value">28</div>
          </div>

          <div className="reports-metric-card">
            <div className="metric-label">REQUESTS RAISED</div>
            <div className="metric-value">2</div>
          </div>
        </div>

        {/* 3. Print PDF report Section Card */}
        <div className="reports-card print-card">
          <div className="print-card-header">
            <FileText size={18} className="print-header-icon" />
            <h2 className="print-card-title">Print PDF report</h2>
          </div>

          <div className="print-card-controls">
            <div className="control-group">
              <label className="control-label">Junction house</label>
              <div className="control-select-wrapper">
                <select
                  className="control-select"
                  value={selectedJunction}
                  onChange={(e) => setSelectedJunction(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="JH-01">JH-01 (Primary Crusher)</option>
                  <option value="JH-02">JH-02 (Transfer Building B)</option>
                  <option value="JH-05">JH-05 (Screen House)</option>
                </select>
              </div>
            </div>

            <div className="control-group">
              <label className="control-label">Chute</label>
              <div className="control-select-wrapper">
                <select
                  className="control-select"
                  value={selectedChute}
                  onChange={(e) => setSelectedChute(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="CH-001">CH-001</option>
                  <option value="CH-002">CH-002</option>
                  <option value="CH-003">CH-003</option>
                  <option value="CH-004">CH-004</option>
                  <option value="CH-005">CH-005</option>
                </select>
              </div>
            </div>

            <div className="control-group">
              <label className="control-label">Liner wear type</label>
              <div className="control-select-wrapper">
                <select
                  className="control-select"
                  value={selectedWearType}
                  onChange={(e) => setSelectedWearType(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="Impact">Impact</option>
                  <option value="Back Plate">Back Plate</option>
                  <option value="Side Wall">Side Wall</option>
                  <option value="Discharge">Discharge</option>
                </select>
              </div>
            </div>

            <div className="liner-count-indicator">
              <span>{filteredReportLiners.length} liners</span>
            </div>

            <div className="print-btn-wrapper">
              <button
                type="button"
                onClick={handleOpenPrintReport}
                className="print-pdf-btn"
                title="View and print liner wear report"
              >
                <FileText size={15} />
                <span>Print PDF</span>
              </button>
            </div>
          </div>
        </div>


        {/* 5. Status distribution Section Card */}
        <div className="reports-card status-distribution-card">
          <h2 className="status-dist-title">Status distribution</h2>

          <div className="status-dist-boxes">
            {/* 1. HEALTHY */}
            <div className="status-dist-box">
              <div className="status-dist-num text-healthy">{distribution.healthy ?? 58}</div>
              <div className="status-dist-label">HEALTHY</div>
            </div>

            {/* 2. MONITOR */}
            <div className="status-dist-box">
              <div className="status-dist-num text-monitor">{distribution.monitor ?? 74}</div>
              <div className="status-dist-label">MONITOR</div>
            </div>

            {/* 3. ACTION REQUIRED */}
            <div className="status-dist-box">
              <div className="status-dist-num text-action">{distribution.action ?? 61}</div>
              <div className="status-dist-label">ACTION REQUIRED</div>
            </div>

            {/* 4. CRITICAL */}
            <div className="status-dist-box">
              <div className="status-dist-num text-critical">{distribution.critical ?? 4}</div>
              <div className="status-dist-label">CRITICAL</div>
            </div>

            {/* 5. FAILURE IMMINENT */}
            <div className="status-dist-box">
              <div className="status-dist-num text-imminent">{distribution.imminent ?? 2}</div>
              <div className="status-dist-label">FAILURE IMMINENT</div>
            </div>

            {/* 6. OFFLINE / STALE */}
            <div className="status-dist-box">
              <div className="status-dist-num text-offline">{distribution.offline ?? 1}</div>
              <div className="status-dist-label">OFFLINE / STALE</div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* REPORT MODAL / PRINT VIEW EXACTLY AS SHOWN IN REFERENCE IMAGE             */}
        {/* media_1793783158106_338a113a.jpg                                          */}
        {/* ========================================================================= */}
        {showPrintModal && (
          <div className="print-modal-overlay">
            <div className="print-modal-container">
              {/* Toolbar (Hidden when printing via @media print) */}
              <div className="print-modal-toolbar">
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="toolbar-btn back-btn"
                >
                  <ArrowLeft size={16} />
                  <span>Back to Reports</span>
                </button>

                <div className="toolbar-info">
                  Showing {filteredReportLiners.length} Liners · Ready for Print / PDF Export
                </div>

                <div className="toolbar-actions">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="toolbar-btn primary-print-btn"
                  >
                    <Printer size={16} />
                    <span>Print Report</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPrintModal(false)}
                    className="toolbar-btn close-btn"
                    title="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Printable Document Sheet matching the reference image */}
              <div className="printable-report-sheet" id="beumer-report-sheet">
                {/* Document Main Heading */}
                <h1 className="report-doc-title">
                  BEUMER GROUP · DWMS — Liner Wear Report
                </h1>

                {/* Blue Horizontal Rule */}
                <div className="report-blue-divider" />

                {/* Report Metadata Sub-bar */}
                <div className="report-doc-metadata">
                  Site: Rajasthan Ore Hub · Junction house: {selectedJunction} · Chute: {selectedChute} · Wear type: {selectedWearType} · Liners: {filteredReportLiners.length} · Generated {reportGenDate || "4/11/2026, 2:35:34 pm"}
                </div>

                {/* High Density Certified Report Table */}
                <table className="report-print-table">
                  <thead>
                    <tr>
                      <th style={{ width: "9%" }}>Position</th>
                      <th style={{ width: "13%" }}>Liner</th>
                      <th style={{ width: "11%" }}>Chute</th>
                      <th style={{ width: "12%" }}>Zone</th>
                      <th style={{ width: "23%" }}>Material</th>
                      <th style={{ width: "8%" }}>Wear</th>
                      <th style={{ width: "10%" }}>Thickness</th>
                      <th style={{ width: "6%" }}>RUL</th>
                      <th style={{ width: "12%" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReportLiners.map((row, index) => {
                      const statusClass =
                        row.status === "Failure Imminent"
                          ? "status-imminent-txt"
                          : row.status === "Critical"
                            ? "status-critical-txt"
                            : row.status === "Action Required"
                              ? "status-action-txt"
                              : row.status === "Monitor"
                                ? "status-monitor-txt"
                                : "status-healthy-txt";

                      return (
                        <tr key={`${row.liner}-${index}`}>
                          <td className="font-bold">{row.position}</td>
                          <td>{row.liner}</td>
                          <td>{row.chute}</td>
                          <td>{row.zone}</td>
                          <td>{row.material}</td>
                          <td className="mono-num">{row.wear.toFixed(1)}%</td>
                          <td className="mono-num">{row.thickness.toFixed(1)} mm</td>
                          <td className="mono-num">{row.rul} d</td>
                          <td className={`font-semibold ${statusClass}`}>
                            {row.status}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Scoped CSS Matching Both Reference Images */}
        <style jsx>{`
          .reports-page-wrapper {
            padding: 24px 28px;
            max-width: 1400px;
            margin: 0 auto;
          }

          /* Toast Alert */
          .reports-toast {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 100;
            display: flex;
            align-items: center;
            gap: 8px;
            background: #043541;
            color: #ffffff;
            padding: 10px 18px;
            border-radius: 6px;
            font-size: 13px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: fadeIn 0.2s ease-out;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* 1. Header */
          .reports-header-row {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: 20px;
            gap: 16px;
          }

          .reports-title {
            font-size: 20px;
            font-weight: 700;
            color: #112b35;
            margin: 0;
            line-height: 1.2;
          }

          .reports-subtitle {
            font-size: 12.5px;
            color: #6c8490;
            margin: 4px 0 0;
          }

          .reports-timeframe-select {
            height: 32px;
            padding: 0 10px;
            font-size: 12.5px;
            color: #112b35;
            background: #ffffff;
            border: 1px solid #d6dde1;
            border-radius: 4px;
            cursor: pointer;
            outline: none;
          }

          .reports-timeframe-select:focus {
            border-color: #079bd8;
          }

          /* 2. Top Metrics Row */
          .reports-metrics-row {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 20px;
          }

          @media (max-width: 900px) {
            .reports-metrics-row {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (max-width: 500px) {
            .reports-metrics-row {
              grid-template-columns: 1fr;
            }
          }

          .reports-metric-card {
            background: #ffffff;
            border: 1px solid #d6dde1;
            border-radius: 6px;
            padding: 14px 18px;
            min-height: 80px;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }

          .metric-label {
            font-size: 10.5px;
            font-weight: 700;
            color: #6c8490;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }

          .metric-value {
            font-size: 22px;
            font-weight: 700;
            color: #112b35;
            line-height: 1.1;
          }

          .metric-value.site-name {
            font-size: 18px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          /* General Card Container */
          .reports-card {
            background: #ffffff;
            border: 1px solid #d6dde1;
            border-radius: 6px;
            padding: 18px 22px;
            margin-bottom: 20px;
          }

          /* 3. Print PDF report Card */
          .print-card-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;
          }

          :global(.print-header-icon) {
            color: #079bd8;
          }

          .print-card-title {
            font-size: 14px;
            font-weight: 700;
            color: #112b35;
            margin: 0;
          }

          .print-card-controls {
            display: flex;
            align-items: flex-end;
            gap: 18px;
            flex-wrap: wrap;
          }

          .control-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
          }

          .control-label {
            font-size: 11.5px;
            color: #6c8490;
            font-weight: 500;
          }

          .control-select {
            height: 32px;
            min-width: 140px;
            padding: 0 10px;
            font-size: 12.5px;
            color: #112b35;
            background: #ffffff;
            border: 1px solid #d6dde1;
            border-radius: 4px;
            cursor: pointer;
            outline: none;
          }

          .control-select:focus {
            border-color: #079bd8;
          }

          .liner-count-indicator {
            padding-bottom: 7px;
            font-size: 13px;
            color: #475569;
            font-weight: 500;
          }

          .print-btn-wrapper {
            margin-left: auto;
          }

          @media (max-width: 768px) {
            .print-btn-wrapper {
              margin-left: 0;
              width: 100%;
            }
          }

          .print-pdf-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            height: 34px;
            padding: 0 18px;
            background: #079bd8;
            color: #ffffff;
            border: none;
            border-radius: 4px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.15s ease;
          }

          .print-pdf-btn:hover {
            background: #008cc5;
          }

          /* 4. Row of 3 Export Cards */
          .reports-export-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 20px;
          }

          @media (max-width: 900px) {
            .reports-export-grid {
              grid-template-columns: 1fr;
            }
          }

          .export-card {
            display: flex;
            flex-direction: column;
            padding: 20px 22px;
            min-height: 155px;
            margin-bottom: 0;
          }

          .export-card-icon {
            color: #079bd8;
            margin-bottom: 8px;
          }

          .export-card-title {
            font-size: 15px;
            font-weight: 700;
            color: #112b35;
            margin: 0 0 4px;
          }

          .export-card-desc {
            font-size: 12px;
            color: #6c8490;
            margin: 0 0 18px;
            line-height: 1.4;
          }

          .export-card-action {
            margin-top: auto;
          }

          .export-csv-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            height: 32px;
            padding: 0 14px;
            background: #ffffff;
            color: #112b35;
            border: 1px solid #d6dde1;
            border-radius: 4px;
            font-size: 12.5px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.15s ease;
          }

          .export-csv-btn:hover {
            background: #f8fafc;
            border-color: #cbd5e1;
          }

          /* 5. Status distribution Card */
          .status-dist-title {
            font-size: 14px;
            font-weight: 700;
            color: #112b35;
            margin: 0 0 16px;
          }

          .status-dist-boxes {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
          }

          .status-dist-box {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 12px 16px;
            min-width: 105px;
            flex: 0 0 auto;
          }

          .status-dist-num {
            font-size: 22px;
            font-weight: 700;
            line-height: 1.1;
            margin-bottom: 4px;
          }

          .status-dist-label {
            font-size: 10px;
            font-weight: 700;
            color: #6c8490;
            text-transform: uppercase;
            letter-spacing: 0.4px;
          }

          /* Colors for Status Numbers Matching Live App */
          .text-healthy {
            color: #10b981; /* Green */
          }

          .text-monitor {
            color: #d97706; /* Amber/Yellow */
          }

          .text-action {
            color: #ea580c; /* Vivid Orange */
          }

          .text-critical {
            color: #dc2626; /* Red */
          }

          .text-imminent {
            color: #991b1b; /* Dark Crimson */
          }

          .text-offline {
            color: #334155; /* Slate/Dark */
          }

          /* ========================================================= */
          /* PRINT MODAL OVERLAY & EXACT REPORT SHEET CSS              */
          /* ========================================================= */
          .print-modal-overlay {
            position: fixed;
            inset: 0;
            z-index: 9999;
            background: rgba(4, 53, 65, 0.7);
            backdrop-filter: blur(2px);
            overflow-y: auto;
            padding: 24px 16px;
            display: flex;
            justify-content: center;
            align-items: flex-start;
          }

          .print-modal-container {
            background: #ffffff;
            border-radius: 8px;
            width: 100%;
            max-width: 1100px;
            box-shadow: 0 12px 36px rgba(0, 0, 0, 0.25);
            overflow: hidden;
            display: flex;
            flex-direction: column;
          }

          .print-modal-toolbar {
            background: #07343e;
            color: #ffffff;
            padding: 12px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            border-bottom: 1px solid #1a4a54;
          }

          .toolbar-info {
            font-size: 13px;
            color: #9cb2be;
            font-weight: 500;
          }

          .toolbar-actions {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .toolbar-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            height: 32px;
            padding: 0 12px;
            border-radius: 4px;
            font-size: 12.5px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.15s ease;
            border: 1px solid transparent;
          }

          .toolbar-btn.back-btn {
            background: #0a4654;
            color: #ffffff;
            border-color: #1a5a6b;
          }

          .toolbar-btn.back-btn:hover {
            background: #0d5668;
          }

          .toolbar-btn.primary-print-btn {
            background: #079bd8;
            color: #ffffff;
          }

          .toolbar-btn.primary-print-btn:hover {
            background: #008cc5;
          }

          .toolbar-btn.close-btn {
            background: transparent;
            color: #9cb2be;
            padding: 0 8px;
          }

          .toolbar-btn.close-btn:hover {
            color: #ffffff;
          }

          /* Printable Report Sheet */
          .printable-report-sheet {
            padding: 32px 36px;
            background: #ffffff;
            color: #112b35;
            font-family: Arial, Helvetica, sans-serif;
          }

          .report-doc-title {
            font-size: 18px;
            font-weight: 800;
            color: #043541;
            margin: 0 0 10px;
            letter-spacing: -0.2px;
          }

          .report-blue-divider {
            height: 3px;
            background: #079bd8;
            width: 100%;
            margin-bottom: 10px;
          }

          .report-doc-metadata {
            font-size: 12px;
            color: #647b86;
            margin-bottom: 14px;
            line-height: 1.4;
          }

          /* Report Table */
          .report-print-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12.5px;
            text-align: left;
          }

          .report-print-table thead {
            background: #043541;
            color: #ffffff;
          }

          .report-print-table th {
            padding: 9px 12px;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.3px;
          }

          .report-print-table tbody tr {
            border-bottom: 1px solid #eaeff1;
          }

          .report-print-table td {
            padding: 8px 12px;
            vertical-align: middle;
            color: #112b35;
          }

          .mono-num {
            font-variant-numeric: tabular-nums;
            font-family: "SF Mono", Consolas, Menlo, monospace;
          }

          /* Status colors matching reference image */
          .status-imminent-txt {
            color: #991b1b;
            font-weight: 700;
          }

          .status-critical-txt {
            color: #dc2626;
            font-weight: 700;
          }

          .status-action-txt {
            color: #ea580c;
            font-weight: 600;
          }

          .status-monitor-txt {
            color: #d97706;
            font-weight: 600;
          }

          .status-healthy-txt {
            color: #10b981;
            font-weight: 600;
          }

          /* ========================================================= */
          /* PRINT STYLES (@media print)                               */
          /* Clean white sheet, exact colors, hide screen chrome       */
          /* ========================================================= */
          @media print {
            body {
              background: #ffffff !important;
              color: #000000 !important;
            }

            :global(header),
            :global(aside),
            :global(.topbar),
            :global(.dwms-sidebar),
            :global(.reports-page-wrapper > div:not(.print-modal-overlay)),
            .print-modal-toolbar {
              display: none !important;
            }

            .print-modal-overlay {
              position: static !important;
              background: transparent !important;
              padding: 0 !important;
              display: block !important;
            }

            .print-modal-container {
              box-shadow: none !important;
              border: none !important;
              width: 100% !important;
              max-width: 100% !important;
            }

            .printable-report-sheet {
              padding: 0 !important;
            }

            .report-blue-divider {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              background-color: #079bd8 !important;
            }

            .report-print-table thead {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              background-color: #043541 !important;
              color: #ffffff !important;
            }

            .report-print-table th {
              color: #ffffff !important;
            }

            .status-imminent-txt { color: #991b1b !important; }
            .status-critical-txt { color: #dc2626 !important; }
            .status-action-txt { color: #ea580c !important; }
            .status-monitor-txt { color: #d97706 !important; }
            .status-healthy-txt { color: #10b981 !important; }
          }
        `}</style>
      </div>
    </AppLayout>
  );
}
