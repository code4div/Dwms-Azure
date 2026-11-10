import LinerWearMap from "@/components/LinerWearMap";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Digital Liner Wear Map — DWMS Rajasthan Ore Hub",
  description: "Interactive chute schematic — every liner position is a live object",
};

export default function LinerWearMapPage() {
  return <LinerWearMap />;
}
