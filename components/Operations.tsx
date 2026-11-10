"use client";

import React, { useState } from "react";
import AppLayout from "./AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkflow, RequestType } from "@/contexts/WorkflowContext";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Send,
  ShieldAlert,
  Wrench,
  XCircle,
} from "lucide-react";

interface LinerOption {
  id: string;
  wear: number;
  thickness: number;
  minThickness: number;
  rulDays: number;
  material: string;
  replacementPart: string;
  type: string;
}

const LINER_OPTIONS: LinerOption[] = [
  {
    id: "CH-001·2B",
    wear: 93.4,
    thickness: 1.1,
    minThickness: 6,
    rulDays: 15,
    material: "High Wear Deflector Plate (Hardox 500)",
    replacementPart: "PN-002-B",
    type: "Rear Wall",
  },
  {
    id: "CH-003·2J",
    wear: 91.6,
    thickness: 1.3,
    minThickness: 6,
    rulDays: 17,
    material: "Ceramic Composite 92% Al2O3",
    replacementPart: "PN-002-J",
    type: "Rear Wall",
  },
  {
    id: "CH-002·4B",
    wear: 88.1,
    thickness: 2.4,
    minThickness: 8,
    rulDays: 15,
    material: "Bi-metallic White Iron Tile",
    replacementPart: "PN-004-B",
    type: "Discharge Chute",
  },
  {
    id: "CH-001·1B",
    wear: 81.2,
    thickness: 4.7,
    minThickness: 10,
    rulDays: 134,
    material: "Ceramic Composite 92% Al2O3",
    replacementPart: "PN-001-B",
    type: "Impact Wall",
  },
  {
    id: "CH-003·1A",
    wear: 79.8,
    thickness: 5.1,
    minThickness: 10,
    rulDays: 52,
    material: "Ceramic Composite 92% Al2O3",
    replacementPart: "PN-001-A",
    type: "Impact Wall",
  },
  {
    id: "CH-005·3F",
    wear: 77.5,
    thickness: 4.5,
    minThickness: 8,
    rulDays: 68,
    material: "Polyurethane Composite Plate",
    replacementPart: "PN-003-F",
    type: "Side Wall",
  },
  {
    id: "CH-001·1A",
    wear: 58.8,
    thickness: 10.3,
    minThickness: 10,
    rulDays: 59,
    material: "Ceramic Composite 92% Al2O3",
    replacementPart: "PN-001-A",
    type: "Impact Wall",
  },
  {
    id: "CH-001·1G",
    wear: 64.7,
    thickness: 7.1,
    minThickness: 10,
    rulDays: 48,
    material: "Ceramic Composite 92% Al2O3",
    replacementPart: "PN-001-G",
    type: "Impact Wall",
  },
  {
    id: "CH-004·3A",
    wear: 71.8,
    thickness: 7.0,
    minThickness: 8,
    rulDays: 166,
    material: "Ceramic Composite 92% Al2O3",
    replacementPart: "PN-003-A",
    type: "Side Wall",
  },
];

