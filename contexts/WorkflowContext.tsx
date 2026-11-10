"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type RequestType =
  | "Liner Replacement"
  | "Inspection Log"
  | "Shutdown Window"
  | "Threshold Override";

export type RequestStatus = "pending" | "approved" | "rejected";

export interface WorkflowRequest {
  id: string; // e.g. "REQ-1001"
  type: RequestType;
  linerId: string; // e.g. "CH-001·2B"
  wear: number; // e.g. 93.4
  thickness?: number; // e.g. 1.1 mm
  minThickness?: number; // e.g. 6 mm
  rulDays: number; // e.g. 15
  material?: string; // e.g. "Ceramic Composite 92% Al2O3"
  replacementPart?: string; // e.g. "PN-002-B"
  title: string;
  workOrder: string;
  downtimeHours: number;
  details: string;
  status: RequestStatus;
  raisedBy: string; // e.g. "A. Meena (Site Operator)"
  raisedAt: string; // ISO date string
  decisionComment?: string;
  decidedBy?: string; // e.g. "K. Iyer (Site Manager)"
  decidedAt?: string;
}

const INITIAL_REQUESTS: WorkflowRequest[] = [
  {
    id: "REQ-1001",
    type: "Liner Replacement",
    linerId: "CH-001·2B",
    wear: 93.4,
    thickness: 1.1,
    minThickness: 6,
    rulDays: 15,
    material: "High Wear Deflector Plate (Hardox 500)",
    replacementPart: "PN-002-B",
    title: "Replace liner 2B (93.4% wear) with PN-002-B",
    workOrder: "WO-2026-0881",
    downtimeHours: 4,
    details:
      "Copper-wire loop broken, vibration above 4.2 mm/s. Requesting replacement in next shutdown.",
    status: "pending",
    raisedBy: "A. Meena (Site Operator)",
    raisedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "REQ-1002",
    type: "Inspection Log",
    linerId: "CH-001·1B",
    wear: 81.2,
    thickness: 4.7,
    minThickness: 10,
    rulDays: 134,
    material: "Ceramic Composite 92% Al2O3",
    replacementPart: "PN-001-B",
    title: "Visual inspection — CH-001 impact wall 1B",
    workOrder: "WO-2026-0875",
    downtimeHours: 1,
    details:
      "Surface grooving observed on impact plate, wear reading consistent with sensor.",
    status: "approved",
    raisedBy: "A. Meena (Site Operator)",
    raisedAt: new Date(Date.now() - 86400000).toISOString(),
    decisionComment: "Noted, keep on watchlist.",
    decidedBy: "K. Iyer (Site Manager)",
    decidedAt: new Date(Date.now() - 72000000).toISOString(),
  },
];

interface WorkflowContextType {
  requests: WorkflowRequest[];
  pendingRequests: WorkflowRequest[];
  historyRequests: WorkflowRequest[];
  pendingCount: number;
  submitRequest: (
    req: Omit<
      WorkflowRequest,
      "id" | "status" | "raisedAt" | "decisionComment" | "decidedBy" | "decidedAt"
    >
  ) => WorkflowRequest;
  approveRequest: (id: string, comment: string, decidedBy?: string) => void;
  rejectRequest: (id: string, comment: string, decidedBy?: string) => void;
  resetWorkflow: () => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<WorkflowRequest[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("dwms_workflow_requests");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // fallback to initial
        }
      }
    }
    return INITIAL_REQUESTS;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dwms_workflow_requests", JSON.stringify(requests));
    }
  }, [requests]);

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const historyRequests = requests.filter((r) => r.status !== "pending");
  const pendingCount = pendingRequests.length;

  const submitRequest = (
    reqData: Omit<
      WorkflowRequest,
      "id" | "status" | "raisedAt" | "decisionComment" | "decidedBy" | "decidedAt"
    >
  ): WorkflowRequest => {
    const nextNumber = requests.length + 1001;
    const newReq: WorkflowRequest = {
      ...reqData,
      id: `REQ-${nextNumber}`,
      status: "pending",
      raisedAt: new Date().toISOString(),
    };
    setRequests((prev) => [newReq, ...prev]);
    return newReq;
  };

  const approveRequest = (
    id: string,
    comment: string,
    decidedBy = "K. Iyer (Site Manager)"
  ) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "approved",
              decisionComment: comment || "Approved for next maintenance window.",
              decidedBy,
              decidedAt: new Date().toISOString(),
            }
          : r
      )
    );
  };

  const rejectRequest = (
    id: string,
    comment: string,
    decidedBy = "K. Iyer (Site Manager)"
  ) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "rejected",
              decisionComment: comment || "Rejected. Monitor wear trend.",
              decidedBy,
              decidedAt: new Date().toISOString(),
            }
          : r
      )
    );
  };

  const resetWorkflow = () => {
    setRequests(INITIAL_REQUESTS);
  };

  return (
    <WorkflowContext.Provider
      value={{
        requests,
        pendingRequests,
        historyRequests,
        pendingCount,
        submitRequest,
        approveRequest,
        rejectRequest,
        resetWorkflow,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    // safe fallback
    return {
      requests: INITIAL_REQUESTS,
      pendingRequests: INITIAL_REQUESTS.filter((r) => r.status === "pending"),
      historyRequests: INITIAL_REQUESTS.filter((r) => r.status !== "pending"),
      pendingCount: 1,
      submitRequest: () => INITIAL_REQUESTS[0],
      approveRequest: () => {},
      rejectRequest: () => {},
      resetWorkflow: () => {},
    };
  }
  return context;
}

