"use client";

import React, { useState } from "react";
import AppLayout from "./AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkflow, WorkflowRequest } from "@/contexts/WorkflowContext";
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  History,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
  X,
  XCircle,
} from "lucide-react";

export default function Approvals() {
  const { user } = useAuth();
  const { pendingRequests, historyRequests, approveRequest, rejectRequest } = useWorkflow();

  const [decisionComments, setDecisionComments] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string>("");

  const handleCommentChange = (id: string, text: string) => {
    setDecisionComments((prev) => ({ ...prev, [id]: text }));
  };

  const handleApprove = (req: WorkflowRequest) => {
    const comment = decisionComments[req.id] || "Approved. Schedule replacement in next shutdown window.";
    const decidedByName = user ? `${user.name} (${user.title})` : "K. Iyer (Site Manager)";
    approveRequest(req.id, comment, decidedByName);
    setFeedback(`Approved request ${req.id} successfully!`);
    setTimeout(() => setFeedback(""), 4000);
  };

  const handleReject = (req: WorkflowRequest) => {
    const comment = decisionComments[req.id] || "Rejected. Continue monitoring wear trend.";
    const decidedByName = user ? `${user.name} (${user.title})` : "K. Iyer (Site Manager)";
    rejectRequest(req.id, comment, decidedByName);
    setFeedback(`Rejected request ${req.id}.`);
    setTimeout(() => setFeedback(""), 4000);
  };

  return (
    <AppLayout>
      <div className="dwms-page-container">
        {/* Page Header */}
        <div className="dwms-page-header">
          <div>
            <div className="dwms-breadcrumbs">Workflow / Checker Inbox</div>
            <h1 className="dwms-page-title">Approvals</h1>
            <p className="dwms-page-desc">
              Checker inbox — review operator submissions and approve or reject (Maker–Checker Governance)
            </p>
          </div>
          <div>
            <span className="live-pulse-badge active">
              <span className="live-dot" />
              <span>{pendingRequests.length} PENDING DECISIONS</span>
            </span>
          </div>
        </div>

        {feedback && (
          <div className="dwms-alert-banner success mb-6">
            <CheckCircle2 size={18} />
            <span>{feedback}</span>
          </div>
        )}

        <div className="space-y-8">
          {/* Section 1: Awaiting Decision */}
          <div className="dwms-panel">
            <div className="dwms-panel-header flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <ShieldCheck size={20} className="text-primary" />
                  Awaiting decision ({pendingRequests.length})
                </h2>
                <p className="text-xs text-muted">
                  Maintenance work orders submitted by Site Operators requiring managerial authorization.
                </p>
              </div>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="p-8 text-center text-muted border border-dashed border-border rounded-lg mt-4">
                <CheckCircle2 size={36} className="text-success mx-auto mb-2 opacity-80" />
                <div className="font-semibold text-foreground">All caught up!</div>
                <div className="text-xs mt-1">There are no pending requests awaiting managerial approval.</div>
              </div>
            ) : (
              <div className="space-y-4 mt-5">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="approval-card p-5 rounded-lg border border-border bg-panel shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-primary">{req.id}</span>
                        <span className="text-xs px-2.5 py-0.5 rounded font-semibold bg-muted/15 text-foreground">
                          {req.type}
                        </span>
                      </div>
                      <div className="text-xs text-muted">
                        Raised by <span className="font-semibold text-foreground">{req.raisedBy}</span> · {new Date(req.raisedAt).toLocaleString()}
                      </div>
                    </div>

                    <h3 className="font-bold text-base mb-2">{req.title}</h3>
                    <p className="text-sm text-muted leading-relaxed mb-4">{req.details}</p>

                    {/* Technical Parameter Ribbon */}
                    <div className="tech-param-ribbon">
                      <div>
                        <span className="text-muted block text-[10px]">Target Asset</span>
                        <span className="font-bold text-primary">{req.linerId}</span>
                      </div>
                      <div>
                        <span className="text-muted block text-[10px]">Wear Level</span>
                        <span className={`font-bold ${req.wear > 90 ? "text-danger" : "text-warning"}`}>
                          {req.wear}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted block text-[10px]">Est. RUL</span>
                        <span className="font-semibold">{req.rulDays} days</span>
                      </div>
                      <div>
                        <span className="text-muted block text-[10px]">Work Order</span>
                        <span className="mono-num">{req.workOrder}</span>
                      </div>
                    </div>

                    {/* Decision Action Area */}
                    <div className="border-t border-border pt-4 mt-2">
                      <label className="text-xs font-semibold text-muted block mb-1.5">
                        Decision comment (recorded in plant audit log):
                      </label>
                      <textarea
                        rows={2}
                        className="dwms-input text-xs mb-3"
                        placeholder="e.g. Approved. Proceed with replacement during Wednesday shutdown window..."
                        value={decisionComments[req.id] || ""}
                        onChange={(e) => handleCommentChange(req.id, e.target.value)}
                      />

                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => handleReject(req)}
                          className="dwms-btn dwms-btn-danger"
                          title="Reject request with comments"
                        >
                          <X size={16} />
                          <span>Reject</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(req)}
                          className="dwms-btn dwms-btn-success"
                          title="Authorize and approve request"
                        >
                          <Check size={16} />
                          <span>Approve</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Decision History */}
          <div className="dwms-panel">
            <div className="dwms-panel-header">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <History size={18} className="text-primary" />
                Decision history ({historyRequests.length})
              </h2>
              <p className="text-xs text-muted">
                Historical record of authorized and rejected maintenance actions.
              </p>
            </div>

            <div className="space-y-3 mt-4">
              {historyRequests.map((req) => (
                <div key={req.id} className="p-4 rounded-lg border border-border bg-panel/50 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-primary">{req.id}</span>
                      <span className="font-semibold">{req.title}</span>
                    </div>

                    <span className={`status-pill ${req.status === "approved" ? "healthy" : "critical"}`}>
                      <span className="status-dot" />
                      {req.status === "approved" ? "Approved" : "Rejected"}
                    </span>
                  </div>

                  <div className="text-muted mb-2">
                    Target: <span className="font-semibold text-foreground">{req.linerId}</span> · Wear: {req.wear}% · Work Order: {req.workOrder}
                  </div>

                  {req.decisionComment && (
                    <div className="p-2.5 rounded bg-panel border-l-4 border-success text-muted">
                      <span className="font-semibold text-foreground">
                        {req.decidedBy || "Site Manager"}
                      </span>
                      {req.decidedAt && (
                        <span className="text-[10px] ml-2 text-muted">({new Date(req.decidedAt).toLocaleString()})</span>
                      )}
                      <div className="italic mt-0.5">"{req.decisionComment}"</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <style jsx>{`
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

