// Tambahan types untuk Fase 2 — append ke types/index.ts yang sudah ada

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

export interface CreateCampaignPayload {
  name: string;
  channel: CampaignChannel;
  message: string;
  subject?: string;
  scheduled_at?: string;
}

export interface CampaignStatusResponse {
  id: number;
  status: CampaignStatus;
  sent: number;
  failed: number;
  total: number;
  running: boolean;
  progress: number;
  finished_at: string | null;
}

export interface CampaignStats {
  totalCampaigns: number;
  totalSent: number;
  totalFailed: number;
  running: number;
}

export interface UserSettings {
  fonnte_token: string | null;
  brevo_api_key: string | null;
  email_from: string | null;
  email_from_name: string | null;
}
