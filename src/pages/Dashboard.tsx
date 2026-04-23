import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Send,
  CheckCircle2,
  XCircle,
  Zap,
  TrendingUp,
  ArrowRight,
  Clock,
  MessageSquare,
  Mail,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import api from "../lib/api";
import useAuthStore from "../store/authStore";
import { DashboardStats } from "../types/stats";

// ─── Stat Card ─────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ReactNode;
  accent?: string;
  trend?: number; // persentase naik/turun
}

function StatCard({
  label,
  value,
  sub,
  icon,
  accent = "text-accent",
  trend,
}: StatCardProps) {
  return (
    <div className="card p-5 hover:border-accent/20 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center
          ${
            accent === "text-accent"
              ? "bg-accent/10"
              : accent === "text-info"
                ? "bg-info/10"
                : accent === "text-warning"
                  ? "bg-warning/10"
                  : "bg-danger/10"
          }`}
        >
          <span className={accent}>{icon}</span>
        </div>
        {trend !== undefined && (
          <span
            className={`text-xs font-medium flex items-center gap-0.5
            ${trend >= 0 ? "text-accent" : "text-danger"}`}
          >
            <ArrowUpRight
              className={`w-3 h-3 ${trend < 0 ? "rotate-180" : ""}`}
            />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-text-primary">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="text-text-muted text-sm mt-0.5">{label}</p>
      {sub && <p className="text-text-muted text-xs mt-1">{sub}</p>}
    </div>
  );
}

// ─── Mini Bar Chart ────────────────────────────────────────────
function MiniChart({
  data,
}: {
  data: { date: string; sent: number; failed: number }[];
}) {
  const maxVal = Math.max(...data.map((d) => d.sent + d.failed), 1);
  const last7 = data.slice(-14); // tampilkan 14 hari terakhir

  return (
    <div className="flex items-end gap-0.5 h-16">
      {last7.map((d, i) => {
        const total = d.sent + d.failed;
        const height = total > 0 ? Math.max((total / maxVal) * 100, 4) : 2;
        const sentPct = total > 0 ? (d.sent / total) * 100 : 0;

        return (
          <div
            key={i}
            className="flex-1 flex flex-col justify-end group/bar relative"
          >
            <div
              className="w-full rounded-sm overflow-hidden"
              style={{ height: `${height}%` }}
              title={`${d.date}: ${d.sent} terkirim, ${d.failed} gagal`}
            >
              <div
                className="bg-accent/70 w-full"
                style={{ height: `${sentPct}%` }}
              />
              <div
                className="bg-danger/50 w-full"
                style={{ height: `${100 - sentPct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ stats: DashboardStats }>("/stats/dashboard")
      .then(({ data }) => setStats(data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Selamat pagi" : hour < 17 ? "Selamat siang" : "Selamat malam";

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <p className="text-text-muted text-sm">{greeting},</p>
        <h1 className="text-2xl font-bold text-text-primary mt-1">
          {user?.name} 👋
        </h1>
        <p className="text-text-secondary text-sm mt-1">Siap blast hari ini?</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-text-muted">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Memuat statistik...
        </div>
      ) : (
        <>
          {/* ── Stats utama ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={<Users className="w-4 h-4" />}
              label="Total Kontak"
              value={stats?.contacts.total ?? 0}
              sub={`+${stats?.contacts.thisMonth ?? 0} bulan ini`}
              accent="text-accent"
            />
            <StatCard
              icon={<Send className="w-4 h-4" />}
              label="Pesan Terkirim"
              value={stats?.messages.totalSent ?? 0}
              sub={`+${stats?.messages.thisMonth ?? 0} bulan ini`}
              accent="text-info"
            />
            <StatCard
              icon={<CheckCircle2 className="w-4 h-4" />}
              label="Success Rate"
              value={`${stats?.messages.successRate ?? 0}%`}
              sub="Dari semua pengiriman"
              accent="text-accent"
            />
            <StatCard
              icon={<TrendingUp className="w-4 h-4" />}
              label="Total Campaign"
              value={stats?.campaigns.total ?? 0}
              sub={`${stats?.campaigns.running ?? 0} sedang berjalan`}
              accent="text-warning"
            />
          </div>

          {/* ── Row 2: Chart + Channel ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Chart 14 hari */}
            <div className="card p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-text-primary font-semibold text-sm">
                    Aktivitas 14 Hari Terakhir
                  </h3>
                  <p className="text-text-muted text-xs mt-0.5">
                    Pesan terkirim vs gagal
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-accent/70 inline-block" />
                    Terkirim
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-danger/50 inline-block" />
                    Gagal
                  </span>
                </div>
              </div>
              {stats?.dailyStats && stats.dailyStats.length > 0 ? (
                <MiniChart data={stats.dailyStats} />
              ) : (
                <div className="h-16 flex items-center justify-center text-text-muted text-sm">
                  Belum ada data pengiriman
                </div>
              )}
            </div>

            {/* Channel breakdown */}
            <div className="card p-5">
              <h3 className="text-text-primary font-semibold text-sm mb-4">
                Channel
              </h3>
              <div className="space-y-3">
                {[
                  {
                    key: "whatsapp",
                    label: "WhatsApp",
                    icon: <MessageSquare className="w-4 h-4" />,
                    color: "text-accent",
                    bg: "bg-accent",
                  },
                  {
                    key: "email",
                    label: "Email",
                    icon: <Mail className="w-4 h-4" />,
                    color: "text-info",
                    bg: "bg-info",
                  },
                  {
                    key: "both",
                    label: "Keduanya",
                    icon: <Zap className="w-4 h-4" />,
                    color: "text-warning",
                    bg: "bg-warning",
                  },
                ].map(({ key, label, icon, color, bg }) => {
                  const count =
                    stats?.channels[key as keyof typeof stats.channels] ?? 0;
                  const total = (stats?.campaigns.total ?? 0) || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`flex items-center gap-1.5 text-xs ${color}`}
                        >
                          {icon}
                          {label}
                        </span>
                        <span className="text-text-muted text-xs">
                          {count} campaign
                        </span>
                      </div>
                      <div className="w-full bg-bg-border rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${bg}/60`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Campaign status summary ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[
              {
                label: "Berjalan",
                value: stats?.campaigns.running ?? 0,
                color: "text-info",
                icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
              },
              {
                label: "Selesai",
                value: stats?.campaigns.done ?? 0,
                color: "text-accent",
                icon: <CheckCircle2 className="w-3.5 h-3.5" />,
              },
              {
                label: "Gagal",
                value: stats?.campaigns.failed ?? 0,
                color: "text-danger",
                icon: <XCircle className="w-3.5 h-3.5" />,
              },
              {
                label: "Terjadwal",
                value: stats?.campaigns.scheduled ?? 0,
                color: "text-warning",
                icon: <Clock className="w-3.5 h-3.5" />,
              },
            ].map(({ label, value, color, icon }) => (
              <div key={label} className="card p-4 flex items-center gap-3">
                <span className={color}>{icon}</span>
                <div>
                  <p className="text-text-primary font-bold text-lg leading-none">
                    {value}
                  </p>
                  <p className="text-text-muted text-xs mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Recent activity ── */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-bg-border flex items-center justify-between">
              <h3 className="text-text-primary font-semibold text-sm">
                Campaign Terbaru
              </h3>
              <Link
                to="/history"
                className="text-accent text-xs hover:underline flex items-center gap-1"
              >
                Lihat semua <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {!stats?.recentActivity.length ? (
              <div className="p-8 text-center text-text-muted text-sm">
                Belum ada campaign.{" "}
                <Link to="/compose" className="text-accent hover:underline">
                  Buat sekarang →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-bg-border/50">
                {stats.recentActivity.slice(0, 5).map((c: any) => (
                  <div
                    key={c.id}
                    className="px-5 py-3 flex items-center gap-4 hover:bg-bg-surface/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm font-medium truncate">
                        {c.name}
                      </p>
                      <p className="text-text-muted text-xs">
                        {c.channel} ·{" "}
                        {new Date(c.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-text-primary text-sm font-mono">
                        {c.sent.toLocaleString()} / {c.total.toLocaleString()}
                      </p>
                      <span
                        className={`text-xs font-medium
                        ${
                          c.status === "done"
                            ? "text-accent"
                            : c.status === "running"
                              ? "text-info"
                              : c.status === "failed"
                                ? "text-danger"
                                : "text-text-muted"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Quick actions ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <Link
              to="/compose"
              className="card p-5 flex items-center justify-between group hover:border-accent/40 hover:shadow-glow transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Zap className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-text-primary font-semibold">
                    Kirim Pesan Baru
                  </p>
                  <p className="text-text-muted text-xs">
                    WA + Email sekaligus
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
            </Link>
            <Link
              to="/contacts"
              className="card p-5 flex items-center justify-between group hover:border-info/40 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center group-hover:bg-info/20 transition-colors">
                  <Users className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="text-text-primary font-semibold">
                    Kelola Kontak
                  </p>
                  <p className="text-text-muted text-xs">
                    {stats?.contacts.total.toLocaleString()} kontak tersimpan
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-info group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
