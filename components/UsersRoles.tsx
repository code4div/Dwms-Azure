"use client";

import React, { useState } from "react";
import AppLayout from "./AppLayout";
import {
  CheckCircle2,
  HardHat,
  KeyRound,
  Mail,
  Plus,
  Search,
  Settings2,
  Shield,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "operator" | "manager" | "admin";
  title: string;
  site: string;
  department: string;
  status: "Active" | "Pending" | "Disabled";
  lastLogin: string;
}

const INITIAL_USERS: TeamMember[] = [
  {
    id: "usr-01",
    name: "A. Meena",
    email: "operator@beumer.com",
    role: "operator",
    title: "Site Operator (Maker)",
    site: "Rajasthan Ore Hub",
    department: "Plant Floor Maintenance",
    status: "Active",
    lastLogin: "Today, 08:42 AM",
  },
  {
    id: "usr-02",
    name: "K. Iyer",
    email: "manager@beumer.com",
    role: "manager",
    title: "Site Manager (Checker)",
    site: "Rajasthan Ore Hub",
    department: "Operations & Asset Integrity",
    status: "Active",
    lastLogin: "Today, 09:15 AM",
  },
  {
    id: "usr-03",
    name: "M. Braun",
    email: "admin@beumer.com",
    role: "admin",
    title: "Administrator",
    site: "Global Enterprise",
    department: "BEUMER Digital Systems",
    status: "Active",
    lastLogin: "Yesterday, 04:30 PM",
  },
  {
    id: "usr-04",
    name: "S. Khurana",
    email: "s.khurana@hzmr-india.com",
    role: "operator",
    title: "Junior Maintenance Technician",
    site: "Rajasthan Ore Hub",
    department: "Primary Crusher Unit",
    status: "Active",
    lastLogin: "2 days ago",
  },
  {
    id: "usr-05",
    name: "P. Ranganathan",
    email: "p.ranganathan@hzmr-india.com",
    role: "manager",
    title: "Reliability Engineering Lead",
    site: "Rajasthan Ore Hub",
    department: "Predictive Analytics",
    status: "Active",
    lastLogin: "3 days ago",
  },
];

