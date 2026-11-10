"use client";

import React, { useState } from "react";
import AppLayout from "./AppLayout";
import {
  Boxes,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FolderTree,
  GitBranch,
  Layers,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";

interface LinerNode {
  id: string;
  code: string;
  zone: string;
}

interface ChuteNode {
  id: string;
  name: string;
  location: string;
  linerCount: number;
}

interface FloorNode {
  id: string;
  name: string;
  chutes: ChuteNode[];
}

interface JunctionHouseNode {
  id: string;
  name: string;
  floors: FloorNode[];
}

const INITIAL_HIERARCHY: JunctionHouseNode[] = [
  {
    id: "JH-01",
    name: "JH-01 (Primary Crusher)",
    floors: [
      {
        id: "JH-01-F01",
        name: "Floor 01",
        chutes: [{ id: "CH-001", name: "CH-001", location: "Primary Feeder Chute", linerCount: 40 }],
      },
      {
        id: "JH-01-F02",
        name: "Floor 02",
        chutes: [{ id: "CH-002", name: "CH-002", location: "Coarse Ore Return Chute", linerCount: 40 }],
      },
    ],
  },
  {
    id: "JH-02",
    name: "JH-02 (Transfer Building B)",
    floors: [
      {
        id: "JH-02-F01",
        name: "Floor 01",
        chutes: [{ id: "CH-003", name: "CH-003", location: "Conveyor CV-102 Transfer", linerCount: 40 }],
      },
      {
        id: "JH-02-F02",
        name: "Floor 02",
        chutes: [{ id: "CH-004", name: "CH-004", location: "Surge Bin Diverter Chute", linerCount: 40 }],
      },
    ],
  },
  {
    id: "JH-05",
    name: "JH-05 (Screen House)",
    floors: [
      {
        id: "JH-05-F01",
        name: "Floor 01",
        chutes: [{ id: "CH-005", name: "CH-005", location: "Oversize Re-crush Chute", linerCount: 40 }],
      },
    ],
  },
];

export default function HierarchyBuilder() {
  const [hierarchy, setHierarchy] = useState<JunctionHouseNode[]>(INITIAL_HIERARCHY);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // Form states
  const [newJH, setNewJH] = useState("");
  const [floorJH, setFloorJH] = useState(INITIAL_HIERARCHY[0].id);
  const [newFloor, setNewFloor] = useState("");
  const [chuteFloor, setChuteFloor] = useState("JH-01-F01");
  const [newChuteCode, setNewChuteCode] = useState("");
  const [newChuteLoc, setNewChuteLoc] = useState("");
  const [linerChute, setLinerChute] = useState("CH-001");
  const [linerZone, setLinerZone] = useState("Impact");
  const [linerPosCode, setLinerPosCode] = useState("1A");

  const [notification, setNotification] = useState("");

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 4000);
  };

  const handleAddJH = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJH.trim()) return;
    const id = `JH-0${hierarchy.length + 1}`;
    const name = `${id} (${newJH.trim()})`;
    setHierarchy((prev) => [...prev, { id, name, floors: [] }]);
    setNewJH("");
    notify(`Added ${name} to Rajasthan Ore Hub.`);
  };

  const handleAddFloor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFloor.trim()) return;
    setHierarchy((prev) =>
      prev.map((jh) => {
        if (jh.id === floorJH) {
          const fId = `${jh.id}-F0${jh.floors.length + 1}`;
          return {
            ...jh,
            floors: [...jh.floors, { id: fId, name: newFloor.trim(), chutes: [] }],
          };
        }
        return jh;
      })
    );
    setNewFloor("");
    notify(`Added ${newFloor} to ${floorJH}.`);
  };

  const handleAddChute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChuteCode.trim()) return;
    setHierarchy((prev) =>
      prev.map((jh) => ({
        ...jh,
        floors: jh.floors.map((fl) => {
          if (fl.id === chuteFloor) {
            return {
              ...fl,
              chutes: [
                ...fl.chutes,
                {
                  id: newChuteCode.trim(),
                  name: newChuteCode.trim(),
                  location: newChuteLoc.trim() || "Transfer Point",
                  linerCount: 40,
                },
              ],
            };
          }
          return fl;
        }),
      }))
    );
    setNewChuteCode("");
    setNewChuteLoc("");
    notify(`Added ${newChuteCode} with 40 mapped liners.`);
  };

  const handleAddLiner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linerPosCode.trim()) return;
    setHierarchy((prev) =>
      prev.map((jh) => ({
        ...jh,
        floors: jh.floors.map((fl) => ({
          ...fl,
          chutes: fl.chutes.map((ch) => {
            if (ch.id === linerChute) {
              return { ...ch, linerCount: ch.linerCount + 1 };
            }
            return ch;
          }),
        })),
      }))
    );
    notify(`Added liner position ${linerPosCode} (${linerZone}) to chute ${linerChute}.`);
  };

  return (
    <AppLayout>
      <div className="dwms-page-container">
        {/* Header */}
        <div className="dwms-page-header">
          <div>
            <div className="dwms-breadcrumbs">Administration / Plant Asset Model</div>
            <h1 className="dwms-page-title">Hierarchy Builder</h1>
            <p className="dwms-page-desc">
              Site → junction house → floor → chute → liner (Asset Tree Configurator)
            </p>
          </div>
        </div>

        {notification && (
          <div className="dwms-alert-banner success mb-6">
            <CheckCircle2 size={18} />
            <span>{notification}</span>
          </div>
        )}

        <div className="operations-layout">
          {/* Left Column: Add Node Forms */}
          <div className="space-y-6">
            <div className="dwms-panel">
              <div className="dwms-panel-header">
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Plus size={17} className="text-primary" />
                  Add Nodes
                </h2>
                <p className="text-xs text-muted">Expand the physical monitoring topology</p>
              </div>

              <div className="space-y-6 mt-4">
                {/* 1. Junction House */}
                <form onSubmit={handleAddJH} className="p-3.5 rounded bg-panel/70 border border-border space-y-2.5">
                  <div className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 size={14} /> Junction House
                  </div>
                  <div className="text-xs text-muted">Parent: Rajasthan Ore Hub</div>
                  <input
                    type="text"
                    className="dwms-input"
                    placeholder="e.g. Stockyard Transfer Building"
                    value={newJH}
                    onChange={(e) => setNewJH(e.target.value)}
                  />
                  <button type="submit" className="dwms-btn dwms-btn-primary w-full text-xs py-1.5">
                    Add Junction House
                  </button>
                </form>

                {/* 2. Floor */}
                <form onSubmit={handleAddFloor} className="p-3.5 rounded bg-panel/70 border border-border space-y-2.5">
                  <div className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Layers size={14} /> Floor / Level
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-muted">Target Junction House</label>
                    <select
                      className="dwms-input text-xs"
                      value={floorJH}
                      onChange={(e) => setFloorJH(e.target.value)}
                    >
                      {hierarchy.map((jh) => (
                        <option key={jh.id} value={jh.id}>
                          {jh.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    className="dwms-input"
                    placeholder="Floor 03 (Upper Deck)"
                    value={newFloor}
                    onChange={(e) => setNewFloor(e.target.value)}
                  />
                  <button type="submit" className="dwms-btn dwms-btn-primary w-full text-xs py-1.5">
                    Add Floor
                  </button>
                </form>

                {/* 3. Chute */}
                <form onSubmit={handleAddChute} className="p-3.5 rounded bg-panel/70 border border-border space-y-2.5">
                  <div className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Boxes size={14} /> Chute
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-muted">Target Floor</label>
                    <select
                      className="dwms-input text-xs"
                      value={chuteFloor}
                      onChange={(e) => setChuteFloor(e.target.value)}
                    >
                      {hierarchy.flatMap((jh) =>
                        jh.floors.map((fl) => (
                          <option key={fl.id} value={fl.id}>
                            {jh.id} · {fl.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <input
                    type="text"
                    className="dwms-input"
                    placeholder="Chute Code (e.g. CH-006)"
                    value={newChuteCode}
                    onChange={(e) => setNewChuteCode(e.target.value)}
                  />
                  <input
                    type="text"
                    className="dwms-input"
                    placeholder="Location / Functional area"
                    value={newChuteLoc}
                    onChange={(e) => setNewChuteLoc(e.target.value)}
                  />
                  <button type="submit" className="dwms-btn dwms-btn-primary w-full text-xs py-1.5">
                    Add Chute (liners mapped from standard drawing)
                  </button>
                </form>

                {/* 4. Liner Position */}
                <form onSubmit={handleAddLiner} className="p-3.5 rounded bg-panel/70 border border-border space-y-2.5">
                  <div className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={14} /> Liner Position
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-muted">Chute</label>
                      <select
                        className="dwms-input text-xs"
                        value={linerChute}
                        onChange={(e) => setLinerChute(e.target.value)}
                      >
                        {["CH-001", "CH-002", "CH-003", "CH-004", "CH-005"].map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted">Wall Zone</label>
                      <select
                        className="dwms-input text-xs"
                        value={linerZone}
                        onChange={(e) => setLinerZone(e.target.value)}
                      >
                        <option value="Impact">Impact</option>
                        <option value="Side Wall">Side Wall</option>
                        <option value="Discharge">Discharge</option>
                        <option value="Back Plate">Back Plate</option>
                      </select>
                    </div>
                  </div>
                  <input
                    type="text"
                    className="dwms-input"
                    placeholder="Position code e.g. 1A"
                    value={linerPosCode}
                    onChange={(e) => setLinerPosCode(e.target.value)}
                  />
                  <button type="submit" className="dwms-btn dwms-btn-secondary w-full text-xs py-1.5">
                    Add Liner
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Current Structure Tree */}
          <div>
            <div className="dwms-panel">
              <div className="dwms-panel-header flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold flex items-center gap-2">
                    <FolderTree size={18} className="text-primary" />
                    Current Structure
                  </h2>
                  <p className="text-xs text-muted">Active monitored hierarchy at Rajasthan Ore Hub</p>
                </div>
                <div className="text-xs px-2.5 py-1 rounded bg-panel border border-border font-semibold text-primary">
                  Site: Rajasthan Ore Hub
                </div>
              </div>

              {/* Hierarchy Tree */}
              <div className="hierarchy-tree-root mt-4 p-4 rounded-lg bg-navy-2/20 border border-border space-y-4">
                <div className="tree-site-node flex items-center gap-2 font-bold text-sm text-foreground pb-2 border-b border-border">
                  <Building2 size={18} className="text-primary" />
                  <span>Rajasthan Ore Hub (Root Site)</span>
                  <span className="text-xs text-muted font-normal ml-auto">3 Junction Houses · 200 Liners</span>
                </div>

                <div className="space-y-4 pl-4 border-l-2 border-border/80">
                  {hierarchy.map((jh) => {
                    const isJhCollapsed = !!collapsed[jh.id];
                    return (
                      <div key={jh.id} className="jh-tree-item space-y-3">
                        <div
                          className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors font-semibold text-sm"
                          onClick={() => toggleCollapse(jh.id)}
                        >
                          {isJhCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                          <span className="text-primary">{jh.name}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-panel border border-border text-muted font-normal ml-auto">
                            {jh.floors.reduce((a, b) => a + b.chutes.reduce((x, y) => x + y.linerCount, 0), 0)} liners
                          </span>
                        </div>

                        {!isJhCollapsed && (
                          <div className="pl-6 space-y-3 border-l border-border/50">
                            {jh.floors.map((fl) => {
                              const isFlCollapsed = !!collapsed[fl.id];
                              return (
                                <div key={fl.id} className="floor-tree-item space-y-2">
                                  <div
                                    className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors text-xs font-semibold text-muted"
                                    onClick={() => toggleCollapse(fl.id)}
                                  >
                                    {isFlCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                                    <Layers size={14} className="text-primary" />
                                    <span>{fl.name}</span>
                                    <span className="text-[10px] text-muted">({fl.chutes.length} chutes)</span>
                                  </div>

                                  {!isFlCollapsed && (
                                    <div className="pl-6 space-y-2 border-l border-border/30">
                                      {fl.chutes.map((ch) => (
                                        <div
                                          key={ch.id}
                                          className="flex items-center justify-between p-2 rounded bg-panel border border-border text-xs hover:border-primary/50 transition-colors"
                                        >
                                          <div className="flex items-center gap-2">
                                            <Boxes size={14} className="text-primary" />
                                            <span className="font-bold text-primary">{ch.name}</span>
                                            <span className="text-muted text-[11px]">({ch.location})</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-[11px] mono-num font-semibold text-muted">
                                              {ch.linerCount} liners
                                            </span>
                                            <span className="status-dot bg-success" />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
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
        `}</style>
      </div>
    </AppLayout>
  );
}

