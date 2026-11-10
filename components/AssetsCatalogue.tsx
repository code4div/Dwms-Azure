"use client";

import React, { useState } from "react";
import AppLayout from "./AppLayout";
import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  Database,
  Download,
  Filter,
  Layers,
  Package,
  Plus,
  Search,
  Tag,
} from "lucide-react";

export interface PartCatalogItem {
  id: string; // e.g. "PN-001-A"
  name: string;
  category: "Impact Wall" | "Rear Wall" | "Side Wall" | "Discharge Chute" | "Deflector";
  material: string;
  dimensions: string; // e.g. "500 × 500 × 50 mm"
  initialThickness: number; // e.g. 50 mm
  minThickness: number; // e.g. 10 mm
  stock: number;
  reorderLevel: number;
  unitCost: string;
  supplier: string;
}

const INITIAL_CATALOG: PartCatalogItem[] = [
  {
    id: "PN-001-A",
    name: "Standard Impact Wall Liner Plate",
    category: "Impact Wall",
    material: "Ceramic Composite 92% Al2O3",
    dimensions: "500 × 500 × 50 mm",
    initialThickness: 50,
    minThickness: 10,
    stock: 18,
    reorderLevel: 8,
    unitCost: "₹ 14,200",
    supplier: "BEUMER Wear Systems GmbH",
  },
  {
    id: "PN-001-B",
    name: "Impact Wall Heavy Impact Block",
    category: "Impact Wall",
    material: "Ceramic Composite 92% Al2O3",
    dimensions: "600 × 400 × 60 mm",
    initialThickness: 60,
    minThickness: 10,
    stock: 9,
    reorderLevel: 5,
    unitCost: "₹ 18,500",
    supplier: "BEUMER Wear Systems GmbH",
  },
  {
    id: "PN-002-B",
    name: "High Velocity Deflector Liner Plate",
    category: "Deflector",
    material: "Hardox 500 Quenched & Tempered Steel",
    dimensions: "600 × 400 × 60 mm",
    initialThickness: 60,
    minThickness: 6,
    stock: 3,
    reorderLevel: 6,
    unitCost: "₹ 22,800",
    supplier: "SSAB Special Steels Ltd.",
  },
  {
    id: "PN-002-J",
    name: "Rear Wall Abrasion Deflector",
    category: "Rear Wall",
    material: "Ceramic Composite 92% Al2O3",
    dimensions: "500 × 400 × 45 mm",
    initialThickness: 45,
    minThickness: 6,
    stock: 12,
    reorderLevel: 4,
    unitCost: "₹ 13,900",
    supplier: "BEUMER Wear Systems GmbH",
  },
  {
    id: "PN-003-A",
    name: "Side Wall Low-Angle Wear Plate",
    category: "Side Wall",
    material: "Polyurethane Composite Plate",
    dimensions: "500 × 300 × 40 mm",
    initialThickness: 40,
    minThickness: 8,
    stock: 24,
    reorderLevel: 10,
    unitCost: "₹ 8,700",
    supplier: "Polymelt Wear Solutions",
  },
  {
    id: "PN-003-F",
    name: "Screen House Chute Side Wall Liner",
    category: "Side Wall",
    material: "Polyurethane Composite Plate",
    dimensions: "500 × 300 × 40 mm",
    initialThickness: 40,
    minThickness: 8,
    stock: 7,
    reorderLevel: 5,
    unitCost: "₹ 8,900",
    supplier: "Polymelt Wear Solutions",
  },
  {
    id: "PN-004-B",
    name: "Discharge Chute Bi-Metallic Impact Tile",
    category: "Discharge Chute",
    material: "Bi-Metallic White Iron / Mild Steel Backing",
    dimensions: "400 × 400 × 55 mm",
    initialThickness: 55,
    minThickness: 8,
    stock: 14,
    reorderLevel: 6,
    unitCost: "₹ 16,400",
    supplier: "CastMet Heavy Alloys",
  },
];

