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
] as const;

export type Resource = (typeof RESOURCES)[number];

export const ACTIONS = [
  "view",
  "create",
  "update",
  "delete",
  "export",
] as const;

export type Action = (typeof ACTIONS)[number];

/**
 * Defines which actions are available per resource.
 * Not every resource supports every action.
 */
export const RESOURCE_ACTIONS: Record<Resource, readonly Action[]> = {
  overview: ["view"],
  billboards: ["view", "create", "update", "delete"],
  categories: ["view", "create", "update", "delete"],
  filters: ["view", "create", "update", "delete"],
  products: ["view", "create", "update", "delete", "export"],
  orders: ["view", "update", "export"],
  appearance: ["view", "update"],
  payments: ["view", "update"],
  pages: ["view", "create", "update", "delete"],
  settings: ["view", "update"],
  roles: ["view", "create", "update", "delete"],
};

/**
 * Human-readable labels for the UI.
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
  roles: "Roles & Team",
};

export const ACTION_LABELS: Record<Action, string> = {
  view: "View",
  create: "Create",
  update: "Update",
  delete: "Delete",
  export: "Export",
};

/**
 * Maps navbar routes to their required resource for `view` permission.
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
};

/**
 * Default role definitions used when seeding a new store's roles.
 */
export const DEFAULT_ROLES: {
  name: string;
  description: string;
  permissions: { resource: Resource; action: Action }[];
}[] = [
  {
    name: "Admin",
    description: "Full access to everything except role management (reserved for owner)",
    permissions: RESOURCES.filter((r) => r !== "roles").flatMap((resource) =>
      RESOURCE_ACTIONS[resource].map((action) => ({ resource, action }))
    ),
  },
  {
    name: "Editor",
    description: "Can view and edit content, but cannot delete or manage settings",
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
      { resource: "orders", action: "view" },
      { resource: "orders", action: "update" },
      { resource: "pages", action: "view" },
      { resource: "pages", action: "create" },
      { resource: "pages", action: "update" },
    ],
  },
  {
    name: "Viewer",
    description: "Read-only access to all content",
    permissions: RESOURCES.filter(
      (r) => r !== "roles" && r !== "settings" && r !== "payments"
    ).map((resource) => ({ resource, action: "view" as Action })),
  },
  {
    name: "Order Manager",
    description: "Can view and manage orders, view products",
    permissions: [
      { resource: "overview", action: "view" },
      { resource: "orders", action: "view" },
      { resource: "orders", action: "update" },
      { resource: "orders", action: "export" },
      { resource: "products", action: "view" },
    ],
  },
  {
    name: "Delivery Boy",
    description: "Can only view and update order status for deliveries",
    permissions: [
      { resource: "orders", action: "view" },
      { resource: "orders", action: "update" },
    ],
  },
];
