"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import axios from "axios";
import {
  LayoutDashboard,
  Image as ImageIcon,
  FolderTree,
  SlidersHorizontal,
  ShoppingBag,
  ClipboardList,
  Palette,
  CreditCard,
  FileText,
  Settings,
  Shield,
  Users,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { Button } from "./ui/button";

const sidebarRoutes = [
  { label: "Overview", icon: LayoutDashboard, segment: "", resource: "overview" },
  { label: "Billboards", icon: ImageIcon, segment: "billboards", resource: "billboards" },
  { label: "Categories", icon: FolderTree, segment: "categories", resource: "categories" },
  { label: "Filters", icon: SlidersHorizontal, segment: "filters", resource: "filters" },
  { label: "Products", icon: ShoppingBag, segment: "products", resource: "products" },
  { label: "Orders", icon: ClipboardList, segment: "orders", resource: "orders" },
  { label: "Appearance", icon: Palette, segment: "appearance", resource: "appearance" },
  { label: "Payments", icon: CreditCard, segment: "payments", resource: "payments" },
  { label: "Pages", icon: FileText, segment: "pages", resource: "pages" },
  { label: "Roles", icon: Shield, segment: "roles", resource: "roles" },
  { label: "Team", icon: Users, segment: "team", resource: "team" },
  { label: "Settings", icon: Settings, segment: "settings", resource: "settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const params = useParams();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!params.storeId) return;
    axios
      .get(`/api/${params.storeId}/my-permissions`)
      .then((res) => {
        setIsOwner(res.data.isOwner);
        setUserPermissions(res.data.permissions);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [params.storeId]);

  const hasPermission = (resource: string): boolean => {
    if (isOwner) return true;
    if (userPermissions.includes("*")) return true;
    return userPermissions.some((p) => p.startsWith(`${resource}:`));
  };

  const routes = loaded
    ? sidebarRoutes.filter((route) => hasPermission(route.resource))
    : sidebarRoutes;

  const isActive = (segment: string) => {
    const base = `/${params.storeId}`;
    if (segment === "") return pathname === base;
    return pathname.startsWith(`${base}/${segment}`);
  };

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
        {routes.map((route) => {
          const Icon = route.icon;
          const active = isActive(route.segment);
          const href =
            route.segment === ""
              ? `/${params.storeId}`
              : `/${params.storeId}/${route.segment}`;

          return (
            <Link
              key={route.segment}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg text-sm font-medium transition-all duration-200",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              title={collapsed ? route.label : undefined}
            >
              <Icon className={cn("h-5 w-5 shrink-0", active && "text-primary-foreground")} />
              {!collapsed && (
                <span className="truncate">{route.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle — desktop only */}
      <div className="hidden lg:flex border-t p-2 justify-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3.5 left-3 z-50 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — mobile: slide-in drawer, desktop: fixed */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full bg-background border-r transition-all duration-300 flex flex-col",
          // Mobile
          "lg:relative lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          // Width
          collapsed ? "lg:w-[68px]" : "lg:w-[220px]",
          "w-[240px]"
        )}
      >
        {/* Logo / Header area */}
        <div className={cn(
          "flex items-center border-b h-14 px-3 shrink-0",
          collapsed ? "justify-center" : "gap-2"
        )}>
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold text-sm">A</span>
          </div>
          {!collapsed && (
            <span className="font-semibold text-sm truncate">Admin Panel</span>
          )}
        </div>

        {sidebarContent}
      </aside>
    </>
  );
}
