// types/stats.ts
export interface DashboardStats {
  contacts: {
    total: number;
    thisMonth: number;
  };
  campaigns: {
    total: number;
    running: number;
    done: number;
    failed: number;
    scheduled: number;
  };
  messages: {
    totalSent: number;
    totalFailed: number;
    successRate: number;
    thisMonth: number;
  };
  channels: {
    whatsapp: number;
    email: number;
    both: number;
  };
  recentActivity: {
    id: number;
    name: string;
    channel: string;
    status: string;
    sent: number;
    total: number;
    created_at: string;
    finished_at: string | null;
  }[];
  dailyStats: {
    date: string;
    sent: number;
    failed: number;
  }[];
}

// Log detail per kontak
export interface CampaignLog {
  id: number;
  channel: string;
  status: 'sent' | 'failed' | 'pending';
  error: string | null;
  sent_at: string;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
}

export interface CampaignLogsResponse {
  campaign: { id: number; name: string };
  logs: CampaignLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