export default function UsersRoles() {
  const [users, setUsers] = useState<TeamMember[]>(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Invite modal form
  const [invName, setInvName] = useState("");
  const [invEmail, setInvEmail] = useState("");
  const [invRole, setInvRole] = useState<TeamMember["role"]>("operator");
  const [notification, setNotification] = useState("");

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invName.trim() || !invEmail.trim()) return;

    const titles: Record<TeamMember["role"], string> = {
      operator: "Site Operator (Maker)",
      manager: "Site Manager (Checker)",
      admin: "Administrator",
    };

    const newUser: TeamMember = {
      id: `usr-${String(users.length + 1).padStart(2, "0")}`,
      name: invName.trim(),
      email: invEmail.trim(),
      role: invRole,
      title: titles[invRole],
      site: "Rajasthan Ore Hub",
      department: invRole === "admin" ? "Enterprise IT" : "Plant Maintenance",
      status: "Active",
      lastLogin: "Never",
    };

    setUsers((prev) => [...prev, newUser]);
    setShowInviteModal(false);
    setInvName("");
    setInvEmail("");
    setNotification(`Successfully added ${newUser.name} as ${newUser.title}.`);
    setTimeout(() => setNotification(""), 4000);
  };

  return (
    <AppLayout>
      <div className="dwms-page-container">
        {/* Header */}
        <div className="dwms-page-header">
          <div>
            <div className="dwms-breadcrumbs">Administration / Team Access</div>
            <h1 className="dwms-page-title">Users & Roles</h1>
            <p className="dwms-page-desc">
              Manage platform credentials, role-based access control (RBAC), and maker-checker delegations
            </p>
          </div>

          <div className="dwms-header-actions">
            <button
              onClick={() => setShowInviteModal(true)}
              className="dwms-btn dwms-btn-primary"
            >
              <UserPlus size={16} />
              <span>Invite User</span>
            </button>
          </div>
        </div>

        {notification && (
          <div className="dwms-alert-banner success mb-6">
            <CheckCircle2 size={18} />
            <span>{notification}</span>
          </div>
        )}

        {/* Role Matrix Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="p-4 rounded-lg bg-panel border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded bg-primary/10 text-primary">
                <HardHat size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Site Operator (Maker)</h3>
                <span className="text-[11px] text-muted">2 Active Users</span>
              </div>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Monitors site wear maps, views live telemetry, logs manual thickness measurements, and raises maintenance replacement work orders.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-panel border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded bg-primary/10 text-primary">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Site Manager (Checker)</h3>
                <span className="text-[11px] text-muted">2 Active Users</span>
              </div>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Complete operator visibility PLUS the authorization gatekeeper: approves or rejects maintenance requests with audit comments.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-panel border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded bg-primary/10 text-primary">
                <Settings2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Administrator</h3>
                <span className="text-[11px] text-muted">1 Active User</span>
              </div>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Total system governance: manages customers, plant hierarchy builder, part numbers catalogue, user roles, and alarm thresholds.
            </p>
          </div>
        </div>

        {/* Table Panel */}
        <div className="dwms-panel">
          <div className="dwms-table-toolbar">
            <div className="dwms-search-box">
              <Search size={16} className="dwms-search-icon" />
              <input
                type="text"
                placeholder="Search team member name, email, department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="dwms-search-input"
              />
            </div>

            <div className="dwms-filter-group">
              <span className="text-xs text-muted mr-1">Filter Role:</span>
              {["All", "operator", "manager", "admin"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`dwms-pill-btn capitalize ${roleFilter === r ? "active" : ""}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="dwms-table-responsive">
            <table className="dwms-data-table">
              <thead>
                <tr>
                  <th>Team Member</th>
                  <th>E-Mail Address</th>
                  <th>Assigned Role</th>
                  <th>Operating Facility</th>
                  <th>Department</th>
                  <th>Account Status</th>
                  <th>Last Portal Session</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="font-bold text-foreground">{u.name}</div>
                      <div className="text-[10px] text-muted mono-num">{u.id}</div>
                    </td>
                    <td className="mono-num text-xs text-muted">{u.email}</td>
                    <td>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded font-semibold ${
                          u.role === "operator"
                            ? "bg-blue/15 text-blue"
                            : u.role === "manager"
                            ? "bg-primary/20 text-primary font-bold"
                            : "bg-warning/20 text-warning font-bold"
                        }`}
                      >
                        {u.title}
                      </span>
                    </td>
                    <td className="text-xs">{u.site}</td>
                    <td className="text-xs text-muted">{u.department}</td>
                    <td>
                      <span className="status-pill healthy">
                        <span className="status-dot" />
                        {u.status}
                      </span>
                    </td>
                    <td className="text-xs text-muted">{u.lastLogin}</td>
                    <td>
                      <button
                        className="dwms-table-btn"
                        onClick={() => {
                          alert(`Managing profile and permissions for ${u.name}`);
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="dwms-table-footer">
            <span>Showing {filtered.length} of {users.length} active system accounts</span>
            <span className="text-muted text-xs">Protected with JWT / Role Authentication</span>
          </div>
        </div>

        {/* Modal: Invite User */}
        {showInviteModal && (
          <div className="dwms-modal-backdrop" onClick={() => setShowInviteModal(false)}>
            <div className="dwms-modal-box" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold mb-1">Add System User</h2>
              <p className="text-xs text-muted mb-4">Grant access to BEUMER DWMS operations.</p>

              <form onSubmit={handleInvite} className="space-y-4">
                <div className="dwms-form-group">
                  <label className="dwms-label">Full Name</label>
                  <input
                    type="text"
                    className="dwms-input"
                    placeholder="e.g. R. Sharma"
                    value={invName}
                    onChange={(e) => setInvName(e.target.value)}
                    required
                  />
                </div>

                <div className="dwms-form-group">
                  <label className="dwms-label">Corporate Email</label>
                  <input
                    type="email"
                    className="dwms-input"
                    placeholder="r.sharma@beumer.com"
                    value={invEmail}
                    onChange={(e) => setInvEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="dwms-form-group">
                  <label className="dwms-label">Role Assignment</label>
                  <select
                    className="dwms-input"
                    value={invRole}
                    onChange={(e) => setInvRole(e.target.value as any)}
                  >
                    <option value="operator">Site Operator (Maker)</option>
                    <option value="manager">Site Manager (Checker)</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="dwms-btn dwms-btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="dwms-btn dwms-btn-primary">
                    Create User
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

