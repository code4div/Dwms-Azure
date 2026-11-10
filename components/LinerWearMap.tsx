"use client";

import React, { useState, useMemo, useEffect } from "react";
import AppLayout from "./AppLayout";
import {
  Box,
  Map,
  Table,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  X,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  Wrench,
  Calendar,
  ClipboardCheck,
  Plus,
  Pencil,
  Check,
  Calculator,
  Mail,
  Database,
  Building2,
} from "lucide-react";
import {
  chuteWallsData,
  ChuteWall,
  WallRow,
  LinerPlate,
  LinerStatus,
} from "@/lib/initialLinerData";

export type { LinerStatus, LinerPlate, WallRow, ChuteWall };

export interface ChuteInfo {
  id: string;
  name: string;
  drawingRef: string;
  sheetNo: string;
  healthy: number;
  monitor: number;
  critical: number;
}

export interface FloorInfo {
  name: string;
  chutes: ChuteInfo[];
}

export interface JunctionHouseInfo {
  id: string;
  name: string;
  floors: FloorInfo[];
}

export const SITE_JUNCTIONS: JunctionHouseInfo[] = [
  {
    id: "JH-01",
    name: "JH-01 (Primary Crusher)",
    floors: [
      {
        name: "Floor 01",
        chutes: [
          {
            id: "CH-001",
            name: "Crusher Discharge Chute",
            drawingRef: "CH-001TP NO. 10133 · Sheet 2 of 9",
            sheetNo: "Sheet 2 of 9",
            healthy: 11,
            monitor: 27,
            critical: 2,
          },
        ],
      },
      {
        name: "Floor 02",
        chutes: [
          {
            id: "CH-002",
            name: "Transfer Chute A",
            drawingRef: "CH-002TP NO. 10134 · Sheet 1 of 6",
            sheetNo: "Sheet 1 of 6",
            healthy: 10,
            monitor: 28,
            critical: 1,
          },
        ],
      },
    ],
  },
  {
    id: "JH-02",
    name: "JH-02 (Transfer Building B)",
    floors: [
      {
        name: "Floor 01",
        chutes: [
          {
            id: "CH-003",
            name: "Secondary Feed Chute",
            drawingRef: "CH-003TP NO. 10140 · Sheet 3 of 8",
            sheetNo: "Sheet 3 of 8",
            healthy: 13,
            monitor: 25,
            critical: 2,
          },
        ],
      },
      {
        name: "Floor 02",
        chutes: [
          {
            id: "CH-004",
            name: "Screen Feed Chute",
            drawingRef: "CH-004TP NO. 10141 · Sheet 1 of 5",
            sheetNo: "Sheet 1 of 5",
            healthy: 18,
            monitor: 22,
            critical: 0,
          },
        ],
      },
    ],
  },
  {
    id: "JH-05",
    name: "JH-05 (Screen House)",
    floors: [
      {
        name: "Floor 01",
        chutes: [
          {
            id: "CH-005",
            name: "Reclaim Feed Chute",
            drawingRef: "CH-005TP NO. 10155 · Sheet 2 of 4",
            sheetNo: "Sheet 2 of 4",
            healthy: 6,
            monitor: 33,
            critical: 1,
          },
        ],
      },
    ],
  },
];

const ALL_CHUTES: ChuteInfo[] = SITE_JUNCTIONS.flatMap((jh) =>
  jh.floors.flatMap((f) => f.chutes)
);

function getWallsDataForChute(chuteId: string): ChuteWall[] {
  const meta = ALL_CHUTES.find((c) => c.id === chuteId) || ALL_CHUTES[0];

  return chuteWallsData.map((wall) => ({
    ...wall,
    rows: wall.rows.map((row) => ({
      ...row,
      liners: row.liners.map((l) => {
        let wear = l.wear;
        let status: LinerStatus = l.status;
        let thickness = l.thickness;
        let rulDays = l.rulDays;

        if (chuteId === "CH-003") {
          if (l.id === "2J") {
            wear = 91.6;
            status = "critical";
            thickness = 1.3;
            rulDays = 17;
          } else if (l.id === "1A") {
            wear = 79.8;
            status = "critical";
            thickness = 5.1;
            rulDays = 52;
          }
        } else if (chuteId === "CH-002") {
          if (l.id === "4B") {
            wear = 88.1;
            status = "critical";
            thickness = 2.4;
            rulDays = 15;
          } else if (l.id === "1B") {
            wear = 72.4;
            status = "action";
            thickness = 6.2;
            rulDays = 99;
          }
        } else if (chuteId === "CH-005") {
          if (l.id === "3F") {
            wear = 77.5;
            status = "critical";
            thickness = 4.5;
            rulDays = 68;
          } else if (l.id === "1B") {
            wear = 65.7;
            status = "action";
            thickness = 5.8;
            rulDays = 82;
          }
        } else if (chuteId === "CH-004") {
          if (l.id === "3A") {
            wear = 71.8;
            status = "action";
            thickness = 6.8;
            rulDays = 166;
          } else if (l.id === "4B") {
            wear = 51.6;
            status = "monitor";
            thickness = 11.2;
            rulDays = 64;
          }
        }

        return {
          ...l,
          fullCode: `${chuteId}·${l.id}`,
          drawingRef: meta.drawingRef,
          wear,
          status,
          thickness,
          rulDays,
        };
      }),
    })),
  }));
}

// Color mapping matching reference image
const statusStyles: Record<
  LinerStatus,
  { fill: string; stroke: string; text: string; label: string; badgeClass: string }
> = {
  healthy: {
    fill: "#e6f9f0",
    stroke: "#34d399",
    text: "#065f46",
    label: "Healthy",
    badgeClass: "badge-healthy",
  },
  monitor: {
    fill: "#fbf3d5",
    stroke: "#eab308",
    text: "#854d0e",
    label: "Monitor",
    badgeClass: "badge-monitor",
  },
  action: {
    fill: "#fae8d8",
    stroke: "#f97316",
    text: "#9a3412",
    label: "Action Required",
    badgeClass: "badge-action",
  },
  critical: {
    fill: "#fce4e4",
    stroke: "#ef4444",
    text: "#991b1b",
    label: "Critical",
    badgeClass: "badge-critical",
  },
  imminent: {
    fill: "#fee2e2",
    stroke: "#b91c1c",
    text: "#7f1d1d",
    label: "Failure Imminent",
    badgeClass: "badge-critical",
  },
  offline: {
    fill: "#f1f5f9",
    stroke: "#94a3b8",
    text: "#475569",
    label: "Offline / Stale",
    badgeClass: "badge-monitor",
  },
};

