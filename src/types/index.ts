// ─── Auth ──────────────────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// ─── Contact ───────────────────────────────────────────────────
export interface Contact {
  id: number;
  user_id: number;
  name: string;
  phone: string | null;
  email: string | null;
  tags: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateContactPayload {
  name: string;
  phone?: string;
  email?: string;
  tags?: string[];
  notes?: string;
}

export interface UpdateContactPayload extends Partial<CreateContactPayload> {}

// ─── Contact Group ─────────────────────────────────────────────
export interface ContactGroup {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  color: string;
  member_count: number;
  created_at: string;
}

// ─── Campaign ──────────────────────────────────────────────────
export type CampaignChannel = "whatsapp" | "email" | "both";
export type CampaignStatus = "draft" | "running" | "done" | "failed";

export interface Campaign {
  id: number;
  user_id: number;
  name: string;
  channel: CampaignChannel;
  message: string;
  subject: string | null;
  status: CampaignStatus;
  total: number;
  sent: number;
  failed: number;
  scheduled_at: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
}

// ─── API Response wrappers ─────────────────────────────────────
export interface PaginatedContacts {
  contacts: Contact[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  errors?: { msg: string; path: string }[];
}

export type { DashboardStats } from "./stats";
