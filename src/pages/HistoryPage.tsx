import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  History,
  Trash2,
  StopCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ChevronRight,
  MessageSquare,
  Mail,
  Zap,
} from "lucide-react";
import clsx from "clsx";
import api from "../lib/api";
import type { Campaign, CampaignStatus, CampaignChannel } from "../types";

// ─── Helpers ───────────────────────────────────────────────────
const STATUS_STYLE: Record<
  CampaignStatus,
  { label: string; cls: string; icon: React.ReactNode }
> = {
  draft: {
    label: "Draft",
    cls: "bg-text-muted/10 text-text-muted",
    icon: <Clock className="w-3 h-3" />,
  },
  running: {
    label: "Berjalan",
    cls: "bg-info/10 text-info",
    icon: <Loader2 className="w-3 h-3 animate-spin" />,
  },
  done: {
    label: "Selesai",
    cls: "bg-accent/10 text-accent",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  failed: {
    label: "Gagal",
    cls: "bg-danger/10 text-danger",
    icon: <XCircle className="w-3 h-3" />,
  },
};

const CHANNEL_ICON: Record<CampaignChannel, React.ReactNode> = {
  whatsapp: <MessageSquare className="w-3.5 h-3.5" />,
  email: <Mail className="w-3.5 h-3.5" />,
  both: <Zap className="w-3.5 h-3.5" />,
};

function formatDate(d: string | null): string {
  if (!d) return "–";
  return new Date(d).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function HistoryPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ campaigns: Campaign[] }>("/campaigns");
      setCampaigns(data.campaigns);
    } catch {
      toast.error("Gagal memuat riwayat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleAbort = async (id: number) => {
    try {
      await api.post(`/campaigns/${id}/abort`);
      toast.success("Campaign dihentikan");
      fetchCampaigns();
    } catch {
      toast.error("Gagal menghentikan campaign");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Hapus campaign ini?")) return;
    try {
      await api.delete(`/campaigns/${id}`);
      toast.success("Campaign dihapus");
      fetchCampaigns();
    } catch {
      toast.error("Gagal menghapus campaign");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <History className="w-5 h-5 text-accent" /> Riwayat Campaign
          </h1>
          <p className="text-text-muted text-sm mt-0.5">
            {campaigns.length} campaign tercatat
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-text-muted">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Memuat...
        </div>
      ) : campaigns.length === 0 ? (
        <div className="card p-12 text-center border-dashed">
          <History className="w-10 h-10 text-text-muted/30 mx-auto mb-3" />
          <p className="text-text-secondary font-medium">Belum ada campaign</p>
          <p className="text-text-muted text-sm mt-1">
            Buat campaign pertama di halaman{" "}
            <a href="/compose" className="text-accent hover:underline">
              Kirim Pesan
            </a>
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((c) => {
            const st = STATUS_STYLE[c.status];
            const progress =
              c.total > 0
                ? Math.round(((c.sent + c.failed) / c.total) * 100)
                : 0;

            return (
              <div
                key={c.id}
                className="card p-5 hover:border-accent/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-text-primary font-semibold truncate">
                        {c.name}
                      </h3>
                      {/* Status badge */}
                      <span
                        className={clsx(
                          "badge flex items-center gap-1",
                          st.cls,
                        )}
                      >
                        {st.icon} {st.label}
                      </span>
                      {/* Channel badge */}
                      <span className="badge bg-bg-surface text-text-muted border border-bg-border flex items-center gap-1">
                        {CHANNEL_ICON[c.channel]} {c.channel}
                      </span>
                    </div>

                    {/* Progress bar */}
                    {(c.status === "running" || c.status === "done") &&
                      c.total > 0 && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-text-muted mb-1">
                            <span>
                              {c.sent + c.failed} / {c.total}
                            </span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-bg-border rounded-full h-1.5">
                            <div
                              className={clsx(
                                "h-1.5 rounded-full transition-all",
                                c.status === "done" ? "bg-accent" : "bg-info",
                              )}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                    {/* Stats row */}
                    <div className="flex items-center gap-4 text-xs text-text-muted flex-wrap">
                      <span>
                        Total: <b className="text-text-secondary">{c.total}</b>
                      </span>
                      <span className="text-accent">✅ {c.sent} terkirim</span>
                      {c.failed > 0 && (
                        <span className="text-danger">❌ {c.failed} gagal</span>
                      )}
                      <span>Dibuat: {formatDate(c.created_at)}</span>
                      {c.finished_at && (
                        <span>Selesai: {formatDate(c.finished_at)}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {c.status === "running" && (
                      <button
                        onClick={() => handleAbort(c.id)}
                        className="btn-danger flex items-center gap-1.5 text-xs py-1.5 px-3"
                      >
                        <StopCircle className="w-3.5 h-3.5" /> Stop
                      </button>
                    )}
                    {c.status !== "running" && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
