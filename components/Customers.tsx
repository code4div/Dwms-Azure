"use client";

import React, { useState } from "react";
import AppLayout from "./AppLayout";
import {
  Building,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  Mail,
  MapPin,
  Phone,
  Plus,
  Shield,
  Users,
} from "lucide-react";

interface CustomerSite {
  id: string;
  clientName: string;
  siteName: string;
  location: string;
  materialType: string;
  junctionHouses: number;
  totalChutes: number;
  monitoredLiners: number;
  status: "Active" | "Contracted" | "Commissioning";
  contractUntil: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
}

const CUSTOMERS_DATA: CustomerSite[] = [
  {
    id: "CUST-001",
    clientName: "Hindustan Zinc & Mineral Resources",
    siteName: "Rajasthan Ore Hub",
    location: "Bhilwara, Rajasthan, India",
    materialType: "Zinc & Lead Run-of-Mine / Heavy Abrasive Pellets",
    junctionHouses: 3,
    totalChutes: 5,
    monitoredLiners: 200,
    status: "Active",
    contractUntil: "31 Dec 2027",
    contactPerson: "Rajeshwar Sen (Chief Operations Officer)",
    contactEmail: "sen.r@hzmr-india.com",
    contactPhone: "+91 294 242 8000",
  },
  {
    id: "CUST-002",
    clientName: "Adani Ports & Special Economic Zone",
    siteName: "Gujarat Mineral Terminal",
    location: "Mundra Port, Gujarat, India",
    materialType: "Imported Thermal Coal & Raw Bauxite",
    junctionHouses: 2,
    totalChutes: 4,
    monitoredLiners: 160,
    status: "Commissioning",
    contractUntil: "15 Oct 2028",
    contactPerson: "Amitabh Patel (Terminal Head)",
    contactEmail: "a.patel@adani-ports.com",
    contactPhone: "+91 2838 255 100",
  },
  {
    id: "CUST-003",
    clientName: "Vedanta Aluminium & Mining Corp",
    siteName: "Odisha Bauxite Depot",
    location: "Lanjigarh, Odisha, India",
    materialType: "High Silica Bauxite Ore",
    junctionHouses: 4,
    totalChutes: 8,
    monitoredLiners: 320,
    status: "Contracted",
    contractUntil: "20 May 2029",
    contactPerson: "Dr. B. K. Mohanty (Maintenance VP)",
    contactEmail: "bk.mohanty@vedanta-mining.com",
    contactPhone: "+91 674 239 4500",
  },
];

