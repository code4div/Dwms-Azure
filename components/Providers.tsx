"use client";

import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { WorkflowProvider } from "@/contexts/WorkflowContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WorkflowProvider>{children}</WorkflowProvider>
    </AuthProvider>
  );
}

