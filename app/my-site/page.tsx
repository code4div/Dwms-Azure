import LinerWearMap from "@/components/LinerWearMap";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Site — BEUMER DWMS Digital Wear Monitoring System",
  description: "Hierarchy and live liner wear map for assigned plant facility.",
};

export default function MySitePage() {
  return <LinerWearMap />;
}