export default function Customers() {
  const [customers, setCustomers] = useState<CustomerSite[]>(CUSTOMERS_DATA);
  const [selectedSite, setSelectedSite] = useState<CustomerSite>(CUSTOMERS_DATA[0]);

  return (
    <AppLayout>
      <div className="dwms-page-container">
        {/* Header */}
        <div className="dwms-page-header">
          <div>
            <div className="dwms-breadcrumbs">Administration / Client Portfolios</div>
            <h1 className="dwms-page-title">Customers & Site Tenancies</h1>
            <p className="dwms-page-desc">
              Manage client organizations, licensed bulk material handling facilities, and active SLA contracts
            </p>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="stats-grid mb-6">
          <div className="stat-card">
            <div className="stat-label">MANAGED SITES</div>
            <div className="stat-value">{customers.length}</div>
            <div className="stat-sub">Across 3 industrial states</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">TOTAL MONITORED LINERS</div>
            <div className="stat-value text-primary font-bold">
              {customers.reduce((a, b) => a + b.monitoredLiners, 0)}
            </div>
            <div className="stat-sub">Active condition telemetry nodes</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">FLEET CHUTE ASSEMBLIES</div>
            <div className="stat-value">
              {customers.reduce((a, b) => a + b.totalChutes, 0)} chutes
            </div>
            <div className="stat-sub">In 9 transfer junction houses</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">CONTRACT COMPLIANCE</div>
            <div className="stat-value text-success font-bold">100% SLA</div>
            <div className="stat-sub">Zero maintenance downtime penalty</div>
          </div>
        </div>

        {/* Site Directory Table */}
        <div className="dwms-panel">
          <div className="dwms-panel-header">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Building size={18} className="text-primary" />
              Contracted Bulk Material Facilities
            </h2>
          </div>

          <div className="dwms-table-responsive mt-3">
            <table className="dwms-data-table">
              <thead>
                <tr>
                  <th>Client Organization</th>
                  <th>Operating Facility</th>
                  <th>Location</th>
                  <th>Material Stream</th>
                  <th>Junction Houses</th>
                  <th>Chutes</th>
                  <th>Sensored Liners</th>
                  <th>SLA Status</th>
                  <th>Contract Term</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr
                    key={c.id}
                    className={selectedSite.id === c.id ? "row-selected" : ""}
                    onClick={() => setSelectedSite(c)}
                  >
                    <td className="font-bold text-foreground">{c.clientName}</td>
                    <td className="font-semibold text-primary">{c.siteName}</td>
                    <td className="text-xs text-muted flex items-center gap-1 mt-1">
                      <MapPin size={12} /> {c.location}
                    </td>
                    <td className="text-xs">{c.materialType}</td>
                    <td className="mono-num text-center">{c.junctionHouses}</td>
                    <td className="mono-num text-center">{c.totalChutes}</td>
                    <td className="mono-num font-bold text-center text-primary">{c.monitoredLiners}</td>
                    <td>
                      <span className={`status-pill ${c.status === "Active" ? "healthy" : "action"}`}>
                        <span className="status-dot" />
                        {c.status}
                      </span>
                    </td>
                    <td className="mono-num text-xs text-muted">{c.contractUntil}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Customer Site Details */}
        <div className="dwms-panel mt-6">
          <div className="dwms-panel-header">
            <h3 className="font-bold text-base text-primary">Facility Profile — {selectedSite.siteName}</h3>
            <p className="text-xs text-muted">Primary point of contact & commercial tenancy specifics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div className="p-4 rounded bg-panel/70 border border-border space-y-2">
              <div className="text-xs font-semibold text-muted uppercase tracking-wider">Contact Person</div>
              <div className="font-bold text-sm text-foreground">{selectedSite.contactPerson}</div>
              <div className="text-xs text-muted flex items-center gap-1.5 pt-1">
                <Mail size={13} className="text-primary" /> {selectedSite.contactEmail}
              </div>
              <div className="text-xs text-muted flex items-center gap-1.5">
                <Phone size={13} className="text-primary" /> {selectedSite.contactPhone}
              </div>
            </div>

            <div className="p-4 rounded bg-panel/70 border border-border space-y-2">
              <div className="text-xs font-semibold text-muted uppercase tracking-wider">Operational Configuration</div>
              <div className="text-xs flex justify-between py-1 border-b border-border/50">
                <span className="text-muted">Junction Houses</span>
                <span className="font-semibold">{selectedSite.junctionHouses} active</span>
              </div>
              <div className="text-xs flex justify-between py-1 border-b border-border/50">
                <span className="text-muted">Total Chutes</span>
                <span className="font-semibold">{selectedSite.totalChutes} installed</span>
              </div>
              <div className="text-xs flex justify-between py-1">
                <span className="text-muted">Monitored Liners</span>
                <span className="font-semibold text-primary">{selectedSite.monitoredLiners} plates</span>
              </div>
            </div>

            <div className="p-4 rounded bg-panel/70 border border-border space-y-2">
              <div className="text-xs font-semibold text-muted uppercase tracking-wider">Contractual Details</div>
              <div className="text-xs flex justify-between py-1 border-b border-border/50">
                <span className="text-muted">Contract ID</span>
                <span className="mono-num">{selectedSite.id}</span>
              </div>
              <div className="text-xs flex justify-between py-1 border-b border-border/50">
                <span className="text-muted">Term Expiration</span>
                <span className="font-semibold">{selectedSite.contractUntil}</span>
              </div>
              <div className="text-xs flex justify-between py-1">
                <span className="text-muted">Deployment Status</span>
                <span className="font-semibold text-success">{selectedSite.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

