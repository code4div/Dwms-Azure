import React from "react";
import RealTimeWearData from "@/components/RealTimeWearData";

export const metadata = {
  title: "Real-Time Wear Data — BEUMER DWMS",
  description: "Live condition monitoring sensor stream and telemetry analytics.",
};

export default function RealTimeWearPage() {
  return <RealTimeWearData />;
}