export default function LinerWearMap() {
  const [wallsData, setWallsData] = useState<ChuteWall[]>(chuteWallsData);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [dbName, setDbName] = useState<string>("DWMS_TestDB");
  const [isSavingDb, setIsSavingDb] = useState(false);
  const [selectedChute, setSelectedChute] = useState("CH-001");
  const [activeTab, setActiveTab] = useState<"twin" | "map" | "tabular">("map");
  const [viewMode, setViewMode] = useState<"operational" | "engineering">("operational");
  const [statusFilter, setStatusFilter] = useState<"all" | LinerStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedLiner, setSelectedLiner] = useState<LinerPlate | null>(null);
  const [drawerTab, setDrawerTab] = useState<"details" | "maintenance" | "inspection">("details");
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [newReading, setNewReading] = useState("");
  const [readingLogged, setReadingLogged] = useState(false);

  // Edit Mode state for Wear Parameters in Side Panel
  const [isEditingWear, setIsEditingWear] = useState(false);
  const [editThickness, setEditThickness] = useState<string>("");
  const [editMinThickness, setEditMinThickness] = useState<string>("");
  const [editWearRateMonth, setEditWearRateMonth] = useState<string>("");
  const [editWearRateDay, setEditWearRateDay] = useState<string>("");
  const [editRulDays, setEditRulDays] = useState<string>("");
  const [editCalculatedWear, setEditCalculatedWear] = useState<number>(0);
  const [editCalculatedStatus, setEditCalculatedStatus] = useState<LinerStatus>("healthy");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string>("");

  // Load real-time liner data from PostgreSQL database whenever selectedChute changes
  useEffect(() => {
    let isCurrent = true;
    fetch(`/api/liners?chute=${encodeURIComponent(selectedChute)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isCurrent) return;
        if (data.success && data.walls && data.walls.length > 0) {
          setWallsData(data.walls);
          setDbConnected(data.source === "database");
          if (data.database) setDbName(data.database);
        } else {
          setWallsData(getWallsDataForChute(selectedChute));
        }
      })
      .catch((err) => {
        if (!isCurrent) return;
        console.warn("[DWMS] Database query error, using cached fallback data:", err);
        setWallsData(getWallsDataForChute(selectedChute));
        setDbConnected(false);
      });

    setSelectedLiner(null);
    return () => {
      isCurrent = false;
    };
  }, [selectedChute]);

  // Close panel and reset edit on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleSelectLiner(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Compute status counts across all 40 liners in dynamic wallsData state
  const counts = useMemo(() => {
    let healthy = 0;
    let monitor = 0;
    let action = 0;
    let critical = 0;
    wallsData.forEach((wall) => {
      wall.rows.forEach((row) => {
        row.liners.forEach((l) => {
          if (l.status === "healthy") healthy++;
          if (l.status === "monitor") monitor++;
          if (l.status === "action") action++;
          if (l.status === "critical" || l.status === "imminent") critical++;
        });
      });
    });
    return { all: healthy + monitor + action + critical, healthy, monitor, action, critical };
  }, [wallsData]);

  // Compute visible liners based on dynamic wallsData, active filter, and search
  const visibleCount = useMemo(() => {
    let count = 0;
    wallsData.forEach((wall) => {
      wall.rows.forEach((row) => {
        row.liners.forEach((l) => {
          const matchesFilter = statusFilter === "all" || l.status === statusFilter;
          const query = searchQuery.trim().toLowerCase();
          const matchesSearch =
            !query ||
            l.id.toLowerCase().includes(query) ||
            l.fullCode.toLowerCase().includes(query) ||
            l.partNo.toLowerCase().includes(query);
          if (matchesFilter && matchesSearch) count++;
        });
      });
    });
    return count;
  }, [wallsData, statusFilter, searchQuery]);

  // Handler for selecting a liner and initializing edit state
  const handleSelectLiner = (liner: LinerPlate | null) => {
    setSelectedLiner(liner);
    setIsEditingWear(false);
    setSaveSuccessMsg(false);
    setEmailStatus("");
    if (liner) {
      setEditThickness(liner.thickness.toString());
      setEditMinThickness(liner.minAcceptable.toString());
      setEditWearRateMonth(liner.wearRateMonth.toString());
      setEditWearRateDay(liner.wearRateDay.toString());
      setEditRulDays(liner.rulDays.toString());
      setEditCalculatedWear(liner.wear);
      setEditCalculatedStatus(liner.status);
    }
  };

  // Toggle edit mode in the wear section
  const toggleEditWear = () => {
    if (isEditingWear) {
      // Cancel edits: revert to current selectedLiner values
      if (selectedLiner) {
        setEditThickness(selectedLiner.thickness.toString());
        setEditMinThickness(selectedLiner.minAcceptable.toString());
        setEditWearRateMonth(selectedLiner.wearRateMonth.toString());
        setEditWearRateDay(selectedLiner.wearRateDay.toString());
        setEditRulDays(selectedLiner.rulDays.toString());
        setEditCalculatedWear(selectedLiner.wear);
        setEditCalculatedStatus(selectedLiner.status);
      }
      setIsEditingWear(false);
    } else {
      if (selectedLiner) {
        setEditThickness(selectedLiner.thickness.toString());
        setEditMinThickness(selectedLiner.minAcceptable.toString());
        setEditWearRateMonth(selectedLiner.wearRateMonth.toString());
        setEditWearRateDay(selectedLiner.wearRateDay.toString());
        setEditRulDays(selectedLiner.rulDays.toString());
        setEditCalculatedWear(selectedLiner.wear);
        setEditCalculatedStatus(selectedLiner.status);
      }
      setIsEditingWear(true);
      setSaveSuccessMsg(false);
      setEmailStatus("");
    }
  };

  // Auto-calculation functions
  const calculateWearPercentage = (remaining: number, original: number): number => {
    if (original <= 0) return 0;
    const wear = ((original - remaining) / original) * 100;
    return Math.max(0, Math.min(100, Number(wear.toFixed(1))));
  };

  const calculateStatus = (wear: number, remaining: number, minimum: number): LinerStatus => {
    if (wear >= 80 || remaining <= minimum) return "critical";
    if (wear >= 60) return "action";
    if (wear >= 30) return "monitor";
    return "healthy";
  };

  // Handlers for real-time auto-calculation on field change
  const handleThicknessChange = (valStr: string) => {
    setEditThickness(valStr);
    const newThickness = parseFloat(valStr);
    const minT = parseFloat(editMinThickness) || (selectedLiner?.minAcceptable ?? 10);
    const origT = selectedLiner?.origThickness ?? 30;

    if (!isNaN(newThickness)) {
      const newWear = calculateWearPercentage(newThickness, origT);
      const newStatus = calculateStatus(newWear, newThickness, minT);
      setEditCalculatedWear(newWear);
      setEditCalculatedStatus(newStatus);

      // Auto-update RUL days based on remaining usable thickness & wear rate
      const rateMonth = parseFloat(editWearRateMonth) || 0;
      if (rateMonth > 0) {
        const usableMm = Math.max(0, newThickness - minT);
        const dailyRateMm = rateMonth / 30.5;
        const newRul = Math.round(usableMm / dailyRateMm);
        setEditRulDays(newRul.toString());
      }
    }
  };

  const handleMinThicknessChange = (valStr: string) => {
    setEditMinThickness(valStr);
    const newMinT = parseFloat(valStr);
    const thick = parseFloat(editThickness) || (selectedLiner?.thickness ?? 15);
    const origT = selectedLiner?.origThickness ?? 30;

    if (!isNaN(newMinT)) {
      const wear = calculateWearPercentage(thick, origT);
      const newStatus = calculateStatus(wear, thick, newMinT);
      setEditCalculatedStatus(newStatus);

      // Auto-update RUL days
      const rateMonth = parseFloat(editWearRateMonth) || 0;
      if (rateMonth > 0) {
        const usableMm = Math.max(0, thick - newMinT);
        const dailyRateMm = rateMonth / 30.5;
        const newRul = Math.round(usableMm / dailyRateMm);
        setEditRulDays(newRul.toString());
      }
    }
  };

  const handleWearRateMonthChange = (valStr: string) => {
    setEditWearRateMonth(valStr);
    const newRateMonth = parseFloat(valStr);
    const thick = parseFloat(editThickness) || (selectedLiner?.thickness ?? 15);
    const minT = parseFloat(editMinThickness) || (selectedLiner?.minAcceptable ?? 10);
    const origT = selectedLiner?.origThickness ?? 30;

    if (!isNaN(newRateMonth) && newRateMonth > 0) {
      // Sync daily wear %
      const dailyRateMm = newRateMonth / 30.5;
      const dailyPct = Number(((dailyRateMm / origT) * 100).toFixed(2));
      setEditWearRateDay(dailyPct.toString());

      // Recalculate RUL days
      const usableMm = Math.max(0, thick - minT);
      const newRul = Math.round(usableMm / dailyRateMm);
      setEditRulDays(newRul.toString());
    }
  };

  const handleWearRateDayChange = (valStr: string) => {
    setEditWearRateDay(valStr);
    const newRateDay = parseFloat(valStr);
    const thick = parseFloat(editThickness) || (selectedLiner?.thickness ?? 15);
    const minT = parseFloat(editMinThickness) || (selectedLiner?.minAcceptable ?? 10);
    const origT = selectedLiner?.origThickness ?? 30;

    if (!isNaN(newRateDay) && newRateDay > 0) {
      // Sync monthly wear mm
      const dailyRateMm = (newRateDay / 100) * origT;
      const monthlyMm = Number((dailyRateMm * 30.5).toFixed(1));
      setEditWearRateMonth(monthlyMm.toString());

      // Recalculate RUL days
      const usableMm = Math.max(0, thick - minT);
      const newRul = dailyRateMm > 0 ? Math.round(usableMm / dailyRateMm) : 999;
      setEditRulDays(newRul.toString());
    }
  };

  const handleRulDaysChange = (valStr: string) => {
    setEditRulDays(valStr);
    const newRul = parseInt(valStr, 10);
    const thick = parseFloat(editThickness) || (selectedLiner?.thickness ?? 15);
    const minT = parseFloat(editMinThickness) || (selectedLiner?.minAcceptable ?? 10);
    const origT = selectedLiner?.origThickness ?? 30;

    if (!isNaN(newRul) && newRul > 0) {
      const usableMm = Math.max(0, thick - minT);
      const dailyRateMm = usableMm / newRul;
      const monthlyMm = Number((dailyRateMm * 30.5).toFixed(1));
      const dailyPct = Number(((dailyRateMm / origT) * 100).toFixed(2));
      setEditWearRateMonth(monthlyMm.toString());
      setEditWearRateDay(dailyPct.toString());
    }
  };

  const handleResetEdits = () => {
    if (!selectedLiner) return;
    setEditThickness(selectedLiner.thickness.toString());
    setEditMinThickness(selectedLiner.minAcceptable.toString());
    setEditWearRateMonth(selectedLiner.wearRateMonth.toString());
    setEditWearRateDay(selectedLiner.wearRateDay.toString());
    setEditRulDays(selectedLiner.rulDays.toString());
    setEditCalculatedWear(selectedLiner.wear);
    setEditCalculatedStatus(selectedLiner.status);
  };

  // Save changes to wallsData state and selectedLiner
  const handleSaveWearEdits = () => {
    if (!selectedLiner) return;

    const thick = parseFloat(editThickness);
    const minT = parseFloat(editMinThickness);
    const rateMonth = parseFloat(editWearRateMonth);
    const rateDay = parseFloat(editWearRateDay);
    const rul = parseInt(editRulDays, 10);

    const finalThickness = !isNaN(thick) ? Number(thick.toFixed(1)) : selectedLiner.thickness;
    const finalMinT = !isNaN(minT) ? Number(minT.toFixed(1)) : selectedLiner.minAcceptable;
    const finalRateMonth = !isNaN(rateMonth) ? Number(rateMonth.toFixed(1)) : selectedLiner.wearRateMonth;
    const finalRateDay = !isNaN(rateDay) ? Number(rateDay.toFixed(2)) : selectedLiner.wearRateDay;
    const finalRul = !isNaN(rul) ? rul : selectedLiner.rulDays;
    const finalWear = editCalculatedWear;
    const finalStatus = editCalculatedStatus;
    const previousWear = selectedLiner.wear;

    // Calculate new status counts across all walls and liners for the email notification
    let countHealthy = 0;
    let countMonitor = 0;
    let countAction = 0;
    let countCritical = 0;

    const updatedWalls = wallsData.map((wall) => ({
      ...wall,
      rows: wall.rows.map((row) => ({
        ...row,
        liners: row.liners.map((l) => {
          const isTarget = l.fullCode === selectedLiner.fullCode;
          const status = isTarget ? finalStatus : l.status;
          if (status === "healthy") countHealthy++;
          else if (status === "monitor") countMonitor++;
          else if (status === "action") countAction++;
          else if (status === "critical") countCritical++;

          if (isTarget) {
            return {
              ...l,
              thickness: finalThickness,
              minAcceptable: finalMinT,
              wearRateMonth: finalRateMonth,
              wearRateDay: finalRateDay,
              rulDays: finalRul,
              wear: finalWear,
              status: finalStatus,
            };
          }
          return l;
        }),
      })),
    }));

    // Update in wallsData state (triggers map schematic color and value updates)
    setWallsData(updatedWalls);

    // Update selectedLiner state
    setSelectedLiner((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        thickness: finalThickness,
        minAcceptable: finalMinT,
        wearRateMonth: finalRateMonth,
        wearRateDay: finalRateDay,
        rulDays: finalRul,
        wear: finalWear,
        status: finalStatus,
      };
    });

    setIsEditingWear(false);
    setSaveSuccessMsg(true);
    setEmailStatus("Dispatching automated SMTP email notification...");

    // Persist changes to MS SQL Server database (DWMS_TestDB)
    setIsSavingDb(true);
    fetch("/api/liners", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullCode: selectedLiner.fullCode,
        thickness: finalThickness,
        minAcceptable: finalMinT,
        wearRateMonth: finalRateMonth,
        wearRateDay: finalRateDay,
        rulDays: finalRul,
        wear: finalWear,
        status: finalStatus,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.info("[DWMS] Liner saved to database successfully:", data);
          setDbConnected(true);
        } else {
          console.warn("[DWMS] Database save warning:", data.error);
        }
      })
      .catch((err) => {
        console.warn("[DWMS] Database save network error:", err);
      })
      .finally(() => {
        setIsSavingDb(false);
      });

    // Dispatch automated email notification via SMTP with full fleet health status counts
    const emailPayload = {
      linerId: selectedLiner.id,
      fullCode: selectedLiner.fullCode,
      partNo: selectedLiner.partNo,
      chute: selectedChute === "CH-001" ? "CH-001 — Crusher Area" : selectedChute,
      assembly: selectedLiner.assembly,
      zone: selectedLiner.zone,
      previousWear,
      newWear: finalWear,
      wearDelta: Number((finalWear - previousWear).toFixed(1)),
      previousStatus: selectedLiner.status,
      newStatus: finalStatus,
      remainingThickness: finalThickness,
      minAcceptable: finalMinT,
      origThickness: selectedLiner.origThickness,
      wearRateDay: finalRateDay,
      wearRateMonth: finalRateMonth,
      rulDays: finalRul,
      counts: {
        healthy: countHealthy,
        monitor: countMonitor,
        action: countAction,
        critical: countCritical,
        total: countHealthy + countMonitor + countAction + countCritical,
      },
      timestamp: new Date().toISOString(),
    };

    fetch("/api/send-wear-alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailPayload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.simulated) {
            setEmailStatus("SMTP logged to server (configure SMTP in .env.local to receive live emails).");
          } else {
            setEmailStatus("Automated alert email sent via SMTP successfully!");
          }
        } else {
          setEmailStatus(`Email notice: ${data.error || "Delivery issue (check .env.local)"}`);
        }
      })
      .catch((err) => {
        console.warn("Failed to dispatch automated wear alert email:", err);
        setEmailStatus("Automated email dispatch failed to reach server endpoint.");
      });

    setTimeout(() => {
      setSaveSuccessMsg(false);
      setEmailStatus("");
    }, 6000);
  };

  const handleZoomIn = () => setZoomLevel((z) => Math.min(1.4, Number((z + 0.1).toFixed(1))));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.75, Number((z - 0.1).toFixed(1))));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setSearchQuery("");
    setStatusFilter("all");
  };

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const handleRequestPart = () => {
    setOrderSuccess(true);
    setTimeout(() => setOrderSuccess(false), 3500);
  };

  const handleLogReading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReading) return;
    setReadingLogged(true);
    setNewReading("");
    setTimeout(() => setReadingLogged(false), 3000);
  };

  const activeChuteInfo = useMemo(() => {
    return ALL_CHUTES.find((c) => c.id === selectedChute) || ALL_CHUTES[0];
  }, [selectedChute]);

  const flatLiners = useMemo(() => {
    const list: LinerPlate[] = [];
    wallsData.forEach((w) => {
      w.rows.forEach((r) => {
        list.push(...r.liners);
      });
    });
    return list;
  }, [wallsData]);

  return (
    <AppLayout>
      <div className="dwms-page-container">
        {/* Page Heading according to the investigation */}
        <div className="dwms-page-header">
          <div>
            <div className="dwms-breadcrumbs">Monitoring / Digital Twin</div>
            <h1 className="dwms-page-title">My Site</h1>
            <p className="dwms-page-desc">
              Hierarchy and live liner wear map for your assigned site
            </p>
          </div>
        </div>

        {/* 2-Column Side-by-Side Layout: Left = Chutes Selector, Right = Selected Chute Details & Schematics */}
        <div className="my-site-layout">
          {/* LEFT SIDE: Hierarchy & All Chutes */}
          <aside className="my-site-sidebar">
            <div className="site-tree-card">
              {/* Site title & Legend */}
              <div className="site-tree-header">
                <h2 className="site-tree-title">
                  <Building2 size={16} />
                  Rajasthan Ore Hub
                </h2>
                {/* <span className="site-status-tag">Active Site</span> */}
              </div>

              {/* Legend Indicators */}
              <div className="site-legend-row">
                <span className="legend-dot-item">
                  <span className="legend-dot healthy" /> Healthy
                </span>
                <span className="legend-dot-item">
                  <span className="legend-dot warning" /> Warning
                </span>
                <span className="legend-dot-item">
                  <span className="legend-dot critical" /> Critical
                </span>
              </div>

              {/* Junction Houses & Floors Hierarchy */}
              <div>
                {SITE_JUNCTIONS.map((jh) => (
                  <div key={jh.id} className="jh-section">
                    <div className="jh-title">{jh.name}</div>

                    {jh.floors.map((floor) => (
                      <div key={floor.name} className="floor-group">
                        <div className="floor-label">{floor.name}</div>

                        {floor.chutes.map((chute) => {
                          const isSelected = selectedChute === chute.id;
                          return (
                            <button
                              key={chute.id}
                              type="button"
                              onClick={() => {
                                setSelectedChute(chute.id);
                                handleSelectLiner(null);
                              }}
                              className={`chute-tree-btn ${isSelected ? "active" : ""}`}
                            >
                              <span className="chute-code">{chute.id}</span>

                              {/* Breakdown Badges: Healthy / Warning / Critical */}
                              <div className="chute-badges-group">
                                <span className="chute-badge-pill healthy" title="Healthy Liners">
                                  {chute.healthy}
                                </span>
                                <span className="chute-badge-pill warning" title="Warning / Monitor Liners">
                                  {chute.monitor}
                                </span>
                                <span className="chute-badge-pill critical" title="Critical Liners">
                                  {chute.critical}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* RIGHT SIDE: Selected Chute */}
          <main className="my-site-content">
            <div className="liner-map-container">
              {/* Chute Top Ribbon */}
              <div className="bg-white border border-border rounded-lg p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-extrabold text-navy tracking-tight">
                      {selectedChute}
                    </h2>
                    <span className="text-xs px-2.5 py-1 rounded bg-navy/10 text-navy font-bold">
                      {activeChuteInfo.name}
                    </span>
                    {/* <div
                      className={`db-status-pill ${dbConnected ? "connected" : "offline"}`}
                      title={
                        dbConnected
                          ? `Connected to PostgreSQL (${dbName}) via Sequelize`
                          : "Connecting to PostgreSQL / using fallback data"
                      }
                    >
                      <Database size={13} className="db-icon" />
                      <span className="db-dot" />
                      <span className="db-text">{dbConnected ? `DB: ${dbName}` : "DB Offline"}</span>
                      {isSavingDb && <span className="db-saving-tag">Saving...</span>}
                    </div> */}
                  </div>
                  <div className="text-xs text-muted mt-1 font-medium">
                    {activeChuteInfo.drawingRef}
                  </div>
                </div>

                {/* Top View Selector Tabs: Liner Wear Map, Tabular, 3D Digital Twin */}
                <div className="subnav-tabs">
                  <button
                    className={`subnav-tab ${activeTab === "map" ? "active" : ""}`}
                    onClick={() => setActiveTab("map")}
                  >
                    <Map size={15} />
                    <span>Liner Wear Map</span>
                  </button>
                  <button
                    className={`subnav-tab ${activeTab === "tabular" ? "active" : ""}`}
                    onClick={() => setActiveTab("tabular")}
                  >
                    <Table size={15} />
                    <span>Tabular</span>
                  </button>

                </div>
              </div>

              {/* Filter & Controls Toolbar */}
              <div className="wear-map-toolbar">
                <div className="toolbar-left">
                  {/* Sheet badge */}
                  <div className="sheet-badge">
                    <span className="chute-id-tag">{selectedChute}</span>
                    <span className="sheet-meta">{activeChuteInfo.sheetNo}</span>
                  </div>

                  {/* View Mode Switcher */}
                  <div className="view-toggle">
                    <button
                      className={`toggle-btn ${viewMode === "operational" ? "active" : ""}`}
                      onClick={() => setViewMode("operational")}
                    >
                      operational view
                    </button>
                    <button
                      className={`toggle-btn ${viewMode === "engineering" ? "active" : ""}`}
                      onClick={() => setViewMode("engineering")}
                    >
                      engineering view
                    </button>
                  </div>

                  {/* Status Filter Badges */}
                  <div className="status-filters">
                    <button
                      className={`filter-pill ${statusFilter === "all" ? "active" : ""}`}
                      onClick={() => setStatusFilter("all")}
                    >
                      All
                    </button>
                    <button
                      className={`filter-pill ${statusFilter === "healthy" ? "active" : ""}`}
                      onClick={() => setStatusFilter(statusFilter === "healthy" ? "all" : "healthy")}
                    >
                      Healthy <span className="count-bubble healthy">{counts.healthy}</span>
                    </button>
                    <button
                      className={`filter-pill ${statusFilter === "monitor" ? "active" : ""}`}
                      onClick={() => setStatusFilter(statusFilter === "monitor" ? "all" : "monitor")}
                    >
                      Monitor <span className="count-bubble monitor">{counts.monitor}</span>
                    </button>
                    <button
                      className={`filter-pill ${statusFilter === "action" ? "active" : ""}`}
                      onClick={() => setStatusFilter(statusFilter === "action" ? "all" : "action")}
                    >
                      Action Required <span className="count-bubble action">{counts.action}</span>
                    </button>
                    <button
                      className={`filter-pill ${statusFilter === "critical" ? "active" : ""}`}
                      onClick={() => setStatusFilter(statusFilter === "critical" ? "all" : "critical")}
                    >
                      Critical <span className="count-bubble critical">{counts.critical}</span>
                    </button>
                  </div>
                </div>

                <div className="toolbar-right">
                  {/* Search Liner Input */}
                  <div className="search-wrap">
                    <Search size={14} className="search-icon" />
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Find liner: 1B or PN-002-B"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                      className="search-submit-btn"
                      onClick={() => { }}
                      title="Search liners"
                    >
                      <Search size={13} />
                      <span>Find liner</span>
                    </button>
                  </div>

                  {/* Zoom Controls */}
                  <div className="zoom-btn-group">
                    <button onClick={handleZoomIn} title="Zoom In" aria-label="Zoom in">
                      <ZoomIn size={15} />
                    </button>
                    <button onClick={handleZoomOut} title="Zoom Out" aria-label="Zoom out">
                      <ZoomOut size={15} />
                    </button>
                    <button onClick={handleResetZoom} title="Reset schematic" aria-label="Reset zoom">
                      <RotateCcw size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Legend Swatches */}
              <div className="wear-map-legend">
                <div className="legend-entry">
                  <span className="swatch critical" />
                  <span>Critical</span>
                </div>
                <div className="legend-entry">
                  <span className="swatch action" />
                  <span>Action Required</span>
                </div>
                <div className="legend-entry">
                  <span className="swatch monitor" />
                  <span>Monitor</span>
                </div>
                <div className="legend-entry">
                  <span className="swatch healthy" />
                  <span>Healthy</span>
                </div>
              </div>

              {/* View Content depending on activeTab */}
              {activeTab === "map" && (
                /* Chute Schematics Grid (4 Walls) with inner lines feature maintained */
                <div
                  className="walls-grid"
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top center" }}
                >
                  {wallsData.map((wall) => (
                    <ChuteWallCard
                      key={wall.partNumber}
                      wall={wall}
                      viewMode={viewMode}
                      statusFilter={statusFilter}
                      searchQuery={searchQuery}
                      selectedLinerCode={selectedLiner?.fullCode}
                      onSelectLiner={handleSelectLiner}
                    />
                  ))}
                </div>
              )}

              {activeTab === "tabular" && (
                /* Tabular View */
                <div className="dwms-panel">
                  <div className="dwms-table-responsive">
                    <table className="dwms-data-table">
                      <thead>
                        <tr>
                          <th>Liner</th>
                          <th>Assembly Wall</th>
                          <th>Part No</th>
                          <th>Wear %</th>
                          <th>Thickness</th>
                          <th>RUL (Days)</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {flatLiners.map((liner) => (
                          <tr
                            key={liner.fullCode}
                            className={selectedLiner?.fullCode === liner.fullCode ? "row-selected" : ""}
                            onClick={() => handleSelectLiner(liner)}
                          >
                            <td className="font-bold text-primary">{liner.id} ({liner.fullCode})</td>
                            <td className="text-muted">{liner.assembly}</td>
                            <td className="mono-num text-xs font-semibold">{liner.partNo}</td>
                            <td>
                              <div className="dwms-wear-cell">
                                <div className="dwms-wear-meter">
                                  <span
                                    style={{ width: `${liner.wear}%` }}
                                    className={`meter-bar ${liner.wear > 90 ? "bg-purple" : liner.wear > 75 ? "bg-red" : liner.wear > 50 ? "bg-orange" : "bg-green"
                                      }`}
                                  />
                                </div>
                                <span className="dwms-wear-val">{liner.wear}%</span>
                              </div>
                            </td>
                            <td className="mono-num">{liner.thickness} mm</td>
                            <td className="mono-num font-semibold">{liner.rulDays} d</td>
                            <td>
                              <span className={`status-pill ${liner.status}`}>
                                {liner.status.toUpperCase()}
                              </span>
                            </td>
                            <td>
                              <button
                                className="dwms-btn dwms-btn-sm dwms-btn-outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectLiner(liner);
                                }}
                              >
                                Inspect
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* {activeTab === "twin" && (
                // 3D Isometric Digital Twin View 
                <div className="dwms-panel p-8 text-center flex flex-col items-center justify-center min-h-[420px] bg-slate-900 text-white rounded-lg">
                  <div className="relative w-72 h-72 border border-cyan-500/30 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-950/60 shadow-2xl">
                    <div className="absolute inset-2 border border-cyan-400/20 rounded pointer-events-none" />
                    <Box size={64} className="text-cyan-400 animate-pulse mb-4" />
                    <h3 className="text-base font-bold text-cyan-200">{selectedChute} — 3D Digital Twin</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                      Real-time FEA mesh wear projection & volumetric loss model
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                        {counts.healthy} Healthy
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
                        {counts.monitor + counts.action} Warning
                      </span>
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">
                        {counts.critical} Critical
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-6">
                    Click any wall in the 2D Liner Wear Map tab to inspect detailed plate thickness and wear vectors.
                  </p>
                </div>
              )} */}

              {/* Bottom Legend and Summary Bar */}
              <div className="map-footer-bar">
                <div className="footer-legend">
                  <span className="legend-pill healthy"><span className="swatch-dot healthy" /> Healthy</span>
                  <span className="legend-pill monitor"><span className="swatch-dot monitor" /> Monitor</span>
                  <span className="legend-pill action"><span className="swatch-dot action" /> Action Required</span>
                  <span className="legend-pill critical"><span className="swatch-dot critical" /> Critical</span>
                </div>

                <div className="visible-count">
                  <span>{visibleCount} visible liners</span>
                </div>
              </div>

              {/* Slide-in Right Side Panel Drawer */}
              {selectedLiner && (
                <>
                  {/* Subtle backdrop allowing click-to-close */}
                  <div
                    className="drawer-backdrop"
                    onClick={() => handleSelectLiner(null)}
                    aria-hidden="true"
                  />

                  <aside className="slide-panel" aria-label="Liner details panel">
                    {/* Top Header */}
                    <div className="panel-header">
                      <div className="panel-header-left">
                        <div className="panel-title-row">
                          <h2 className="panel-title">Liner {selectedLiner.id}</h2>
                          <span className={`status-pill ${selectedLiner.status}`}>
                            {selectedLiner.status === "action"
                              ? "ACTION REQUIRED"
                              : selectedLiner.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="panel-subtitle">
                          {selectedChute} / Assembly {selectedLiner.assembly.replace("PART NO. ", "").replace("PART No. ", "")} / Position {selectedLiner.id} · Crusher Area
                        </div>
                      </div>

                      <button
                        className="panel-close-btn"
                        onClick={() => handleSelectLiner(null)}
                        aria-label="Close panel"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Sub-Tabs: Details, Maintenance action, Manual inspection */}
                    <div className="panel-tabs">
                      <button
                        className={`panel-tab ${drawerTab === "details" ? "active" : ""}`}
                        onClick={() => setDrawerTab("details")}
                      >
                        Details
                      </button>
                      <button
                        className={`panel-tab ${drawerTab === "maintenance" ? "active" : ""}`}
                        onClick={() => setDrawerTab("maintenance")}
                      >
                        Maintenance action
                      </button>
                      <button
                        className={`panel-tab ${drawerTab === "inspection" ? "active" : ""}`}
                        onClick={() => setDrawerTab("inspection")}
                      >
                        Manual inspection
                      </button>
                    </div>

                    {/* Panel Scrollable Body */}
                    <div className="panel-body">
                      {drawerTab === "details" && (
                        <>
                          {/* Status Alert Banner */}
                          <div className={`status-banner ${selectedLiner.status}`}>
                            {selectedLiner.status === "critical" && "CRITICAL — failure imminent · replace immediately"}
                            {selectedLiner.status === "action" && "ACTION REQUIRED — schedule replacement in next shutdown"}
                            {selectedLiner.status === "monitor" && "MONITOR — continue condition monitoring"}
                            {selectedLiner.status === "healthy" && "HEALTHY — within nominal operating parameters"}
                          </div>

                          {/* Section 1: Physical identification */}
                          <div className="drawer-section">
                            <div
                              className="section-header"
                              onClick={() => toggleSection("physical")}
                            >
                              <span className="section-arrow">
                                {collapsedSections["physical"] ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                              </span>
                              <h3 className="section-title">Physical identification</h3>
                            </div>

                            {!collapsedSections["physical"] && (
                              <div className="section-content">
                                <div className="data-row">
                                  <span className="data-label">POSITION (WHERE)</span>
                                  <span className="data-val">{selectedLiner.id}</span>
                                </div>
                                <div className="data-row">
                                  <span className="data-label">ASSEMBLY (WHICH)</span>
                                  <span className="data-val">{selectedLiner.assembly}</span>
                                </div>
                                <div className="data-row">
                                  <span className="data-label">REPLACEMENT PART (WHAT)</span>
                                  <span className="data-val">{selectedLiner.partNo}</span>
                                </div>
                                <div className="data-row">
                                  <span className="data-label">DRAWING REFERENCE</span>
                                  <span className="data-val">{selectedLiner.drawingRef}</span>
                                </div>
                                <div className="data-row">
                                  <span className="data-label">INSTANCE ID</span>
                                  <span className="data-val">{selectedLiner.instanceId}</span>
                                </div>
                                <div className="data-row">
                                  <span className="data-label">ZONE</span>
                                  <span className="data-val">{selectedLiner.zone}</span>
                                </div>
                                <div className="data-row">
                                  <span className="data-label">SENSOR</span>
                                  <span className="data-val">{selectedLiner.sensorId}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Section 2: Wear information */}
                          <div className="drawer-section">
                            <div
                              className="section-header space-between"
                              onClick={() => toggleSection("wear")}
                            >
                              <div className="section-header-left">
                                <span className="section-arrow">
                                  {collapsedSections["wear"] ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                                </span>
                                <h3 className="section-title">Wear information</h3>
                              </div>

                              <div className="section-header-actions" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  className={`edit-wear-btn ${isEditingWear ? "cancel-mode" : ""}`}
                                  onClick={toggleEditWear}
                                  title={isEditingWear ? "Cancel editing parameters" : "Edit wear parameters"}
                                >
                                  {isEditingWear ? (
                                    <>
                                      <X size={12} />
                                      <span>Cancel</span>
                                    </>
                                  ) : (
                                    <>
                                      <Pencil size={12} />
                                      <span>Edit Parameters</span>
                                    </>
                                  )}
                                </button>
                                <span className="wear-stat-bold">
                                  {isEditingWear ? `${editCalculatedWear.toFixed(1)}%` : `${selectedLiner.wear.toFixed(1)}%`}
                                </span>
                              </div>
                            </div>

                            {!collapsedSections["wear"] && (
                              <div className="section-content">
                                {/* Success Toast when saved */}
                                {saveSuccessMsg && (
                                  <div className="wear-save-toast">
                                    <CheckCircle2 size={16} className="toast-icon" />
                                    <div className="toast-text-wrap">
                                      <div className="toast-title">
                                        Liner {selectedLiner.id} wear updated & saved to {dbName} (PostgreSQL)!
                                      </div>
                                      {emailStatus && (
                                        <div className="toast-email-sub">
                                          <Mail size={12} />
                                          <span>{emailStatus}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Wear Progress Meter reacting in real-time */}
                                <div className="wear-meter-wrap">
                                  <div className="wear-meter-bar">
                                    <div
                                      className="wear-meter-fill"
                                      style={{
                                        width: `${Math.min(100, Math.max(0, isEditingWear ? editCalculatedWear : selectedLiner.wear))}%`,
                                      }}
                                    />
                                  </div>
                                </div>

                                {!isEditingWear ? (
                                  /* Normal View Mode */
                                  <>
                                    <div className="data-row">
                                      <span className="data-label">ORIGINAL THICKNESS</span>
                                      <span className="data-val">{selectedLiner.origThickness} mm</span>
                                    </div>
                                    <div className="data-row highlight-row">
                                      <span className="data-label">REMAINING THICKNESS</span>
                                      <span className="data-val font-semibold">{selectedLiner.thickness.toFixed(1)} mm</span>
                                    </div>
                                    <div className="data-row">
                                      <span className="data-label">MINIMUM ACCEPTABLE</span>
                                      <span className="data-val">{selectedLiner.minAcceptable} mm</span>
                                    </div>
                                    <div className="data-row">
                                      <span className="data-label">WEAR RATE</span>
                                      <span className="data-val">{selectedLiner.wearRateDay}% /day · {selectedLiner.wearRateMonth} mm/month</span>
                                    </div>
                                    <div className="data-row highlight-row">
                                      <span className="data-label">ESTIMATED REMAINING LIFE</span>
                                      <span className="data-val font-semibold">{selectedLiner.rulDays} days</span>
                                    </div>
                                    <div className="data-row">
                                      <span className="data-label">LAST INSPECTION</span>
                                      <span className="data-val">{selectedLiner.lastInspection}</span>
                                    </div>
                                    <div className="data-row">
                                      <span className="data-label">LAST REPLACED</span>
                                      <span className="data-val">{selectedLiner.lastReplaced}</span>
                                    </div>
                                  </>
                                ) : (
                                  /* Interactive Edit Form with Live Auto-Calculation */
                                  <form
                                    className="wear-edit-form"
                                    onSubmit={(e) => {
                                      e.preventDefault();
                                      handleSaveWearEdits();
                                    }}
                                  >
                                    {/* Live Auto-Calculation Indicator Card */}
                                    <div className={`auto-calc-card status-${editCalculatedStatus}`}>
                                      <div className="calc-card-top">
                                        <div className="calc-icon-title">
                                          <Calculator size={14} />
                                          <span>Live Auto-Calculation</span>
                                        </div>
                                        <span className={`calc-status-badge ${editCalculatedStatus}`}>
                                          {editCalculatedStatus.toUpperCase()}
                                        </span>
                                      </div>

                                      <div className="calc-metrics-row">
                                        <div className="calc-metric">
                                          <span className="metric-lbl">Calculated Wear:</span>
                                          <span className="metric-val big">{editCalculatedWear.toFixed(1)}%</span>
                                        </div>
                                        <div className="calc-metric">
                                          <span className="metric-lbl">Loss Delta:</span>
                                          <span className="metric-val">
                                            {Math.max(0, Number((selectedLiner.origThickness - (parseFloat(editThickness) || 0)).toFixed(1)))} mm
                                          </span>
                                        </div>
                                        <div className="calc-metric">
                                          <span className="metric-lbl">Usable Life Left:</span>
                                          <span className="metric-val">{editRulDays || 0} days</span>
                                        </div>
                                      </div>

                                      <div className="calc-formula-hint">
                                        Formula: Wear % = ((Original {selectedLiner.origThickness}mm - Remaining) ÷ {selectedLiner.origThickness}mm) × 100
                                      </div>
                                    </div>

                                    {/* Input 1: Remaining Thickness */}
                                    <div className="edit-field-group">
                                      <div className="field-label-row">
                                        <label htmlFor="edit-remaining-thickness" className="field-label">
                                          REMAINING THICKNESS (mm) <span className="req-star">*</span>
                                        </label>
                                        <span className="field-hint">Original: {selectedLiner.origThickness} mm</span>
                                      </div>
                                      <div className="input-with-unit">
                                        <input
                                          id="edit-remaining-thickness"
                                          type="number"
                                          step="0.1"
                                          min="0"
                                          max={selectedLiner.origThickness + 10}
                                          value={editThickness}
                                          onChange={(e) => handleThicknessChange(e.target.value)}
                                          className="wear-number-input"
                                          required
                                        />
                                        <span className="input-unit">mm</span>
                                      </div>
                                    </div>

                                    {/* Input 2: Minimum Acceptable Thickness */}
                                    <div className="edit-field-group">
                                      <div className="field-label-row">
                                        <label htmlFor="edit-min-thickness" className="field-label">
                                          MINIMUM THICKNESS (mm) <span className="req-star">*</span>
                                        </label>
                                        <span className="field-hint">Critical limit</span>
                                      </div>
                                      <div className="input-with-unit">
                                        <input
                                          id="edit-min-thickness"
                                          type="number"
                                          step="0.1"
                                          min="0"
                                          max={selectedLiner.origThickness}
                                          value={editMinThickness}
                                          onChange={(e) => handleMinThicknessChange(e.target.value)}
                                          className="wear-number-input"
                                          required
                                        />
                                        <span className="input-unit">mm</span>
                                      </div>
                                    </div>

                                    {/* Input 3: Wear Rate */}
                                    <div className="edit-field-group">
                                      <div className="field-label-row">
                                        <label className="field-label">
                                          WEAR RATE <span className="req-star">*</span>
                                        </label>
                                        <span className="field-hint">Auto-syncs rate & RUL</span>
                                      </div>
                                      <div className="dual-inputs-row">
                                        <div className="input-with-unit dual-item">
                                          <input
                                            id="edit-wear-rate-month"
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            value={editWearRateMonth}
                                            onChange={(e) => handleWearRateMonthChange(e.target.value)}
                                            className="wear-number-input"
                                            placeholder="mm/month"
                                            title="Wear rate in mm per month"
                                          />
                                          <span className="input-unit">mm/mo</span>
                                        </div>
                                        <div className="input-with-unit dual-item">
                                          <input
                                            id="edit-wear-rate-day"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={editWearRateDay}
                                            onChange={(e) => handleWearRateDayChange(e.target.value)}
                                            className="wear-number-input"
                                            placeholder="%/day"
                                            title="Wear rate in % per day"
                                          />
                                          <span className="input-unit">%/day</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Input 4: Estimated Remaining Life */}
                                    <div className="edit-field-group">
                                      <div className="field-label-row">
                                        <label htmlFor="edit-rul-days" className="field-label">
                                          ESTIMATED REMAINING LIFE (days) <span className="req-star">*</span>
                                        </label>
                                        <span className="field-hint">Usable mm ÷ Daily rate</span>
                                      </div>
                                      <div className="input-with-unit">
                                        <input
                                          id="edit-rul-days"
                                          type="number"
                                          step="1"
                                          min="0"
                                          value={editRulDays}
                                          onChange={(e) => handleRulDaysChange(e.target.value)}
                                          className="wear-number-input"
                                          required
                                        />
                                        <span className="input-unit">days</span>
                                      </div>
                                    </div>

                                    {/* Automated Email Notice */}
                                    <div className="smtp-helper-badge">
                                      <Mail size={12} />
                                      <span>Saving will auto-dispatch an SMTP email alert with fleet health status</span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="wear-edit-actions">
                                      <button
                                        type="button"
                                        className="btn-reset-edits"
                                        onClick={handleResetEdits}
                                        title="Restore original values"
                                      >
                                        <RotateCcw size={12} />
                                        <span>Reset</span>
                                      </button>
                                      <button
                                        type="button"
                                        className="btn-cancel-edits"
                                        onClick={toggleEditWear}
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="submit"
                                        className="btn-save-edits"
                                      >
                                        <Check size={14} />
                                        <span>Save & Update Map</span>
                                      </button>
                                    </div>
                                  </form>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Section 3: Liner specification */}
                          <div className="drawer-section">
                            <div
                              className="section-header"
                              onClick={() => toggleSection("spec")}
                            >
                              <span className="section-arrow">
                                {collapsedSections["spec"] ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                              </span>
                              <h3 className="section-title">Liner specification</h3>
                            </div>

                            {!collapsedSections["spec"] && (
                              <div className="section-content">
                                <div className="data-row">
                                  <span className="data-label">PART NUMBER</span>
                                  <span className="data-val">{selectedLiner.partNo}</span>
                                </div>
                                <div className="data-row">
                                  <span className="data-label">LINER POSITION</span>
                                  <span className="data-val">{selectedLiner.id}</span>
                                </div>
                                <div className="data-row">
                                  <span className="data-label">MATERIAL</span>
                                  <span className="data-val">{selectedLiner.material}</span>
                                </div>
                                <div className="data-row">
                                  <span className="data-label">WEIGHT</span>
                                  <span className="data-val">{selectedLiner.weight}</span>
                                </div>
                                <div className="data-row">
                                  <span className="data-label">DIMENSIONS</span>
                                  <span className="data-val">{selectedLiner.dimensions}</span>
                                </div>
                                <div className="data-row">
                                  <span className="data-label">FIXING</span>
                                  <span className="data-val">{selectedLiner.fixing}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {/* Maintenance Action Tab */}
                      {drawerTab === "maintenance" && (
                        <div className="tab-pane">
                          <div className="action-card">
                            <div className="action-card-header">
                              <Wrench size={18} className="action-icon" />
                              <div>
                                <div className="action-wo-title">Work Order: WO-2026-8841</div>
                                <div className="action-wo-sub">Scheduled Maintenance Window</div>
                              </div>
                            </div>

                            <div className="action-details-list">
                              <div className="data-row">
                                <span className="data-label">TARGET SHUTDOWN</span>
                                <span className="data-val">Next Planned Shutdown (in 14 days)</span>
                              </div>
                              <div className="data-row">
                                <span className="data-label">RECOMMENDED ACTION</span>
                                <span className="data-val">
                                  {selectedLiner.status === "critical"
                                    ? "Replace liner plate & check backing structure"
                                    : "Inspect bolts & rotate adjacent wear plates"}
                                </span>
                              </div>
                              <div className="data-row">
                                <span className="data-label">SPARES AVAILABILITY</span>
                                <span className="data-val" style={{ color: "#16a34a" }}>
                                  6 units in stock (Warehouse A, Rack L-12)
                                </span>
                              </div>
                              <div className="data-row">
                                <span className="data-label">ESTIMATED DOWNTIME</span>
                                <span className="data-val">2.5 hours</span>
                              </div>
                            </div>

                            {orderSuccess ? (
                              <div className="order-toast">
                                <CheckCircle2 size={16} />
                                <span>Dispatch request submitted for {selectedLiner.partNo}!</span>
                              </div>
                            ) : (
                              <button className="primary-action-btn" onClick={handleRequestPart}>
                                <span>Dispatch Spares & Create Task</span>
                                <ArrowUpRight size={15} />
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Manual Inspection Tab */}
                      {drawerTab === "inspection" && (
                        <div className="tab-pane">
                          <div className="inspection-card">
                            <div className="inspection-head">
                              <ClipboardCheck size={18} className="inspection-icon" />
                              <div>
                                <div className="action-wo-title">Ultrasonic Thickness Logs</div>
                                <div className="action-wo-sub">Calibrated measurements log for {selectedLiner.id}</div>
                              </div>
                            </div>

                            <div className="table-responsive">
                              <table className="ut-table">
                                <thead>
                                  <tr>
                                    <th>Date</th>
                                    <th>Thickness</th>
                                    <th>Delta</th>
                                    <th>Inspector</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>2026-08-22</td>
                                    <td><strong>{selectedLiner.thickness.toFixed(1)} mm</strong></td>
                                    <td>-1.2 mm</td>
                                    <td>J. Doe (UT)</td>
                                  </tr>
                                  <tr>
                                    <td>2026-07-15</td>
                                    <td>15.0 mm</td>
                                    <td>-1.4 mm</td>
                                    <td>K. Patel</td>
                                  </tr>
                                  <tr>
                                    <td>2026-06-07</td>
                                    <td>{selectedLiner.origThickness} mm</td>
                                    <td>Baseline</td>
                                    <td>R. Vance</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            <form onSubmit={handleLogReading} className="log-form">
                              <div className="form-title">Log New Manual Measurement</div>
                              <div className="form-inline-row">
                                <input
                                  type="number"
                                  step="0.1"
                                  placeholder="e.g. 13.5 mm"
                                  value={newReading}
                                  onChange={(e) => setNewReading(e.target.value)}
                                  className="measure-input"
                                />
                                <button type="submit" className="save-measure-btn">
                                  <Plus size={14} />
                                  <span>Save Log</span>
                                </button>
                              </div>
                              {readingLogged && (
                                <div className="log-confirm">
                                  <CheckCircle2 size={14} /> Measurement logged and synced to DWMS telemetry.
                                </div>
                              )}
                            </form>
                          </div>
                        </div>
                      )}
                    </div>
                  </aside>
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Scoped CSS Styles for Liner Wear Map and Slide-in Panel */}
      <style jsx>{`
        .my-site-layout {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          gap: 20px;
          width: 100%;
        }

        .my-site-sidebar {
          width: 290px;
          min-width: 270px;
          flex-shrink: 0;
        }

        .my-site-content {
          flex: 1;
          min-width: 0;
        }

        @media (max-width: 960px) {
          .my-site-layout {
            flex-direction: column;
          }
          .my-site-sidebar {
            width: 100%;
            min-width: 0;
          }
        }

        .site-tree-card {
          background: #ffffff;
          border: 1px solid #d6dde1;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .site-tree-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 12px;
          border-bottom: 1px solid #eaeff1;
          margin-bottom: 12px;
        }

        .site-tree-title {
          font-size: 13.5px;
          font-weight: 700;
          color: #043541;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 0;
        }

        .site-status-tag {
          font-size: 10px;
          font-weight: 700;
          color: #065f46;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          padding: 2px 8px;
          border-radius: 9999px;
          text-transform: uppercase;
        }

        .site-legend-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
          padding-bottom: 10px;
          border-bottom: 1px solid #f1f5f7;
          font-size: 11px;
          color: #647b86;
          font-weight: 600;
        }

        .legend-dot-item {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .legend-dot.healthy { background: #10b981; }
        .legend-dot.warning { background: #f59e0b; }
        .legend-dot.critical { background: #ef4444; }

        .jh-section {
          margin-bottom: 14px;
        }

        .jh-title {
          font-size: 12px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 6px;
        }

        .floor-group {
          padding-left: 10px;
          border-left: 2px solid #e2e8f0;
          margin-bottom: 8px;
        }

        .floor-label {
          font-size: 11px;
          font-weight: 600;
          color: #647b86;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .chute-tree-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          margin-bottom: 6px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
        }

        .chute-tree-btn:hover {
          background: #edf2f7;
          border-color: #cbd5e1;
        }

        .chute-tree-btn.active {
          background: #043541;
          border-color: #043541;
          color: #ffffff;
          box-shadow: 0 2px 6px rgba(4, 53, 65, 0.25);
        }

        .chute-tree-btn .chute-code {
          font-size: 13px;
          font-weight: 800;
          color: #043541;
        }

        .chute-tree-btn.active .chute-code {
          color: #38bdf8;
        }

        .chute-badges-group {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .chute-badge-pill {
          font-size: 11px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 4px;
          line-height: 1.2;
        }

        .chute-badge-pill.healthy {
          background: #d1fae5;
          color: #065f46;
        }

        .chute-badge-pill.warning {
          background: #fef3c7;
          color: #92400e;
        }

        .chute-badge-pill.critical {
          background: #fee2e2;
          color: #991b1b;
        }

        .chute-tree-btn.active .chute-badge-pill.healthy {
          background: #059669;
          color: #ffffff;
        }

        .chute-tree-btn.active .chute-badge-pill.warning {
          background: #d97706;
          color: #ffffff;
        }

        .chute-tree-btn.active .chute-badge-pill.critical {
          background: #dc2626;
          color: #ffffff;
        }

        .liner-map-container {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        /* Subnav Tabs */
        .subnav-tabs {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 2px;
        }

        .subnav-tab {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          height: 34px;
          padding: 0 16px;
          font-size: 13px;
          font-weight: 600;
          color: #536b75;
          background: #ffffff;
          border: 1px solid #d6dde1;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .subnav-tab:hover {
          background: #f8fafb;
          color: #122d37;
        }

        .subnav-tab.active {
          background: #009fe3;
          color: #ffffff;
          border-color: #009fe3;
          box-shadow: 0 2px 6px rgba(0, 159, 227, 0.25);
        }

        /* Page Header */
        .wear-map-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .title-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .db-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 10px;
          font-size: 11.5px;
          font-weight: 600;
          border-radius: 9999px;
          letter-spacing: 0.2px;
          transition: all 0.2s ease;
        }

        .db-status-pill.connected {
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }

        .db-status-pill.offline {
          background: #fffbeb;
          color: #92400e;
          border: 1px solid #fde68a;
        }

        .db-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }

        .db-status-pill.connected .db-dot {
          background: #10b981;
          box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
        }

        .db-status-pill.offline .db-dot {
          background: #f59e0b;
        }

        .db-icon {
          opacity: 0.85;
        }

        .db-saving-tag {
          font-size: 10px;
          padding: 1px 6px;
          border-radius: 4px;
          background: #dbeafe;
          color: #1e40af;
          margin-left: 2px;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .header-h1 {
          margin: 0;
          font-size: 21px;
          font-weight: 700;
          color: #0b343f;
          line-height: 1.25;
        }

        .header-sub {
          margin: 3px 0 0;
          font-size: 13px;
          color: #6c8490;
        }

        .chute-select-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
        }

        .chute-select {
          appearance: none;
          height: 36px;
          padding: 0 34px 0 14px;
          font-size: 13px;
          font-weight: 600;
          color: #112b35;
          background: #ffffff;
          border: 1px solid #d6dde1;
          border-radius: 4px;
          cursor: pointer;
          outline: none;
        }

        .chute-select:focus {
          border-color: #009fe3;
          box-shadow: 0 0 0 3px rgba(0, 159, 227, 0.15);
        }

        :global(.select-arrow) {
          position: absolute;
          right: 12px;
          color: #647b86;
          pointer-events: none;
        }

        /* Toolbar */
        .wear-map-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          padding: 10px 14px;
          background: #ffffff;
          border: 1px solid #d6dde1;
          border-radius: 4px;
        }

        .toolbar-left,
        .toolbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        /* Sheet Badge */
        .sheet-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 4px 10px;
          background: #f1f5f7;
          border: 1px solid #d6dde1;
          border-radius: 3px;
          font-size: 11px;
        }

        .chute-id-tag {
          font-weight: 700;
          color: #07343e;
          font-family: monospace;
        }

        .sheet-meta {
          color: #6c8490;
        }

        /* View Mode Toggle */
        .view-toggle {
          display: inline-flex;
          background: #eef3f5;
          padding: 2px;
          border-radius: 4px;
        }

        .toggle-btn {
          height: 28px;
          padding: 0 12px;
          font-size: 12px;
          font-weight: 600;
          color: #4b636e;
          border: 0;
          background: transparent;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .toggle-btn.active {
          background: #009fe3;
          color: #ffffff;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        }

        /* Status Filters */
        .status-filters {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .filter-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 28px;
          padding: 0 10px;
          font-size: 12px;
          font-weight: 600;
          color: #44606c;
          background: #ffffff;
          border: 1px solid #d6dde1;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .filter-pill:hover {
          border-color: #009fe3;
          color: #009fe3;
        }

        .filter-pill.active {
          background: #07343e;
          color: #ffffff;
          border-color: #07343e;
        }

        .count-bubble {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          padding: 0 4px;
          border-radius: 9px;
          font-size: 10px;
          font-weight: 700;
          color: #ffffff;
        }

        .count-bubble.healthy { background: #10b981; }
        .count-bubble.monitor { background: #eab308; }
        .count-bubble.action { background: #f97316; }
        .count-bubble.critical { background: #ef4444; }

        /* Search input */
        .search-wrap {
          display: inline-flex;
          align-items: center;
          background: #ffffff;
          border: 1px solid #d6dde1;
          border-radius: 4px;
          overflow: hidden;
        }

        :global(.search-icon) {
          margin-left: 10px;
          color: #7b949f;
        }

        .search-input {
          height: 32px;
          padding: 0 8px;
          font-size: 12px;
          border: 0;
          outline: none;
          color: #122d37;
          width: 175px;
        }

        .search-submit-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 32px;
          padding: 0 12px;
          font-size: 12px;
          font-weight: 600;
          color: #ffffff;
          background: #009fe3;
          border: 0;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .search-submit-btn:hover {
          background: #0087bd;
        }

        /* Zoom button group */
        .zoom-btn-group {
          display: inline-flex;
          border: 1px solid #d6dde1;
          border-radius: 4px;
          overflow: hidden;
        }

        .zoom-btn-group button {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          border: 0;
          border-right: 1px solid #d6dde1;
          color: #4b636e;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: background 0.15s ease;
        }

        .zoom-btn-group button:last-child {
          border-right: 0;
        }

        .zoom-btn-group button:hover {
          background: #f1f5f7;
          color: #07343e;
        }

        /* Legend */
        .wear-map-legend {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 22px;
          font-size: 12px;
          font-weight: 600;
          color: #4b636e;
          padding: 4px 0;
        }

        .legend-entry {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .swatch {
          width: 14px;
          height: 14px;
          border-radius: 2px;
          display: inline-block;
          border: 1px solid rgba(0, 0, 0, 0.15);
        }

        .swatch.critical { background: #fce4e4; border-color: #ef4444; }
        .swatch.action { background: #fae8d8; border-color: #f97316; }
        .swatch.monitor { background: #fbf3d5; border-color: #eab308; }
        .swatch.healthy { background: #e6f9f0; border-color: #34d399; }

        /* 4 Walls Grid */
        .walls-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          transition: transform 0.25s ease;
        }

        /* Footer bar */
        .map-footer-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #ffffff;
          border: 1px solid #d6dde1;
          border-radius: 4px;
          font-size: 12px;
        }

        .footer-legend {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .legend-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #556e79;
          font-weight: 500;
        }

        .swatch-dot {
          width: 10px;
          height: 10px;
          border-radius: 2px;
        }

        .swatch-dot.healthy { background: #10b981; }
        .swatch-dot.monitor { background: #eab308; }
        .swatch-dot.action { background: #f97316; }
        .swatch-dot.critical { background: #ef4444; }

        .visible-count {
          color: #6c8490;
          font-weight: 600;
        }

        /* ========================================================
           Right Slide-In Drawer Panel Matching Reference Image
           ======================================================== */
        .drawer-backdrop {
          position: fixed;
          inset: 0;
          z-index: 65;
          background: rgba(0, 0, 0, 0.25);
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .slide-panel {
          position: fixed;
          top: 54px; /* below topbar */
          right: 0;
          bottom: 0;
          width: 440px;
          max-width: 90vw;
          background: #ffffff;
          z-index: 70;
          box-shadow: -6px 0 28px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          animation: slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          border-left: 1px solid #d6dde1;
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .panel-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 16px 20px 12px;
          background: #ffffff;
          border-bottom: 1px solid #edf1f3;
        }

        .panel-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .panel-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .panel-title {
          margin: 0;
          font-size: 19px;
          font-weight: 700;
          color: #07343e;
          letter-spacing: -0.3px;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          padding: 2px 7px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
          border: 1px solid;
        }

        .status-pill.monitor {
          background: #fbfde8;
          color: #854d0e;
          border-color: #dbe488;
        }

        .status-pill.healthy {
          background: #edfdf2;
          color: #166534;
          border-color: #86efac;
        }

        .status-pill.action {
          background: #fff7ed;
          color: #c2410c;
          border-color: #fdba74;
        }

        .status-pill.critical {
          background: #fef2f2;
          color: #b91c1c;
          border-color: #fca5a5;
        }

        .panel-subtitle {
          margin: 0;
          font-size: 11px;
          color: #647b86;
        }

        .panel-close-btn {
          border: 0;
          background: transparent;
          color: #7b949f;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .panel-close-btn:hover {
          background: #f1f5f7;
          color: #07343e;
        }

        /* Panel Tabs */
        .panel-tabs {
          display: flex;
          align-items: center;
          padding: 0 18px;
          border-bottom: 1px solid #e1e8eb;
          background: #ffffff;
          gap: 18px;
        }

        .panel-tab {
          padding: 10px 4px 8px;
          font-size: 12.5px;
          font-weight: 600;
          color: #647b86;
          border: 0;
          background: transparent;
          cursor: pointer;
          position: relative;
          transition: color 0.15s ease;
        }

        .panel-tab:hover {
          color: #07343e;
        }

        .panel-tab.active {
          color: #009fe3;
        }

        .panel-tab.active::after {
          content: "";
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: #009fe3;
        }

        /* Panel Body */
        .panel-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        /* Status Alert Banner */
        .status-banner {
          padding: 10px 14px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid;
          letter-spacing: 0.2px;
        }

        .status-banner.monitor {
          background: #f7fee7;
          color: #4d7c0f;
          border-color: #bef264;
        }

        .status-banner.healthy {
          background: #f0fdf4;
          color: #15803d;
          border-color: #86efac;
        }

        .status-banner.action {
          background: #fff7ed;
          color: #c2410c;
          border-color: #fdba74;
        }

        .status-banner.critical {
          background: #fef2f2;
          color: #b91c1c;
          border-color: #fca5a5;
        }

        /* Drawer Section */
        .drawer-section {
          display: flex;
          flex-direction: column;
          border-bottom: 1px solid #f1f4f6;
          padding-bottom: 14px;
        }

        .drawer-section:last-child {
          border-bottom: 0;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          user-select: none;
          margin-bottom: 8px;
        }

        .section-header.space-between {
          justify-content: space-between;
        }

        .section-header-left {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .section-arrow {
          color: #07343e;
          display: flex;
          align-items: center;
        }

        .section-title {
          margin: 0;
          font-size: 13px;
          font-weight: 700;
          color: #07343e;
          letter-spacing: -0.2px;
        }

        .section-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .edit-wear-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 26px;
          padding: 0 9px;
          font-size: 11px;
          font-weight: 700;
          color: #009fe3;
          background: #edf8fd;
          border: 1px solid #bce1f5;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .edit-wear-btn:hover {
          background: #009fe3;
          color: #ffffff;
          border-color: #009fe3;
          box-shadow: 0 1px 4px rgba(0, 159, 227, 0.25);
        }

        .edit-wear-btn.cancel-mode {
          color: #647b86;
          background: #f1f5f7;
          border-color: #d6dde1;
        }

        .edit-wear-btn.cancel-mode:hover {
          background: #e2e8eb;
          color: #122d37;
        }

        .wear-stat-bold {
          font-size: 16px;
          font-weight: 800;
          color: #07343e;
        }

        .section-content {
          display: flex;
          flex-direction: column;
        }

        /* Wear Save Success Toast */
        .wear-save-toast {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          padding: 10px 14px;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #065f46;
          border-radius: 4px;
          font-size: 11.5px;
          font-weight: 600;
          margin-bottom: 10px;
          animation: fadeIn 0.2s ease-out;
        }

        :global(.toast-icon) {
          margin-top: 1px;
          flex-shrink: 0;
          color: #10b981;
        }

        .toast-text-wrap {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .toast-title {
          line-height: 1.35;
        }

        .toast-email-sub {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: #047857;
          font-weight: 500;
          margin-top: 2px;
        }

        .smtp-helper-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 4px;
          font-size: 10.5px;
          color: #0369a1;
          font-weight: 500;
        }

        /* Data Key-Value Row */
        .data-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6.5px 0;
          border-bottom: 1px solid #f6f8f9;
        }

        .data-row.highlight-row {
          background: #f8fbfd;
          padding-left: 6px;
          padding-right: 6px;
          border-radius: 3px;
        }

        .data-row:last-child {
          border-bottom: 0;
        }

        .data-label {
          font-size: 10.5px;
          font-weight: 700;
          color: #6c8490;
          letter-spacing: 0.4px;
        }

        .data-val {
          font-size: 12px;
          font-weight: 600;
          color: #122d37;
          text-align: right;
        }

        .data-val.font-semibold {
          font-weight: 700;
        }

        /* Wear Meter Gradient Progress Bar */
        .wear-meter-wrap {
          margin: 4px 0 10px;
        }

        .wear-meter-bar {
          position: relative;
          width: 100%;
          height: 8px;
          background: #eef2f5;
          border-radius: 4px;
          overflow: hidden;
        }

        .wear-meter-fill {
          height: 100%;
          border-radius: 4px;
          background: linear-gradient(90deg, #10b981 0%, #eab308 50%, #f97316 75%, #ef4444 100%);
          transition: width 0.25s ease;
        }

        /* Wear Edit Form & Live Auto-Calculation Card */
        .wear-edit-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 4px;
        }

        .auto-calc-card {
          padding: 10px 12px;
          border-radius: 5px;
          margin-bottom: 2px;
          border: 1px solid #d6dde1;
          background: #f8fafb;
          transition: all 0.2s ease;
        }

        .auto-calc-card.status-healthy {
          background: #f0fdf4;
          border-color: #86efac;
        }

        .auto-calc-card.status-monitor {
          background: #fefce8;
          border-color: #fde047;
        }

        .auto-calc-card.status-action {
          background: #fff7ed;
          border-color: #fdba74;
        }

        .auto-calc-card.status-critical {
          background: #fef2f2;
          border-color: #fca5a5;
        }

        .calc-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 7px;
        }

        .calc-icon-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 700;
          color: #07343e;
        }

        .calc-status-badge {
          padding: 2px 7px;
          border-radius: 3px;
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.5px;
          border: 1px solid;
        }

        .calc-status-badge.healthy {
          background: #dcfce7;
          color: #166534;
          border-color: #86efac;
        }

        .calc-status-badge.monitor {
          background: #fef9c3;
          color: #854d0e;
          border-color: #fde047;
        }

        .calc-status-badge.action {
          background: #ffedd5;
          color: #c2410c;
          border-color: #fdba74;
        }

        .calc-status-badge.critical {
          background: #fee2e2;
          color: #991b1b;
          border-color: #fca5a5;
        }

        .calc-metrics-row {
          display: grid;
          grid-template-columns: 1.2fr 1fr 1fr;
          gap: 6px;
          padding: 6px 0;
          border-top: 1px dashed rgba(0, 0, 0, 0.08);
          border-bottom: 1px dashed rgba(0, 0, 0, 0.08);
        }

        .calc-metric {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .metric-lbl {
          font-size: 9.5px;
          color: #647b86;
          font-weight: 600;
        }

        .metric-val {
          font-size: 12px;
          font-weight: 700;
          color: #07343e;
        }

        .metric-val.big {
          font-size: 14.5px;
          color: #009fe3;
        }

        .calc-formula-hint {
          margin-top: 6px;
          font-size: 9.5px;
          color: #7b949f;
          font-style: italic;
        }

        .edit-field-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .field-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .field-label {
          font-size: 10px;
          font-weight: 700;
          color: #07343e;
          letter-spacing: 0.3px;
        }

        .req-star {
          color: #ef4444;
        }

        .field-hint {
          font-size: 9.5px;
          color: #7b949f;
        }

        .input-with-unit {
          position: relative;
          display: flex;
          align-items: center;
        }

        .wear-number-input {
          width: 100%;
          height: 33px;
          padding: 0 44px 0 10px;
          font-size: 12.5px;
          font-weight: 600;
          color: #07343e;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          outline: none;
          transition: all 0.15s ease;
        }

        .wear-number-input:focus {
          border-color: #009fe3;
          box-shadow: 0 0 0 2.5px rgba(0, 159, 227, 0.18);
        }

        .input-unit {
          position: absolute;
          right: 9px;
          font-size: 10.5px;
          font-weight: 700;
          color: #7a8f99;
          pointer-events: none;
          background: #f1f5f7;
          padding: 1px 5px;
          border-radius: 2px;
        }

        .dual-inputs-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .dual-item {
          width: 100%;
        }

        .wear-edit-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
          padding-top: 10px;
          border-top: 1px solid #edf1f3;
        }

        .btn-save-edits {
          flex: 2;
          height: 35px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: #009fe3;
          color: #ffffff;
          border: 0;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s ease, box-shadow 0.15s ease;
        }

        .btn-save-edits:hover {
          background: #0087bd;
          box-shadow: 0 2px 6px rgba(0, 159, 227, 0.3);
        }

        .btn-cancel-edits {
          flex: 1;
          height: 35px;
          background: #ffffff;
          border: 1px solid #d6dde1;
          color: #536b75;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-cancel-edits:hover {
          background: #f8fafb;
          color: #122d37;
        }

        .btn-reset-edits {
          height: 35px;
          padding: 0 10px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #ffffff;
          border: 1px solid #d6dde1;
          color: #647b86;
          border-radius: 4px;
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-reset-edits:hover {
          background: #f1f5f7;
          color: #07343e;
        }

        /* Tab Pane */
        .tab-pane {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .action-card,
        .inspection-card {
          background: #f8fafb;
          border: 1px solid #e1e8eb;
          border-radius: 6px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .action-card-header,
        .inspection-head {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e9eff2;
        }

        :global(.action-icon) {
          color: #009fe3;
        }

        :global(.inspection-icon) {
          color: #0b343f;
        }

        .action-wo-title {
          font-size: 13.5px;
          font-weight: 700;
          color: #07343e;
        }

        .action-wo-sub {
          font-size: 11px;
          color: #647b86;
        }

        .action-details-list {
          display: flex;
          flex-direction: column;
        }

        .primary-action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 38px;
          background: #009fe3;
          color: #ffffff;
          font-size: 13px;
          font-weight: 600;
          border: 0;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.15s ease;
          margin-top: 6px;
        }

        .primary-action-btn:hover {
          background: #0087bd;
        }

        .order-toast {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        /* Inspection Table */
        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }

        .ut-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11.5px;
        }

        .ut-table th {
          text-align: left;
          padding: 6px 8px;
          font-size: 10px;
          font-weight: 700;
          color: #647b86;
          border-bottom: 1px solid #d6dde1;
          letter-spacing: 0.4px;
        }

        .ut-table td {
          padding: 7px 8px;
          border-bottom: 1px solid #eef2f5;
          color: #112b35;
        }

        .log-form {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 8px;
          padding-top: 10px;
          border-top: 1px solid #e9eff2;
        }

        .form-title {
          font-size: 12px;
          font-weight: 700;
          color: #07343e;
        }

        .form-inline-row {
          display: flex;
          gap: 8px;
        }

        .measure-input {
          flex: 1;
          height: 34px;
          padding: 0 10px;
          font-size: 12px;
          border: 1px solid #d6dde1;
          border-radius: 4px;
          outline: none;
        }

        .measure-input:focus {
          border-color: #009fe3;
        }

        .save-measure-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 34px;
          padding: 0 12px;
          background: #07343e;
          color: #ffffff;
          border: 0;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .save-measure-btn:hover {
          background: #04252c;
        }

        .log-confirm {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #16a34a;
          font-weight: 600;
        }

        /* Responsive */
        @media (max-width: 1280px) {
          .walls-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .walls-grid {
            grid-template-columns: 1fr;
          }
          .toolbar-left,
          .toolbar-right {
            width: 100%;
          }
          .search-input {
            width: 100%;
          }
          .slide-panel {
            width: 100%;
          }
        }
      `}</style>
    </AppLayout>
  );
}

// Single Chute Wall Schematic Card
function ChuteWallCard({
  wall,
  viewMode,
  statusFilter,
  searchQuery,
  selectedLinerCode,
  onSelectLiner,
}: {
  wall: ChuteWall;
  viewMode: "operational" | "engineering";
  statusFilter: "all" | LinerStatus;
  searchQuery: string;
  selectedLinerCode?: string;
  onSelectLiner: (liner: LinerPlate) => void;
}) {
  // SVG Canvas Dimension
  const svgWidth = 260;
  const svgHeight = 250;
  const topY = 12;
  const bottomY = 240;
  const topWidth = 240;
  const bottomWidth = 160;
  const topStartX = (svgWidth - topWidth) / 2; // 10
  const bottomStartX = (svgWidth - bottomWidth) / 2; // 50

  const rowCount = wall.rows.length;
  const rowHeight = (bottomY - topY) / rowCount;

  // Linear interpolation for trapezoid wall boundary at given y
  const getRowBounds = (y: number) => {
    const factor = (y - topY) / (bottomY - topY);
    const startX = topStartX + (bottomStartX - topStartX) * factor;
    const width = topWidth + (bottomWidth - topWidth) * factor;
    return { startX, endX: startX + width, width };
  };

  const isPart1 =
    wall.partNumber === "PART NO. 1" ||
    wall.partNumber.toUpperCase().includes("PART NO. 1") ||
    wall.partNumber.toUpperCase().includes("PART 1") ||
    wall.title.toLowerCase().includes("part no. 1") ||
    (wall.rows.length === 3 &&
      wall.rows[0].liners.length === 4 &&
      wall.rows[1].liners.length === 4 &&
      wall.rows[2].liners.length === 2);

  const isPart2 =
    wall.partNumber === "PART NO. 2" ||
    wall.partNumber.toUpperCase().includes("PART NO. 2") ||
    wall.partNumber.toUpperCase().includes("PART 2") ||
    wall.title.toLowerCase().includes("part no. 2") ||
    (wall.rows.length === 4 &&
      wall.rows[0].liners.length === 4 &&
      wall.rows[1].liners.length === 4 &&
      wall.rows[2].liners.length === 4 &&
      wall.rows[3].liners.length === 2);

  const isPart3 =
    wall.partNumber === "PART NO. 3" ||
    wall.partNumber.toUpperCase().includes("PART NO. 3") ||
    wall.partNumber.toUpperCase().includes("PART 3") ||
    wall.title.toLowerCase().includes("part no. 3") ||
    (wall.rows.length === 3 &&
      wall.rows[0].liners.length === 3 &&
      wall.rows[1].liners.length === 3 &&
      wall.rows[2].liners.length === 2);

  return (
    <article className="chute-card">
      <div className="card-top-titles">
        <h2 className="card-part-title">{wall.partNumber}</h2>
        <p className="card-part-sub">{wall.subtitle}</p>
      </div>

      <div className="svg-container">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="wall-schematic-svg"
        >
          {/* Outer Chute Contour Boundary */}
          <polygon
            points={
              isPart3
                ? `10,${topY} 250,${topY} 200,${bottomY} 100,${bottomY}`
                : `${topStartX},${topY} ${topStartX + topWidth},${topY} ${bottomStartX + bottomWidth},${bottomY} ${bottomStartX},${bottomY}`
            }
            fill="#f4f7f9"
            stroke="#a9bac2"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Render Individual Liner Plates */}
          {wall.rows.map((row, rIdx) => {
            const isPart1Layout =
              isPart1 &&
              wall.rows.length === 3 &&
              (rIdx < 2 ? row.liners.length === 4 : row.liners.length === 2);

            const isPart2Layout =
              isPart2 &&
              wall.rows.length === 4 &&
              (rIdx < 3 ? row.liners.length === 4 : row.liners.length === 2);

            const isPart3Layout =
              isPart3 &&
              wall.rows.length === 3 &&
              (rIdx < 2 ? row.liners.length === 3 : row.liners.length === 2);

            const isCustomWallLayout = isPart1Layout || isPart2Layout || isPart3Layout;

            let rowY1 = topY + rIdx * rowHeight;
            let rowY2 = rowY1 + rowHeight;
            let leftWallTop = 0;
            let leftWallBot = 0;
            let rightWallTop = 0;
            let rightWallBot = 0;
            const xCenter = svgWidth / 2; // 130
            let xDivLeft = xCenter - 65;
            let xDivRight = xCenter + 65;
            let bounds1 = { startX: 0, endX: 0, width: 0 };
            let bounds2 = { startX: 0, endX: 0, width: 0 };
            const cols = row.liners.length;

            if (isPart1Layout) {
              const rowH = (bottomY - topY) / 3;
              rowY1 = topY + rIdx * rowH;
              rowY2 = rowY1 + rowH;
              const w1B = 75; // Increased breadth of 1B liners (from 54px to 65px)
              xDivLeft = xCenter - w1B;
              xDivRight = xCenter + w1B;
              leftWallTop = getRowBounds(rowY1).startX;
              leftWallBot = getRowBounds(rowY2).startX;
              rightWallTop = getRowBounds(rowY1).endX;
              rightWallBot = getRowBounds(rowY2).endX;
            } else if (isPart2Layout) {
              const rowH = (bottomY - topY) / 4;
              rowY1 = topY + rIdx * rowH;
              rowY2 = rowY1 + rowH;
              const w2B = 65; // Breadth of 2B liners
              xDivLeft = xCenter - w2B;
              xDivRight = xCenter + w2B;
              leftWallTop = getRowBounds(rowY1).startX;
              leftWallBot = getRowBounds(rowY2).startX;
              rightWallTop = getRowBounds(rowY1).endX;
              rightWallBot = getRowBounds(rowY2).endX;
            } else if (isPart3Layout) {
              const r0H = 68;
              const r1H = 68;
              if (rIdx === 0) {
                rowY1 = topY;
                rowY2 = topY + r0H;
              } else if (rIdx === 1) {
                rowY1 = topY + r0H;
                rowY2 = topY + r0H + r1H;
              } else {
                rowY1 = topY + r0H + r1H;
                rowY2 = bottomY;
              }
              const getPart3Left = (y: number) => 10 + (90 * (y - topY)) / (bottomY - topY);
              const getPart3Right = (y: number) => 250 - (50 * (y - topY)) / (bottomY - topY);
              leftWallTop = getPart3Left(rowY1);
              leftWallBot = getPart3Left(rowY2);
              rightWallTop = getPart3Right(rowY1);
              rightWallBot = getPart3Right(rowY2);
              xDivLeft = 105;
              xDivRight = 195;
            } else {
              bounds1 = getRowBounds(rowY1);
              bounds2 = getRowBounds(rowY2);
            }

            return row.liners.map((liner, cIdx) => {
              let x1Top: number;
              let x2Top: number;
              let x1Bot: number;
              let x2Bot: number;
              const gridLines: string[] = [];
              const boltPoints: [number, number][] = [];

              if (isPart1Layout) {
                const yTopBolt = rowY1 + 12;
                const yMidBolt = rowY1 + (rowY2 - rowY1) / 2;
                const yBotBolt = rowY2 - 12;

                if (rIdx === 0) {
                  if (cIdx === 0) {
                    // 1A (slanted outer left, vertical inner right)
                    x1Top = leftWallTop;
                    x2Top = xDivLeft;
                    x1Bot = leftWallBot;
                    x2Bot = xDivLeft;

                    const xRightBolt = xDivLeft - 9;
                    const xLeftBoltTop = getRowBounds(yTopBolt).startX + 9;
                    const xLeftBoltMid = getRowBounds(yMidBolt).startX + 9;
                    const xLeftBoltBot = getRowBounds(yBotBolt).startX + 9;

                    boltPoints.push(
                      [xLeftBoltTop, yTopBolt], [xRightBolt, yTopBolt],
                      [xLeftBoltMid, yMidBolt], [xRightBolt, yMidBolt],
                      [xLeftBoltBot, yBotBolt], [xRightBolt, yBotBolt]
                    );

                    gridLines.push(
                      `M ${xLeftBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yTopBolt.toFixed(1)}`,
                      `M ${xLeftBoltMid.toFixed(1)} ${yMidBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yMidBolt.toFixed(1)}`,
                      `M ${xLeftBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xLeftBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xLeftBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xRightBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`
                    );
                  } else if (cIdx === 1) {
                    // 1B (left rectangle)
                    x1Top = xDivLeft;
                    x2Top = xCenter;
                    x1Bot = xDivLeft;
                    x2Bot = xCenter;

                    const xLeftBolt = xDivLeft + 12;
                    const xRightBolt = xCenter - 12;

                    boltPoints.push(
                      [xLeftBolt, yTopBolt], [xRightBolt, yTopBolt],
                      [xLeftBolt, yMidBolt], [xRightBolt, yMidBolt],
                      [xLeftBolt, yBotBolt], [xRightBolt, yBotBolt]
                    );

                    gridLines.push(
                      `M ${xLeftBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yTopBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yMidBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yMidBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yBotBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xLeftBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xRightBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`
                    );
                  } else if (cIdx === 2) {
                    // 1B (right rectangle)
                    x1Top = xCenter;
                    x2Top = xDivRight;
                    x1Bot = xCenter;
                    x2Bot = xDivRight;

                    const xLeftBolt = xCenter + 12;
                    const xRightBolt = xDivRight - 12;

                    boltPoints.push(
                      [xLeftBolt, yTopBolt], [xRightBolt, yTopBolt],
                      [xLeftBolt, yMidBolt], [xRightBolt, yMidBolt],
                      [xLeftBolt, yBotBolt], [xRightBolt, yBotBolt]
                    );

                    gridLines.push(
                      `M ${xLeftBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yTopBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yMidBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yMidBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yBotBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xLeftBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xRightBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`
                    );
                  } else {
                    // 1C (vertical inner left, slanted outer right)
                    x1Top = xDivRight;
                    x2Top = rightWallTop;
                    x1Bot = xDivRight;
                    x2Bot = rightWallBot;

                    const xLeftBolt = xDivRight + 9;
                    const xRightBoltTop = getRowBounds(yTopBolt).endX - 9;
                    const xRightBoltMid = getRowBounds(yMidBolt).endX - 9;
                    const xRightBoltBot = getRowBounds(yBotBolt).endX - 9;

                    boltPoints.push(
                      [xLeftBolt, yTopBolt], [xRightBoltTop, yTopBolt],
                      [xLeftBolt, yMidBolt], [xRightBoltMid, yMidBolt],
                      [xLeftBolt, yBotBolt], [xRightBoltBot, yBotBolt]
                    );

                    gridLines.push(
                      `M ${xLeftBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yMidBolt.toFixed(1)} L ${xRightBoltMid.toFixed(1)} ${yMidBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yBotBolt.toFixed(1)} L ${xRightBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xLeftBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xRightBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)}`
                    );
                  }
                } else if (rIdx === 1) {
                  if (cIdx === 0) {
                    // 1D (slanted outer left, vertical inner right)
                    x1Top = leftWallTop;
                    x2Top = xDivLeft;
                    x1Bot = leftWallBot;
                    x2Bot = xDivLeft;

                    const xRightBolt = xDivLeft - 9;
                    const xLeftBoltTop = getRowBounds(yTopBolt).startX + 9;
                    const xLeftBoltMid = getRowBounds(yMidBolt).startX + 9;
                    const xLeftBoltBot = getRowBounds(yBotBolt).startX + 9;

                    boltPoints.push(
                      [xLeftBoltTop, yTopBolt], [xRightBolt, yTopBolt],
                      [xLeftBoltMid, yMidBolt], [xRightBolt, yMidBolt],
                      [xLeftBoltBot, yBotBolt], [xRightBolt, yBotBolt]
                    );

                    gridLines.push(
                      `M ${xLeftBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yTopBolt.toFixed(1)}`,
                      `M ${xLeftBoltMid.toFixed(1)} ${yMidBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yMidBolt.toFixed(1)}`,
                      `M ${xLeftBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xLeftBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xLeftBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xRightBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`
                    );
                  } else if (cIdx === 1) {
                    // 1B (left rectangle)
                    x1Top = xDivLeft;
                    x2Top = xCenter;
                    x1Bot = xDivLeft;
                    x2Bot = xCenter;

                    const xLeftBolt = xDivLeft + 12;
                    const xRightBolt = xCenter - 12;

                    boltPoints.push(
                      [xLeftBolt, yTopBolt], [xRightBolt, yTopBolt],
                      [xLeftBolt, yMidBolt], [xRightBolt, yMidBolt],
                      [xLeftBolt, yBotBolt], [xRightBolt, yBotBolt]
                    );

                    gridLines.push(
                      `M ${xLeftBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yTopBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yMidBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yMidBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yBotBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xLeftBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xRightBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`
                    );
                  } else if (cIdx === 2) {
                    // 1B (right rectangle)
                    x1Top = xCenter;
                    x2Top = xDivRight;
                    x1Bot = xCenter;
                    x2Bot = xDivRight;

                    const xLeftBolt = xCenter + 12;
                    const xRightBolt = xDivRight - 12;

                    boltPoints.push(
                      [xLeftBolt, yTopBolt], [xRightBolt, yTopBolt],
                      [xLeftBolt, yMidBolt], [xRightBolt, yMidBolt],
                      [xLeftBolt, yBotBolt], [xRightBolt, yBotBolt]
                    );

                    gridLines.push(
                      `M ${xLeftBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yTopBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yMidBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yMidBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yBotBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xLeftBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xRightBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`
                    );
                  } else {
                    // 1E (vertical inner left, slanted outer right)
                    x1Top = xDivRight;
                    x2Top = rightWallTop;
                    x1Bot = xDivRight;
                    x2Bot = rightWallBot;

                    const xLeftBolt = xDivRight + 9;
                    const xRightBoltTop = getRowBounds(yTopBolt).endX - 9;
                    const xRightBoltMid = getRowBounds(yMidBolt).endX - 9;
                    const xRightBoltBot = getRowBounds(yBotBolt).endX - 9;

                    boltPoints.push(
                      [xLeftBolt, yTopBolt], [xRightBoltTop, yTopBolt],
                      [xLeftBolt, yMidBolt], [xRightBoltMid, yMidBolt],
                      [xLeftBolt, yBotBolt], [xRightBoltBot, yBotBolt]
                    );

                    gridLines.push(
                      `M ${xLeftBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yMidBolt.toFixed(1)} L ${xRightBoltMid.toFixed(1)} ${yMidBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yBotBolt.toFixed(1)} L ${xRightBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xLeftBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xRightBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)}`
                    );
                  }
                } else {
                  // rIdx === 2 (bottom row: 1F, 1G - 3 columns of bolts)
                  if (cIdx === 0) {
                    // 1F (slanted outer left, vertical inner right at centerline)
                    x1Top = leftWallTop;
                    x2Top = xCenter;
                    x1Bot = leftWallBot;
                    x2Bot = xCenter;

                    const xRightBolt = xCenter - 10;
                    const xLeftBoltTop = getRowBounds(yTopBolt).startX + 9;
                    const xLeftBoltMid = getRowBounds(yMidBolt).startX + 9;
                    const xLeftBoltBot = getRowBounds(yBotBolt).startX + 9;
                    const xMidBoltTop = (xLeftBoltTop + xRightBolt) / 2;
                    const xMidBoltMid = (xLeftBoltMid + xRightBolt) / 2;
                    const xMidBoltBot = (xLeftBoltBot + xRightBolt) / 2;

                    boltPoints.push(
                      [xLeftBoltTop, yTopBolt], [xMidBoltTop, yTopBolt], [xRightBolt, yTopBolt],
                      [xLeftBoltMid, yMidBolt], [xMidBoltMid, yMidBolt], [xRightBolt, yMidBolt],
                      [xLeftBoltBot, yBotBolt], [xMidBoltBot, yBotBolt], [xRightBolt, yBotBolt]
                    );

                    gridLines.push(
                      `M ${xLeftBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yTopBolt.toFixed(1)}`,
                      `M ${xLeftBoltMid.toFixed(1)} ${yMidBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yMidBolt.toFixed(1)}`,
                      `M ${xLeftBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xLeftBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xLeftBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xMidBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xMidBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xRightBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`
                    );
                  } else {
                    // 1G (vertical inner left at centerline, slanted outer right)
                    x1Top = xCenter;
                    x2Top = rightWallTop;
                    x1Bot = xCenter;
                    x2Bot = rightWallBot;

                    const xLeftBolt = xCenter + 10;
                    const xRightBoltTop = getRowBounds(yTopBolt).endX - 9;
                    const xRightBoltMid = getRowBounds(yMidBolt).endX - 9;
                    const xRightBoltBot = getRowBounds(yBotBolt).endX - 9;
                    const xMidBoltTop = (xLeftBolt + xRightBoltTop) / 2;
                    const xMidBoltMid = (xLeftBolt + xRightBoltMid) / 2;
                    const xMidBoltBot = (xLeftBolt + xRightBoltBot) / 2;

                    boltPoints.push(
                      [xLeftBolt, yTopBolt], [xMidBoltTop, yTopBolt], [xRightBoltTop, yTopBolt],
                      [xLeftBolt, yMidBolt], [xMidBoltMid, yMidBolt], [xRightBoltMid, yMidBolt],
                      [xLeftBolt, yBotBolt], [xMidBoltBot, yBotBolt], [xRightBoltBot, yBotBolt]
                    );

                    gridLines.push(
                      `M ${xLeftBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yMidBolt.toFixed(1)} L ${xRightBoltMid.toFixed(1)} ${yMidBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yBotBolt.toFixed(1)} L ${xRightBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xLeftBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xMidBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xMidBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xRightBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)}`
                    );
                  }
                }
              } else if (isPart2Layout) {
                const yTopBolt = rowY1 + 10;
                const yBotBolt = rowY2 - 10;

                if (rIdx < 3) {
                  // Rows 0, 1, 2 (4 columns: Outer Left, 2B, 2B, Outer Right)
                  if (cIdx === 0) {
                    // Outer Left: 2A, 2D, 2F
                    x1Top = leftWallTop;
                    x2Top = xDivLeft;
                    x1Bot = leftWallBot;
                    x2Bot = xDivLeft;

                    const xRightBolt = xDivLeft - 9;
                    const xLeftBoltTop = getRowBounds(yTopBolt).startX + 9;
                    const xLeftBoltBot = getRowBounds(yBotBolt).startX + 9;

                    boltPoints.push(
                      [xLeftBoltTop, yTopBolt], [xRightBolt, yTopBolt],
                      [xLeftBoltBot, yBotBolt], [xRightBolt, yBotBolt]
                    );

                    gridLines.push(
                      `M ${xLeftBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yTopBolt.toFixed(1)}`,
                      `M ${xLeftBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xLeftBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xLeftBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xRightBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`
                    );
                  } else if (cIdx === 1) {
                    // Center Left: 2B (rectangular plate)
                    x1Top = xDivLeft;
                    x2Top = xCenter;
                    x1Bot = xDivLeft;
                    x2Bot = xCenter;

                    const xLeftBolt = xDivLeft + 12;
                    const xRightBolt = xCenter - 12;
                    const xMidBolt = (xLeftBolt + xRightBolt) / 2;

                    boltPoints.push(
                      [xLeftBolt, yTopBolt], [xMidBolt, yTopBolt], [xRightBolt, yTopBolt],
                      [xLeftBolt, yBotBolt], [xMidBolt, yBotBolt], [xRightBolt, yBotBolt]
                    );

                    gridLines.push(
                      `M ${xLeftBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yTopBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yBotBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xLeftBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xMidBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xMidBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xRightBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`
                    );
                  } else if (cIdx === 2) {
                    // Center Right: 2B (rectangular plate)
                    x1Top = xCenter;
                    x2Top = xDivRight;
                    x1Bot = xCenter;
                    x2Bot = xDivRight;

                    const xLeftBolt = xCenter + 12;
                    const xRightBolt = xDivRight - 12;
                    const xMidBolt = (xLeftBolt + xRightBolt) / 2;

                    boltPoints.push(
                      [xLeftBolt, yTopBolt], [xMidBolt, yTopBolt], [xRightBolt, yTopBolt],
                      [xLeftBolt, yBotBolt], [xMidBolt, yBotBolt], [xRightBolt, yBotBolt]
                    );

                    gridLines.push(
                      `M ${xLeftBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yTopBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yBotBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xLeftBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xMidBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xMidBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xRightBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`
                    );
                  } else {
                    // Outer Right: 2C, 2E, 2G
                    x1Top = xDivRight;
                    x2Top = rightWallTop;
                    x1Bot = xDivRight;
                    x2Bot = rightWallBot;

                    const xLeftBolt = xDivRight + 9;
                    const xRightBoltTop = getRowBounds(yTopBolt).endX - 9;
                    const xRightBoltBot = getRowBounds(yBotBolt).endX - 9;

                    boltPoints.push(
                      [xLeftBolt, yTopBolt], [xRightBoltTop, yTopBolt],
                      [xLeftBolt, yBotBolt], [xRightBoltBot, yBotBolt]
                    );

                    gridLines.push(
                      `M ${xLeftBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yBotBolt.toFixed(1)} L ${xRightBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xLeftBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xRightBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)}`
                    );
                  }
                } else {
                  // Row 3 (rIdx === 3): 2H, 2J (2 columns, 3 bolts across)
                  if (cIdx === 0) {
                    // 2H
                    x1Top = leftWallTop;
                    x2Top = xCenter;
                    x1Bot = leftWallBot;
                    x2Bot = xCenter;

                    const xRightBolt = xCenter - 10;
                    const xLeftBoltTop = getRowBounds(yTopBolt).startX + 9;
                    const xLeftBoltBot = getRowBounds(yBotBolt).startX + 9;
                    const xMidBoltTop = (xLeftBoltTop + xRightBolt) / 2;
                    const xMidBoltBot = (xLeftBoltBot + xRightBolt) / 2;

                    boltPoints.push(
                      [xLeftBoltTop, yTopBolt], [xMidBoltTop, yTopBolt], [xRightBolt, yTopBolt],
                      [xLeftBoltBot, yBotBolt], [xMidBoltBot, yBotBolt], [xRightBolt, yBotBolt]
                    );

                    gridLines.push(
                      `M ${xLeftBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yTopBolt.toFixed(1)}`,
                      `M ${xLeftBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xLeftBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xLeftBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xMidBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xMidBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xRightBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`
                    );
                  } else {
                    // 2J
                    x1Top = xCenter;
                    x2Top = rightWallTop;
                    x1Bot = xCenter;
                    x2Bot = rightWallBot;

                    const xLeftBolt = xCenter + 10;
                    const xRightBoltTop = getRowBounds(yTopBolt).endX - 9;
                    const xRightBoltBot = getRowBounds(yBotBolt).endX - 9;
                    const xMidBoltTop = (xLeftBolt + xRightBoltTop) / 2;
                    const xMidBoltBot = (xLeftBolt + xRightBoltBot) / 2;

                    boltPoints.push(
                      [xLeftBolt, yTopBolt], [xMidBoltTop, yTopBolt], [xRightBoltTop, yTopBolt],
                      [xLeftBolt, yBotBolt], [xMidBoltBot, yBotBolt], [xRightBoltBot, yBotBolt]
                    );

                    gridLines.push(
                      `M ${xLeftBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yBotBolt.toFixed(1)} L ${xRightBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xLeftBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xMidBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xMidBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xRightBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)}`
                    );
                  }
                }
              } else if (isPart3Layout) {
                const getPart3Left = (y: number) => 10 + (90 * (y - topY)) / (bottomY - topY);
                const getPart3Right = (y: number) => 250 - (50 * (y - topY)) / (bottomY - topY);
                const xDivCenter = 150;
                const yTopBolt = rowY1 + (rIdx === 2 ? 14 : 10);
                const yMidBolt = rowY1 + (rowY2 - rowY1) / 2;
                const yBotBolt = rowY2 - (rIdx === 2 ? 14 : 10);

                if (rIdx === 0) {
                  // Row 0: 3A, 3B, 3C
                  if (cIdx === 0) {
                    // 3A (Outer Left)
                    x1Top = leftWallTop;
                    x2Top = xDivLeft;
                    x1Bot = leftWallBot;
                    x2Bot = xDivLeft;

                    const xRightBolt = xDivLeft - 10;
                    const xLeftBoltTop = getPart3Left(yTopBolt) + 10;
                    const xLeftBoltMid = getPart3Left(yMidBolt) + 10;
                    const xLeftBoltBot = getPart3Left(yBotBolt) + 10;
                    const xMidBolt = 65;

                    boltPoints.push(
                      [xLeftBoltTop, yTopBolt], [xMidBolt, yTopBolt], [xRightBolt, yTopBolt],
                      [xLeftBoltMid, yMidBolt], [xMidBolt, yMidBolt], [xRightBolt, yMidBolt],
                      [xLeftBoltBot, yBotBolt], [xMidBolt, yBotBolt], [xRightBolt, yBotBolt]
                    );

                    gridLines.push(
                      `M ${xLeftBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yTopBolt.toFixed(1)}`,
                      `M ${xLeftBoltMid.toFixed(1)} ${yMidBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yMidBolt.toFixed(1)}`,
                      `M ${xLeftBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xLeftBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xLeftBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xMidBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xMidBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xRightBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`
                    );
                  } else if (cIdx === 1) {
                    // 3B (Center Rectangle)
                    x1Top = xDivLeft;
                    x2Top = xDivRight;
                    x1Bot = xDivLeft;
                    x2Bot = xDivRight;

                    const xLeftBolt = xDivLeft + 12;
                    const xMidBolt = xDivCenter;
                    const xRightBolt = xDivRight - 12;

                    boltPoints.push(
                      [xLeftBolt, yTopBolt], [xMidBolt, yTopBolt], [xRightBolt, yTopBolt],
                      [xLeftBolt, yMidBolt], [xMidBolt, yMidBolt], [xRightBolt, yMidBolt],
                      [xLeftBolt, yBotBolt], [xMidBolt, yBotBolt], [xRightBolt, yBotBolt]
                    );

                    gridLines.push(
                      `M ${xLeftBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yTopBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yMidBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yMidBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yBotBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xLeftBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xMidBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xMidBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xRightBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`
                    );
                  } else {
                    // 3C (Outer Right)
                    x1Top = xDivRight;
                    x2Top = rightWallTop;
                    x1Bot = xDivRight;
                    x2Bot = rightWallBot;

                    const xLeftBolt = xDivRight + 10;
                    const xRightBoltTop = getPart3Right(yTopBolt) - 10;
                    const xRightBoltMid = getPart3Right(yMidBolt) - 10;
                    const xRightBoltBot = getPart3Right(yBotBolt) - 10;

                    boltPoints.push(
                      [xLeftBolt, yTopBolt], [xRightBoltTop, yTopBolt],
                      [xLeftBolt, yMidBolt], [xRightBoltMid, yMidBolt],
                      [xLeftBolt, yBotBolt], [xRightBoltBot, yBotBolt]
                    );

                    gridLines.push(
                      `M ${xLeftBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yMidBolt.toFixed(1)} L ${xRightBoltMid.toFixed(1)} ${yMidBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yBotBolt.toFixed(1)} L ${xRightBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xLeftBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xRightBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)}`
                    );
                  }
                } else if (rIdx === 1) {
                  // Row 1: 3D, 3B, 3E
                  if (cIdx === 0) {
                    // 3D (Outer Left)
                    x1Top = leftWallTop;
                    x2Top = xDivLeft;
                    x1Bot = leftWallBot;
                    x2Bot = xDivLeft;

                    const xRightBolt = xDivLeft - 10;
                    const xLeftBoltTop = getPart3Left(yTopBolt) + 10;
                    const xLeftBoltMid = getPart3Left(yMidBolt) + 10;
                    const xLeftBoltBot = getPart3Left(yBotBolt) + 10;
                    const xMidBolt = (xLeftBoltMid + xRightBolt) / 2;

                    boltPoints.push(
                      [xLeftBoltTop, yTopBolt], [xRightBolt, yTopBolt],
                      [xLeftBoltMid, yMidBolt], [xMidBolt, yMidBolt], [xRightBolt, yMidBolt],
                      [xLeftBoltBot, yBotBolt], [xRightBolt, yBotBolt]
                    );

                    gridLines.push(
                      `M ${xLeftBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yTopBolt.toFixed(1)}`,
                      `M ${xLeftBoltMid.toFixed(1)} ${yMidBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yMidBolt.toFixed(1)}`,
                      `M ${xLeftBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xLeftBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xLeftBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xRightBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`
                    );
                  } else if (cIdx === 1) {
                    // 3B (Center Rectangle)
                    x1Top = xDivLeft;
                    x2Top = xDivRight;
                    x1Bot = xDivLeft;
                    x2Bot = xDivRight;

                    const xLeftBolt = xDivLeft + 12;
                    const xMidBolt = xDivCenter;
                    const xRightBolt = xDivRight - 12;

                    boltPoints.push(
                      [xLeftBolt, yTopBolt], [xMidBolt, yTopBolt], [xRightBolt, yTopBolt],
                      [xLeftBolt, yMidBolt], [xMidBolt, yMidBolt], [xRightBolt, yMidBolt],
                      [xLeftBolt, yBotBolt], [xMidBolt, yBotBolt], [xRightBolt, yBotBolt]
                    );

                    gridLines.push(
                      `M ${xLeftBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yTopBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yMidBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yMidBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yBotBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xLeftBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xMidBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xMidBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xRightBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`
                    );
                  } else {
                    // 3E (Outer Right)
                    x1Top = xDivRight;
                    x2Top = rightWallTop;
                    x1Bot = xDivRight;
                    x2Bot = rightWallBot;

                    const xLeftBolt = xDivRight + 10;
                    const xRightBoltTop = getPart3Right(yTopBolt) - 10;
                    const xRightBoltMid = getPart3Right(yMidBolt) - 10;
                    const xRightBoltBot = getPart3Right(yBotBolt) - 10;

                    boltPoints.push(
                      [xLeftBolt, yTopBolt], [xRightBoltTop, yTopBolt],
                      [xLeftBolt, yMidBolt], [xRightBoltMid, yMidBolt],
                      [xLeftBolt, yBotBolt], [xRightBoltBot, yBotBolt]
                    );

                    gridLines.push(
                      `M ${xLeftBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yMidBolt.toFixed(1)} L ${xRightBoltMid.toFixed(1)} ${yMidBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yBotBolt.toFixed(1)} L ${xRightBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xLeftBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xRightBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)}`
                    );
                  }
                } else {
                  // Row 2: 3F, 3G
                  if (cIdx === 0) {
                    // 3F (Left half)
                    x1Top = leftWallTop;
                    x2Top = xDivCenter;
                    x1Bot = leftWallBot;
                    x2Bot = xDivCenter;

                    const xRightBolt = xDivCenter - 10;
                    const xLeftBoltTop = getPart3Left(yTopBolt) + 10;
                    const xLeftBoltMid = getPart3Left(yMidBolt) + 10;
                    const xLeftBoltBot = getPart3Left(yBotBolt) + 10;

                    boltPoints.push(
                      [xLeftBoltTop, yTopBolt], [xRightBolt, yTopBolt],
                      [xLeftBoltMid, yMidBolt], [xRightBolt, yMidBolt],
                      [xLeftBoltBot, yBotBolt], [xRightBolt, yBotBolt]
                    );

                    gridLines.push(
                      `M ${xLeftBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yTopBolt.toFixed(1)}`,
                      `M ${xLeftBoltMid.toFixed(1)} ${yMidBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yMidBolt.toFixed(1)}`,
                      `M ${xLeftBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xLeftBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xLeftBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xRightBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`
                    );
                  } else {
                    // 3G (Right half)
                    x1Top = xDivCenter;
                    x2Top = rightWallTop;
                    x1Bot = xDivCenter;
                    x2Bot = rightWallBot;

                    const xLeftBolt = xDivCenter + 10;
                    const xRightBoltTop = getPart3Right(yTopBolt) - 10;
                    const xRightBoltMid = getPart3Right(yMidBolt) - 10;
                    const xRightBoltBot = getPart3Right(yBotBolt) - 10;

                    boltPoints.push(
                      [xLeftBolt, yTopBolt], [xRightBoltTop, yTopBolt],
                      [xLeftBolt, yMidBolt], [xRightBoltMid, yMidBolt],
                      [xLeftBolt, yBotBolt], [xRightBoltBot, yBotBolt]
                    );

                    gridLines.push(
                      `M ${xLeftBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yMidBolt.toFixed(1)} L ${xRightBoltMid.toFixed(1)} ${yMidBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yBotBolt.toFixed(1)} L ${xRightBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xLeftBolt.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xLeftBolt.toFixed(1)} ${yBotBolt.toFixed(1)}`,
                      `M ${xRightBoltTop.toFixed(1)} ${yTopBolt.toFixed(1)} L ${xRightBoltBot.toFixed(1)} ${yBotBolt.toFixed(1)}`
                    );
                  }
                }
              } else {
                x1Top = bounds1.startX + (cIdx / cols) * bounds1.width;
                x2Top = bounds1.startX + ((cIdx + 1) / cols) * bounds1.width;
                x1Bot = bounds2.startX + (cIdx / cols) * bounds2.width;
                x2Bot = bounds2.startX + ((cIdx + 1) / cols) * bounds2.width;
              }

              // Polygon coordinates for this liner plate
              const points = `${(x1Top + 0.8).toFixed(1)},${(rowY1 + 0.8).toFixed(1)} ${(x2Top - 0.8).toFixed(1)},${(rowY1 + 0.8).toFixed(1)} ${(x2Bot - 0.8).toFixed(1)},${(rowY2 - 0.8).toFixed(1)} ${(x1Bot + 0.8).toFixed(1)},${(rowY2 - 0.8).toFixed(1)}`;

              // Centroid for text labels
              const midX = (x1Top + x2Top + x1Bot + x2Bot) / 4;
              const midY = (rowY1 + rowY2) / 2;

              // Filter and Search Matching
              const style = statusStyles[liner.status];
              const matchesFilter = statusFilter === "all" || liner.status === statusFilter;
              const query = searchQuery.trim().toLowerCase();
              const matchesSearch =
                !query ||
                liner.id.toLowerCase().includes(query) ||
                liner.fullCode.toLowerCase().includes(query) ||
                liner.partNo.toLowerCase().includes(query);

              const isDimmed = !matchesFilter || !matchesSearch;
              const isSearchHit = query && matchesSearch;
              const isSelected = selectedLinerCode === liner.fullCode;

              return (
                <g
                  key={`${liner.id}-${rIdx}-${cIdx}`}
                  className={`liner-group ${isDimmed ? "dimmed" : ""} ${isSearchHit ? "search-hit" : ""} ${isSelected ? "selected-liner" : ""}`}
                  onClick={() => onSelectLiner(liner)}
                >
                  <polygon
                    points={points}
                    fill={style.fill}
                    stroke={isSelected ? "#009fe3" : isSearchHit ? "#009fe3" : style.stroke}
                    strokeWidth={isSelected ? "3" : isSearchHit ? "2.5" : "1.2"}
                    className="liner-polygon"
                  />

                  {/* Inner Structural Bolt Lines & Centerlines (Part 1 and Part 2 Blueprint layouts) */}
                  {isCustomWallLayout && (
                    <g className="inner-lines" pointerEvents="none" opacity={isDimmed ? "0.3" : "0.75"}>
                      {gridLines.map((d, i) => (
                        <path
                          key={`gl-${i}`}
                          d={d}
                          stroke={style.text}
                          strokeWidth="0.75"
                          strokeDasharray="4 2 1 2"
                          opacity="0.45"
                          fill="none"
                        />
                      ))}
                      {boltPoints.map(([bx, by], bi) => (
                        <g key={`bp-${bi}`} opacity="0.65">
                          <line
                            x1={(bx - 2.5).toFixed(1)}
                            y1={by.toFixed(1)}
                            x2={(bx + 2.5).toFixed(1)}
                            y2={by.toFixed(1)}
                            stroke={style.text}
                            strokeWidth="1.1"
                          />
                          <line
                            x1={bx.toFixed(1)}
                            y1={(by - 2.5).toFixed(1)}
                            x2={bx.toFixed(1)}
                            y2={(by + 2.5).toFixed(1)}
                            stroke={style.text}
                            strokeWidth="1.1"
                          />
                        </g>
                      ))}
                    </g>
                  )}

                  {/* Liner Identifier & Wear Reading */}
                  {isCustomWallLayout ? (
                    <g className="liner-label-group" pointerEvents="none">
                      {/* Circular balloon badge matching CAD drawing (1A, 1B, 2A, 2B, etc) */}
                      <circle
                        cx={midX.toFixed(1)}
                        cy={(midY - (isPart2Layout ? 3.5 : 4)).toFixed(1)}
                        r={isPart2Layout ? "9.5" : "10"}
                        fill="#ffffff"
                        stroke={isSelected ? "#009fe3" : isSearchHit ? "#009fe3" : style.stroke}
                        strokeWidth="1.2"
                      />
                      <text
                        x={midX}
                        y={midY - (isPart2Layout ? 0 : 0.5)}
                        textAnchor="middle"
                        fill={style.text}
                        className="liner-id-text"
                        style={{ fontSize: isPart2Layout ? "9px" : "9.5px", fontWeight: 800 }}
                      >
                        {liner.id}
                      </text>
                      {/* Wear percentage or remaining thickness */}
                      <text
                        x={midX}
                        y={midY + (isPart2Layout ? 15.5 : 16)}
                        textAnchor="middle"
                        fill={style.text}
                        className="liner-val-text"
                        style={{ fontSize: isPart2Layout ? "8.5px" : "9px", fontWeight: 700 }}
                      >
                        {viewMode === "operational" ? `${liner.wear.toFixed(0)}%` : `${liner.thickness.toFixed(0)}mm`}
                      </text>
                    </g>
                  ) : (
                    <>
                      {/* Standard text for other walls */}
                      <text
                        x={midX}
                        y={midY - 4}
                        textAnchor="middle"
                        fill={style.text}
                        className="liner-id-text"
                      >
                        {liner.id}
                      </text>
                      <text
                        x={midX}
                        y={midY + 11}
                        textAnchor="middle"
                        fill={style.text}
                        className="liner-val-text"
                      >
                        {viewMode === "operational" ? `${liner.wear.toFixed(0)}%` : `${liner.thickness.toFixed(0)}mm`}
                      </text>
                    </>
                  )}
                </g>
              );
            });
          })}
        </svg>
      </div>

      <style jsx>{`
        .chute-card {
          background: #ffffff;
          border: 1px solid #d6dde1;
          border-radius: 4px;
          padding: 18px 14px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .card-top-titles {
          text-align: center;
          margin-bottom: 12px;
        }

        .card-part-title {
          margin: 0;
          font-size: 13px;
          font-weight: 800;
          color: #0b343f;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .card-part-sub {
          margin: 2px 0 0;
          font-size: 11px;
          color: #71858e;
        }

        .svg-container {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .wall-schematic-svg {
          width: 100%;
          max-width: 250px;
          height: auto;
          overflow: visible;
        }

        .liner-group {
          cursor: pointer;
          transition: opacity 0.2s ease, transform 0.15s ease;
        }

        .liner-group:hover .liner-polygon {
          filter: brightness(0.95);
          stroke-width: 2.2;
        }

        .liner-polygon {
          transition: stroke 0.15s ease, stroke-width 0.15s ease, fill 0.15s ease;
        }

        .liner-id-text {
          font-size: 10.5px;
          font-weight: 700;
          pointer-events: none;
          font-family: Arial, sans-serif;
        }

        .liner-val-text {
          font-size: 9.5px;
          font-weight: 600;
          pointer-events: none;
          font-family: Arial, sans-serif;
        }

        .dimmed {
          opacity: 0.2;
        }

        .search-hit .liner-polygon {
          stroke: #009fe3;
          stroke-width: 2.5;
          filter: drop-shadow(0 0 4px rgba(0, 159, 227, 0.6));
        }

        .selected-liner .liner-polygon {
          stroke: #009fe3;
          stroke-width: 3.2;
          filter: drop-shadow(0 0 6px rgba(0, 159, 227, 0.7));
        }
      `}</style>
    </article >
  );
}
