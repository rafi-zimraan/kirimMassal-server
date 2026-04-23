import type { CampaignChannel } from "./campaign";
export interface MessageTemplate {
  id: number;
  user_id: number;
  name: string;
  channel: CampaignChannel;
  subject: string | null;
  content: string;
  tags: string[];
  used_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplatePayload {
  name: string;
  channel: CampaignChannel;
  content: string;
  subject?: string;
  tags?: string[];
}

export interface UpdateTemplatePayload extends Partial<CreateTemplatePayload> {}
