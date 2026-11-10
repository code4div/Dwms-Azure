import Dashboard from "@/components/Dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — DWMS Rajasthan Ore Hub",
  description: "Operations dashboard for DWMS Rajasthan Ore Hub",
};

export default function DashboardPage() {
  return <Dashboard />;
}
