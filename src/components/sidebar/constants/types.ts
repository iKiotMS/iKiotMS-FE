import { type LucideIcon } from "lucide-react";

export type UserRole =
  | "SUPER_ADMIN"
  | "TENANT_OWNER"
  | "BRANCH_MANAGER"
  | "WAREHOUSE_MANAGER"
  | "STAFF"
  | "CUSTOMER";

export interface NavSubItem {
  title: string;
  url: string;
}

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  items?: NavSubItem[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}