export default function AssetsCatalogue() {
  const [catalog, setCatalog] = useState<PartCatalogItem[]>(INITIAL_CATALOG);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);

  // New item form state
  const [partId, setPartId] = useState("");
  const [partName, setPartName] = useState("");
  const [partCat, setPartCat] = useState<PartCatalogItem["category"]>("Impact Wall");
  const [partMat, setPartMat] = useState("Ceramic Composite 92% Al2O3");
  const [partDim, setPartDim] = useState("500 × 500 × 50 mm");
  const [partStock, setPartStock] = useState("10");

  const [notification, setNotification] = useState("");

  const filtered = catalog.filter((item) => {
    const matchSearch =
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.material.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "All" || item.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const handleAddPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partId.trim() || !partName.trim()) return;

    const newItem: PartCatalogItem = {
      id: partId.trim().toUpperCase(),
      name: partName.trim(),
      category: partCat,
      material: partMat,
      dimensions: partDim,
      initialThickness: 50,
      minThickness: 8,
      stock: Number(partStock) || 5,
      reorderLevel: 5,
      unitCost: "₹ 15,000",
      supplier: "BEUMER Wear Systems GmbH",
    };

    setCatalog((prev) => [newItem, ...prev]);
    setShowAddModal(false);
    setPartId("");
    setPartName("");
    setNotification(`Added ${newItem.id} to catalogue.`);
    setTimeout(() => setNotification(""), 4000);
  };

  return (
    <AppLayout>
      <div className="dwms-page-container">
        {/* Header */}
        <div className="dwms-page-header">
          <div>
            <div className="dwms-breadcrumbs">Administration / Asset Management</div>
            <h1 className="dwms-page-title">Assets & Catalogue</h1>
            <p className="dwms-page-desc">
              Part numbers, material grades, specifications, CAD profiles, and warehouse stock levels
            </p>
          </div>

          <div className="dwms-header-actions">
            <button
              onClick={() => setShowAddModal(true)}
              className="dwms-btn dwms-btn-primary"
            >
              <Plus size={16} />
              <span>Add Part to Catalogue</span>
            </button>
          </div>
        </div>

        {notification && (
          <div className="dwms-alert-banner success mb-6">
            <CheckCircle2 size={18} />
            <span>{notification}</span>
          </div>
        )}


        {/* Main Panel */}
        <div className="dwms-panel">
          {/* Toolbar */}
          <div className="dwms-table-toolbar">
            <div className="dwms-search-box">
              <Search size={16} className="dwms-search-icon" />
              <input
                type="text"
                placeholder="Search part number, description, material..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="dwms-search-input"
              />
            </div>

            <div className="dwms-filter-group">
              <Filter size={15} className="text-muted" />
              <span className="text-xs text-muted mr-1">Zone:</span>
              {["All", "Impact Wall", "Rear Wall", "Side Wall", "Discharge Chute", "Deflector"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`dwms-pill-btn ${categoryFilter === cat ? "active" : ""}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="dwms-table-responsive">
            <table className="dwms-data-table">
              <thead>
                <tr>
                  <th>Part Number</th>
                  <th>Part Description</th>
                  <th>Chute Zone</th>
                  <th>Material Specification</th>
                  <th>Dimensions</th>
                  <th>Thickness (Nom / Min)</th>
                  <th>Stock Inventory</th>
                  <th>Unit Cost</th>
                  <th>Supplier</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const isLowStock = item.stock <= item.reorderLevel;
                  return (
                    <tr key={item.id}>
                      <td className="font-bold text-primary mono-num">{item.id}</td>
                      <td className="font-semibold text-foreground">{item.name}</td>
                      <td>
                        <span className="text-xs px-2 py-0.5 rounded bg-muted/15 text-foreground">
                          {item.category}
                        </span>
                      </td>
                      <td className="text-xs text-muted">{item.material}</td>
                      <td className="mono-num text-xs">{item.dimensions}</td>
                      <td className="mono-num text-xs">
                        {item.initialThickness} mm / <span className="text-danger font-semibold">{item.minThickness} mm</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className={`mono-num font-bold ${isLowStock ? "text-danger" : "text-success"}`}>
                            {item.stock} in stock
                          </span>
                          {isLowStock && (
                            <span className="status-pill imminent text-[10px] py-0 px-1.5" title="Reorder recommended">
                              Low
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="mono-num text-xs font-semibold">{item.unitCost}</td>
                      <td className="text-xs text-muted">{item.supplier}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="dwms-table-footer">
            <span>Showing {filtered.length} of {catalog.length} catalog items</span>
            <span className="text-muted text-xs">Certified to ISO 9001 / BEUMER Wear Specification STD-2026</span>
          </div>
        </div>

        {/* Modal: Add Part */}
        {showAddModal && (
          <div className="dwms-modal-backdrop" onClick={() => setShowAddModal(false)}>
            <div className="dwms-modal-box" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold mb-1">Add Part to Catalogue</h2>
              <p className="text-xs text-muted mb-4">Register a new liner tile or wear deflector specification.</p>

              <form onSubmit={handleAddPart} className="space-y-4">
                <div className="dwms-form-group">
                  <label className="dwms-label">Part Number / Code</label>
                  <input
                    type="text"
                    className="dwms-input"
                    placeholder="e.g. PN-005-X"
                    value={partId}
                    onChange={(e) => setPartId(e.target.value)}
                    required
                  />
                </div>

                <div className="dwms-form-group">
                  <label className="dwms-label">Item Title</label>
                  <input
                    type="text"
                    className="dwms-input"
                    placeholder="e.g. Heavy Duty Ceramic Impact Tile"
                    value={partName}
                    onChange={(e) => setPartName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="dwms-form-group">
                    <label className="dwms-label">Chute Zone</label>
                    <select
                      className="dwms-input"
                      value={partCat}
                      onChange={(e) => setPartCat(e.target.value as any)}
                    >
                      <option value="Impact Wall">Impact Wall</option>
                      <option value="Rear Wall">Rear Wall</option>
                      <option value="Side Wall">Side Wall</option>
                      <option value="Discharge Chute">Discharge Chute</option>
                      <option value="Deflector">Deflector</option>
                    </select>
                  </div>
                  <div className="dwms-form-group">
                    <label className="dwms-label">Initial Stock</label>
                    <input
                      type="number"
                      className="dwms-input"
                      value={partStock}
                      onChange={(e) => setPartStock(e.target.value)}
                    />
                  </div>
                </div>

                <div className="dwms-form-group">
                  <label className="dwms-label">Material Composition</label>
                  <input
                    type="text"
                    className="dwms-input"
                    value={partMat}
                    onChange={(e) => setPartMat(e.target.value)}
                  />
                </div>

                <div className="dwms-form-group">
                  <label className="dwms-label">Dimensions</label>
                  <input
                    type="text"
                    className="dwms-input"
                    value={partDim}
                    onChange={(e) => setPartDim(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="dwms-btn dwms-btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="dwms-btn dwms-btn-primary">
                    Save to Catalogue
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

