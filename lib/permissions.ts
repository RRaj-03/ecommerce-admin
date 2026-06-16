/**
 * Permission Registry — defines all resources and their allowed actions.
 * This is the single source of truth for what can be protected.
 */

export const RESOURCES = [
  "overview",
  "billboards",
  "categories",
  "filters",
  "products",
  "orders",
  "appearance",
  "payments",
  "pages",
  "settings",
  "roles",
  "team",
] as const;

export type Resource = (typeof RESOURCES)[number];

export const ACTIONS = [
  "view",
  "create",
  "update",
  "delete",
  "export",
  "assign",
] as const;

export type Action = (typeof ACTIONS)[number];

export const SCOPES = ["all", "assigned", "subordinates"] as const;
export type Scope = (typeof SCOPES)[number];

/**
 * Defines which actions are available per resource.
 */
export const RESOURCE_ACTIONS: Record<Resource, readonly Action[]> = {
  overview: ["view"],
  billboards: ["view", "create", "update", "delete"],
  categories: ["view", "create", "update", "delete"],
  filters: ["view", "create", "update", "delete"],
  products: ["view", "create", "update", "delete", "export"],
  orders: ["view", "update", "export", "assign"],
  appearance: ["view", "update"],
  payments: ["view", "update"],
  pages: ["view", "create", "update", "delete"],
  settings: ["view", "update"],
  roles: ["view", "create", "update", "delete"],
  team: ["view", "create", "update", "delete"],
};

/**
 * Resources that support scoped access (assigned/subordinates vs all).
 */
export const SCOPEABLE_RESOURCES: Resource[] = ["orders"];

/**
 * Human-readable labels.
 */
export const RESOURCE_LABELS: Record<Resource, string> = {
  overview: "Dashboard Overview",
  billboards: "Billboards",
  categories: "Categories",
  filters: "Filters",
  products: "Products",
  orders: "Orders",
  appearance: "Appearance / Theme",
  payments: "Payment Settings",
  pages: "Custom Pages",
  settings: "Store Settings",
  roles: "Roles",
  team: "Team Members",
};

export const ACTION_LABELS: Record<Action, string> = {
  view: "View",
  create: "Create",
  update: "Update",
  delete: "Delete",
  export: "Export",
  assign: "Assign",
};

export const SCOPE_LABELS: Record<Scope, string> = {
  all: "All (Global)",
  assigned: "Assigned to me",
  subordinates: "My team (subordinates)",
};

/**
 * Maps sidebar routes to their required resource for `view` permission.
 */
export const NAV_RESOURCE_MAP: Record<string, Resource> = {
  overview: "overview",
  billboards: "billboards",
  categories: "categories",
  filters: "filters",
  products: "products",
  orders: "orders",
  appearance: "appearance",
  payments: "payments",
  pages: "pages",
  settings: "settings",
  roles: "roles",
  team: "team",
};

/**
 * Default role definitions.
 */
export const DEFAULT_ROLES: {
  name: string;
  description: string;
  level: number;
  canDelegate: boolean;
  permissions: { resource: Resource; action: Action; scope?: Scope }[];
}[] = [
  {
    name: "Admin",
    description: "Full access to everything. Can create sub-roles.",
    level: 10,
    canDelegate: true,
    permissions: RESOURCES.flatMap((resource) =>
      RESOURCE_ACTIONS[resource].map((action) => ({
        resource,
        action,
        scope: "all" as Scope,
      }))
    ),
  },
  {
    name: "Order Manager",
    description: "Full order access. Can assign orders to subordinates. Can create sub-roles.",
    level: 50,
    canDelegate: true,
    permissions: [
      { resource: "overview", action: "view", scope: "all" },
      { resource: "orders", action: "view", scope: "all" },
      { resource: "orders", action: "update", scope: "all" },
      { resource: "orders", action: "export", scope: "all" },
      { resource: "orders", action: "assign", scope: "subordinates" },
      { resource: "products", action: "view", scope: "all" },
      { resource: "team", action: "view", scope: "all" },
    ],
  },
  {
    name: "Editor",
    description: "Can view and edit content, but cannot manage orders or settings.",
    level: 50,
    canDelegate: false,
    permissions: [
      { resource: "overview", action: "view" },
      { resource: "billboards", action: "view" },
      { resource: "billboards", action: "create" },
      { resource: "billboards", action: "update" },
      { resource: "categories", action: "view" },
      { resource: "categories", action: "create" },
      { resource: "categories", action: "update" },
      { resource: "filters", action: "view" },
      { resource: "filters", action: "create" },
      { resource: "filters", action: "update" },
      { resource: "products", action: "view" },
      { resource: "products", action: "create" },
      { resource: "products", action: "update" },
      { resource: "pages", action: "view" },
      { resource: "pages", action: "create" },
      { resource: "pages", action: "update" },
    ],
  },
  {
    name: "Viewer",
    description: "Read-only access to all content.",
    level: 100,
    canDelegate: false,
    permissions: RESOURCES.filter(
      (r) => r !== "roles" && r !== "settings" && r !== "payments" && r !== "team"
    ).map((resource) => ({ resource, action: "view" as Action, scope: "all" as Scope })),
  },
  {
    name: "Delivery Boy",
    description: "Can only view and update orders assigned to them.",
    level: 100,
    canDelegate: false,
    permissions: [
      { resource: "orders", action: "view", scope: "assigned" },
      { resource: "orders", action: "update", scope: "assigned" },
    ],
  },
];