export default function Operations() {
  const { user } = useAuth();
  const { requests, submitRequest } = useWorkflow();

  const [reqType, setReqType] = useState<RequestType>("Liner Replacement");
  const [selectedLinerId, setSelectedLinerId] = useState<string>("CH-001·2B");
  const [title, setTitle] = useState("");
  const [workOrder, setWorkOrder] = useState("");
  const [downtime, setDowntime] = useState("4");
  const [details, setDetails] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const activeLiner = LINER_OPTIONS.find((l) => l.id === selectedLinerId) || LINER_OPTIONS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const raisedByName = user ? `${user.name} (${user.title})` : "A. Meena (Site Operator)";

    submitRequest({
      type: reqType,
      linerId: activeLiner.id,
      wear: activeLiner.wear,
      thickness: activeLiner.thickness,
      minThickness: activeLiner.minThickness,
      rulDays: activeLiner.rulDays,
      material: activeLiner.material,
      replacementPart: activeLiner.replacementPart,
      title: title.trim(),
      workOrder: workOrder.trim() || `WO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      downtimeHours: Number(downtime) || 3,
      details: details.trim() || `Standard ${reqType.toLowerCase()} request submitted for ${activeLiner.id}.`,
      raisedBy: raisedByName,
    });

    setTitle("");
    setWorkOrder("");
    setDetails("");
    setSuccessMsg(`Request submitted successfully! Awaiting Site Manager review.`);
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  return (
    <AppLayout>
      <div className="dwms-page-container">
        {/* Header */}
        <div className="dwms-page-header">
          <div>
            <div className="dwms-breadcrumbs">Workflow / Operations & Maintenance</div>
            <h1 className="dwms-page-title">Operations</h1>
            <p className="dwms-page-desc">
              Raise inspection logs, replacement and shutdown requests for manager approval (Maker Workflow)
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="dwms-alert-banner success mb-6">
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 2-Column Responsive Operations Layout */}
        <div className="operations-layout">
          {/* Left Column: New Request Form */}
          <div>
            <div className="dwms-panel">
              <div className="dwms-panel-header">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Wrench size={18} className="text-primary" />
                  New Request
                </h2>
                <p className="text-xs text-muted">
                  Submissions enter the Site Manager checker queue for verification.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="dwms-form-group">
                  <label className="dwms-label">Request Type</label>
                  <select
                    className="dwms-input"
                    value={reqType}
                    onChange={(e) => setReqType(e.target.value as RequestType)}
                  >
                    <option value="Liner Replacement">Liner Replacement</option>
                    <option value="Inspection Log">Inspection Log</option>
                    <option value="Shutdown Window">Shutdown Window</option>
                    <option value="Threshold Override">Threshold Override</option>
                  </select>
                </div>

                <div className="dwms-form-group">
                  <label className="dwms-label">Target Liner</label>
                  <select
                    className="dwms-input"
                    value={selectedLinerId}
                    onChange={(e) => setSelectedLinerId(e.target.value)}
                  >
                    {LINER_OPTIONS.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.id} · {l.wear}% wear ({l.type})
                      </option>
                    ))}
                  </select>

                  <div className="liner-selection-badge mt-2 p-2.5 rounded bg-panel/70 border border-border text-xs text-muted space-y-1">
                    <div className="flex justify-between font-semibold text-foreground">
                      <span>{activeLiner.type}</span>
                      <span className={activeLiner.wear > 90 ? "text-danger" : "text-warning"}>
                        {activeLiner.wear}% Wear · RUL {activeLiner.rulDays} d
                      </span>
                    </div>
                    <div>Material: {activeLiner.material}</div>
                    <div>Recommended Part: <span className="mono-num text-primary font-semibold">{activeLiner.replacementPart}</span></div>
                  </div>
                </div>

                <div className="dwms-form-group">
                  <label className="dwms-label">Title / Summary</label>
                  <input
                    type="text"
                    className="dwms-input"
                    placeholder="Short summary (e.g. Replace liner 2B before outage)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="dwms-form-group">
                    <label className="dwms-label">Work Order</label>
                    <input
                      type="text"
                      className="dwms-input"
                      placeholder="WO-2026-…"
                      value={workOrder}
                      onChange={(e) => setWorkOrder(e.target.value)}
                    />
                  </div>
                  <div className="dwms-form-group">
                    <label className="dwms-label">Downtime (Hours)</label>
                    <input
                      type="number"
                      className="dwms-input"
                      min="1"
                      max="48"
                      value={downtime}
                      onChange={(e) => setDowntime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="dwms-form-group">
                  <label className="dwms-label">Observation & Justification</label>
                  <textarea
                    rows={4}
                    className="dwms-input"
                    placeholder="Observation, justification, proposed window, sensor observations..."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                  />
                </div>

                <button type="submit" className="dwms-btn dwms-btn-primary w-full justify-center">
                  <Send size={16} />
                  <span>Submit for approval</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Submitted Requests History */}
          <div>
            <div className="dwms-panel">
              <div className="dwms-panel-header flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold">Submitted requests ({requests.length})</h2>
                  <p className="text-xs text-muted">
                    Full audit trail of maker submissions and checker resolutions.
                  </p>
                </div>
              </div>

              <div className="space-y-4 mt-5">
                {requests.map((r) => (
                  <div key={r.id} className="request-card p-4 rounded-lg border border-border bg-panel">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-primary">{r.id}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-muted/15 text-foreground font-medium">
                          {r.type}
                        </span>
                      </div>

                      <span
                        className={`status-pill ${
                          r.status === "pending"
                            ? "action"
                            : r.status === "approved"
                            ? "healthy"
                            : "critical"
                        }`}
                      >
                        <span className="status-dot" />
                        {r.status === "pending"
                          ? "Pending approval"
                          : r.status === "approved"
                          ? "Approved"
                          : "Rejected"}
                      </span>
                    </div>

                    <h3 className="font-semibold text-base mb-1">{r.title}</h3>
                    <p className="text-xs text-muted leading-relaxed mb-3">{r.details}</p>

                    <div className="tech-param-ribbon">
                      <div>
                        <span className="text-muted block text-[10px]">Target Liner</span>
                        <span className="font-bold text-primary">{r.linerId}</span>
                      </div>
                      <div>
                        <span className="text-muted block text-[10px]">Current Wear</span>
                        <span className="font-semibold">{r.wear}%</span>
                      </div>
                      <div>
                        <span className="text-muted block text-[10px]">RUL Estimate</span>
                        <span className="font-semibold">{r.rulDays} days</span>
                      </div>
                      <div>
                        <span className="text-muted block text-[10px]">Work Order</span>
                        <span className="mono-num">{r.workOrder}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-muted pt-1">
                      <span>Raised by {r.raisedBy} · {new Date(r.raisedAt).toLocaleString()}</span>
                      {r.downtimeHours > 0 && <span>Est. downtime: {r.downtimeHours}h</span>}
                    </div>

                    {r.decisionComment && (
                      <div className="decision-note mt-3 p-2.5 rounded bg-panel border-l-4 border-primary text-xs">
                        <div className="font-semibold text-foreground flex items-center justify-between">
                          <span>Decision from {r.decidedBy}</span>
                          <span className="text-[10px] text-muted">{r.decidedAt ? new Date(r.decidedAt).toLocaleString() : ""}</span>
                        </div>
                        <div className="text-muted italic mt-0.5">"{r.decisionComment}"</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .operations-layout {
            display: grid;
            grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
            gap: 24px;
          }

          @media (max-width: 1024px) {
            .operations-layout {
              grid-template-columns: 1fr;
            }
          }

          .tech-param-ribbon {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            padding: 12px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            margin: 12px 0;
            font-size: 12px;
          }

          @media (max-width: 640px) {
            .tech-param-ribbon {
              grid-template-columns: repeat(2, 1fr);
            }
          }
        `}</style>
      </div>
    </AppLayout>
  );
}

