"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Activity,
  Building2,
  ClipboardList,
  Database,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  SlidersHorizontal,
  UserCheck,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkflow } from "@/contexts/WorkflowContext";

function GitHierarchyIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="16" width="7" height="5" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
      <path d="M6.5 8v4h11v4M17.5 12H6.5" />
    </svg>
  );
}

interface NavItem {
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  href: string;
  badge?: number | string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { pendingCount } = useWorkflow();

  const handleSignOut = () => {
    logout();
    router.push("/signin");
  };

  const isItemActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/" || pathname === "/dashboard";
    }
    if (href === "/my-site") {
      return pathname === "/my-site" || pathname === "/liner-wear-map" || pathname.startsWith("/liner-wear-map");
    }
    return pathname === href;
  };

  const role = user?.role || "admin";

  const navGroups: NavGroup[] = [
    {
      title: "MONITORING",
      items: [
        { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
        { label: "My Site", icon: Building2, href: "/my-site" },
        { label: "Real-Time Wear Data", icon: Activity, href: "/real-time-wear" },
      ],
    },
    {
      title: "ANALYSIS",
      items: [
        { label: "Reports", icon: ClipboardList, href: "/reports" },
        { label: "Historical Data", icon: History, href: "/historical-data" },
      ],
    },
    ...(role === "operator"
      ? [
          {
            title: "WORKFLOW",
            items: [
              { label: "Operations", icon: Wrench, href: "/operations" },
            ],
          },
        ]
      : role === "manager"
      ? [
          {
            title: "WORKFLOW",
            items: [
              { label: "Operations", icon: Wrench, href: "/operations" },
              {
                label: "Approvals",
                icon: ShieldCheck,
                href: "/approvals",
                badge: pendingCount > 0 ? pendingCount : undefined,
              },
            ],
          },
        ]
      : [
          {
            title: "ADMINISTRATION",
            items: [
              { label: "Customers", icon: Users, href: "/customers" },
              { label: "Hierarchy Builder", icon: GitHierarchyIcon, href: "/hierarchy-builder" },
              { label: "Assets & Catalogue", icon: Database, href: "/assets-catalogue" },
              { label: "Users & Roles", icon: UserCheck, href: "/users-roles" },
              { label: "Configuration", icon: SlidersHorizontal, href: "/configuration" },
            ],
          },
        ]),
  ];

  const displayName = user?.name || (role === "operator" ? "A. Meena" : role === "manager" ? "K. Iyer" : "M. Braun");
  const displayTitle = user?.title || (role === "operator" ? "Site Operator" : role === "manager" ? "Site Manager" : "Administrator");

  return (
    <div className="app-shell">
      {/* Top Navbar */}
      <header className="topbar">
        <button
          className="mobile-menu"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
        >
          <Menu size={21} />
        </button>

        <div className="brand">
          <div className="logo-box">
            <span className="logo-mark">♢</span>
            <span className="logo-word">
              BEUMER<span>GROUP</span>
            </span>
          </div>
          <div className="product-title">DWMS — DIGITAL WEAR MONITORING SYSTEM</div>
          <div className="site-title">{user?.site || "Rajasthan Ore Hub"}</div>
        </div>

        <div className="profile">
          <div className="profile-copy">
            <div className="profile-name">{displayName}</div>
            <div className="profile-role">{displayTitle.toUpperCase()}</div>
          </div>
          <button className="signout" onClick={handleSignOut} title="Sign out">
            <LogOut size={19} />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-mobile-head">
          <span>MENU</span>
          <button onClick={() => setMobileOpen(false)} aria-label="Close navigation">
            <X size={20} />
          </button>
        </div>

        {navGroups.map((group) => (
          <section className="nav-section" key={group.title}>
            <div className="nav-heading">{group.title}</div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.href);

              return (
                <button
                  key={item.label}
                  className={`nav-item ${active ? "active" : ""}`}
                  onClick={() => {
                    setMobileOpen(false);
                    if (item.href && item.href !== "#") {
                      router.push(item.href);
                    }
                  }}
                  title={item.label}
                >
                  <Icon size={19} strokeWidth={1.75} />
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="nav-badge ml-auto">{item.badge}</span>
                  )}
                </button>
              );
            })}
          </section>
        ))}
      </aside>

      {mobileOpen && (
        <button
          className="backdrop"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />
      )}

      {/* Main Content Area */}
      <main className="main-content">{children}</main>
    </div>
  );
}
