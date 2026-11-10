import React from "react";
import Approvals from "@/components/Approvals";

export const metadata = {
  title: "Approvals — BEUMER DWMS",
  description: "Checker inbox for site managers to authorize or reject maintenance work orders.",
};

export default function ApprovalsPage() {
  return <Approvals />;
}

