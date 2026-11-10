import React from "react";
import HierarchyBuilder from "@/components/HierarchyBuilder";

export const metadata = {
  title: "Hierarchy Builder — BEUMER DWMS",
  description: "Configure plant topology across sites, junction houses, floors, chutes and liners.",
};

export default function HierarchyBuilderPage() {
  return <HierarchyBuilder />;
}

