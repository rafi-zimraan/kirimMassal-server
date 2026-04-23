import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import {
  Send,
  MessageSquare,
  Mail,
  Zap,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import clsx from "clsx";
import api from "../lib/api";
import type { ApiError, PaginatedContacts } from "../types";
import type {
  Campaign,
  CreateCampaignPayload,
  CampaignChannel,
  CampaignStatusResponse,
} from "../types/campaign";

interface ComposeForm {
  name: string;
  channel: CampaignChannel;
  message: string;
  subject: string;
  scheduled_at: string; // datetime-local value
  is_scheduled: boolean;
}

const CHANNEL_OPTIONS = [
  {
    value: "whatsapp" as CampaignChannel,
    label: "WhatsApp",
    icon: MessageSquare,
    desc: "Via Fonnte API",
  },
  {
    value: "email" as CampaignChannel,
    label: "Email",
    icon: Mail,
    desc: "Via Brevo",
  },
  {
    value: "both" as CampaignChannel,
    label: "Keduanya",
    icon: Zap,
    desc: "WA + Email",
  },
];

const TEMPLATE_VARS = [
  { var: "{{nama}}", desc: "Nama kontak" },
  { var: "{{phone}}", desc: "Nomor WA" },
  { var: "{{email}}", desc: "Email" },
];

// ─── Progress Card ─────────────────────────────────────────────
function ProgressCard({
  campaignId,
  onDone,
}: {
  campaignId: number;
  onDone: () => void;
}) {
  const [status, setStatus] = useState<CampaignStatusResponse | null>(null);
  const ref = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const poll = async () => {
      try {
        const { data } = await api.get<CampaignStatusResponse>(
          `/campaigns/${campaignId}/status`,
        );
        setStatus(data);
        if (
          !data.running &&
          (data.status === "done" || data.status === "failed")
        ) {
          clearInterval(ref.current);
          onDone();
        }
      } catch {
        /* silent */
      }
    };
    poll();
    ref.current = setInterval(poll, 2000);
    return () => clearInterval(ref.current);
  }, [campaignId]);

  if (!status) return null;

  const isDone = status.status === "done";
  const isFailed = status.status === "failed";

  return (
    <div
      className={clsx(
        "card p-5 animate-slide-up",
        isDone && "border-accent/30 bg-accent/5",
        isFailed && "border-danger/30 bg-danger/5",
        !isDone && !isFailed && "border-info/30 bg-info/5",
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        {status.running ? (
          <Loader2 className="w-5 h-5 text-info animate-spin" />
        ) : isDone ? (
          <CheckCircle2 className="w-5 h-5 text-accent" />
        ) : (
          <AlertCircle className="w-5 h-5 text-danger" />
        )}
        <p className="font-medium text-text-primary">
          {status.running
            ? "Sedang mengirim..."
            : isDone
              ? "Selesai!"
              : "Dihentikan"}
        </p>
        <span className="ml-auto text-sm font-mono text-text-secondary">
          {status.progress}%
        </span>
      </div>
      <div className="w-full bg-bg-border rounded-full h-2 mb-3">
        <div
          className={clsx(
            "h-2 rounded-full transition-all duration-500",
            isDone ? "bg-accent" : isFailed ? "bg-danger" : "bg-info",
          )}
          style={{ width: `${status.progress}%` }}
        />
      </div>
      <div className="flex gap-4 text-sm">
        <span className="text-text-muted">
          Total: <b className="text-text-primary">{status.total}</b>
        </span>
        <span className="text-accent">✅ {status.sent} terkirim</span>
        {status.failed > 0 && (
          <span className="text-danger">❌ {status.failed} gagal</span>
        )}
      </div>
    </div>
  );
}

// ─── Min datetime untuk scheduler (sekarang + 5 menit) ────────
function getMinDatetime(): string {
  const d = new Date(Date.now() + 5 * 60 * 1000);
  return d.toISOString().slice(0, 16);
}

// ─── Main Page ─────────────────────────────────────────────────
export default function ComposePage() {
  const [contactCount, setContactCount] = useState(0);
  const [isPreview, setIsPreview] = useState(false);
  const [activeCampaign, setActiveCampaign] = useState<number | null>(null);
  const [sending, setSending] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ComposeForm>({
    defaultValues: {
      channel: "whatsapp",
      name: "",
      message: "",
      subject: "",
      scheduled_at: "",
      is_scheduled: false,
    },
  });

  const channel = watch("channel");
  const message = watch("message");
  const isScheduled = watch("is_scheduled");

  useEffect(() => {
    api
      .get<PaginatedContacts>("/contacts?limit=1")
      .then(({ data }) => setContactCount(data.total))
      .catch(() => {});
  }, []);

  const insertVar = (v: string) => setValue("message", watch("message") + v);

  const onSubmit = async (data: ComposeForm) => {
    if (contactCount === 0) {
      toast.error("Tambah kontak dulu!");
      return;
    }
    setSending(true);
    try {
      const payload: CreateCampaignPayload = {
        name: data.name,
        channel: data.channel,
        message: data.message,
        subject: data.subject || undefined,
        scheduled_at:
          data.is_scheduled && data.scheduled_at
            ? new Date(data.scheduled_at).toISOString()
            : undefined,
      };

      const { data: created } = await api.post<{ campaign: Campaign }>(
        "/campaigns",
        payload,
      );

      if (data.is_scheduled && data.scheduled_at) {
        // Jadwalkan — tidak langsung send
        toast.success(
          `Campaign dijadwalkan: ${new Date(data.scheduled_at).toLocaleString("id-ID")}`,
        );
      } else {
        // Langsung blast
        await api.post(`/campaigns/${created.campaign.id}/send`);
        setActiveCampaign(created.campaign.id);
        toast.success("Campaign dimulai!");
      }
    } catch (err) {
      const e = err as AxiosError<ApiError>;
      toast.error(e.response?.data?.message ?? "Gagal membuat campaign");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
          <Send className="w-5 h-5 text-accent" /> Kirim Pesan Massal
        </h1>
        <p className="text-text-muted text-sm mt-0.5">
          Akan dikirim ke{" "}
          <span className="text-accent font-semibold">
            {contactCount.toLocaleString()} kontak
          </span>
        </p>
      </div>

      {activeCampaign && (
        <div className="mb-6">
          <ProgressCard
            campaignId={activeCampaign}
            onDone={() => toast.success("Semua pesan diproses!")}
          />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Nama */}
        <div className="card p-5">
          <label className="text-sm font-medium text-text-secondary mb-2 block">
            Nama Campaign <span className="text-danger">*</span>
          </label>
          <input
            className="input"
            placeholder="Contoh: Promo Ramadan 2025"
            {...register("name", { required: "Nama campaign wajib diisi" })}
          />
          {errors.name && (
            <p className="text-danger text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Channel */}
        <div className="card p-5">
          <label className="text-sm font-medium text-text-secondary mb-3 block">
            Channel
          </label>
          <Controller
            name="channel"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-3 gap-3">
                {CHANNEL_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => field.onChange(opt.value)}
                      className={clsx(
                        "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all text-center",
                        field.value === opt.value
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-bg-border text-text-secondary hover:border-accent/30",
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{opt.label}</span>
                      <span className="text-xs opacity-70">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            )}
          />
        </div>

        {/* Subject */}
        {(channel === "email" || channel === "both") && (
          <div className="card p-5 animate-slide-up">
            <label className="text-sm font-medium text-text-secondary mb-2 block">
              Subject Email <span className="text-danger">*</span>
            </label>
            <input
              className="input"
              placeholder="Promo Spesial untuk {{nama}}!"
              {...register("subject", {
                required:
                  channel !== "whatsapp" ? "Subject wajib diisi" : false,
              })}
            />
            {errors.subject && (
              <p className="text-danger text-xs mt-1">
                {errors.subject.message}
              </p>
            )}
          </div>
        )}

        {/* Pesan */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-text-secondary">
              Isi Pesan <span className="text-danger">*</span>
            </label>
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className="text-xs text-accent hover:text-accent/80 flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" /> {isPreview ? "Edit" : "Preview"}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {TEMPLATE_VARS.map((v) => (
              <button
                key={v.var}
                type="button"
                onClick={() => insertVar(v.var)}
                title={v.desc}
                className="text-xs bg-bg-surface border border-bg-border text-text-secondary px-2 py-1 rounded
                           hover:border-accent/50 hover:text-accent transition-colors font-mono"
              >
                {v.var}
              </button>
            ))}
            <span className="text-xs text-text-muted self-center ml-1">
              ← klik untuk sisipkan
            </span>
          </div>

          {isPreview ? (
            <div className="bg-bg-surface border border-bg-border rounded-lg p-4 min-h-[140px] text-text-primary text-sm whitespace-pre-wrap">
              {message
                .replace(/\{\{nama\}\}/g, "Budi Santoso")
                .replace(/\{\{phone\}\}/g, "628123456789")
                .replace(/\{\{email\}\}/g, "budi@email.com") || (
                <span className="text-text-muted italic">
                  Tulis pesan dulu...
                </span>
              )}
            </div>
          ) : (
            <textarea
              className="input resize-none"
              rows={6}
              placeholder={`Halo {{nama}},\n\nKami ingin menginfokan...\n\nSalam, Tim Kami`}
              {...register("message", { required: "Pesan wajib diisi" })}
            />
          )}
          {errors.message && (
            <p className="text-danger text-xs mt-1">{errors.message.message}</p>
          )}
          <p className="text-text-muted text-xs mt-2">
            {message.length} karakter
          </p>
        </div>

        {/* ── SCHEDULER ─────────────────────────────────────── */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-warning" />
              <label className="text-sm font-medium text-text-primary">
                Jadwalkan Pengiriman
              </label>
            </div>
            <Controller
              name="is_scheduled"
              control={control}
              render={({ field }) => (
                <button
                  type="button"
                  onClick={() => field.onChange(!field.value)}
                  className={clsx(
                    "relative w-10 h-5 rounded-full transition-colors",
                    field.value ? "bg-accent" : "bg-bg-border",
                  )}
                >
                  <span
                    className={clsx(
                      "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
                      field.value ? "translate-x-5" : "translate-x-0.5",
                    )}
                  />
                </button>
              )}
            />
          </div>

          {isScheduled && (
            <div className="animate-slide-up">
              <label className="text-xs text-text-muted mb-1.5 block">
                Tanggal & Waktu Pengiriman
              </label>
              <input
                type="datetime-local"
                className="input text-sm"
                min={getMinDatetime()}
                {...register("scheduled_at", {
                  required: isScheduled ? "Pilih waktu pengiriman" : false,
                })}
              />
              {errors.scheduled_at && (
                <p className="text-danger text-xs mt-1">
                  {errors.scheduled_at.message}
                </p>
              )}
              <p className="text-text-muted text-xs mt-2">
                ⏰ Server akan otomatis mengirim pesan pada waktu yang
                ditentukan.
              </p>
            </div>
          )}

          {!isScheduled && (
            <p className="text-text-muted text-xs">
              Aktifkan untuk menjadwalkan pengiriman di waktu tertentu.
            </p>
          )}
        </div>

        {/* Info estimasi */}
        <div className="bg-bg-surface border border-bg-border rounded-lg p-4 text-sm">
          <div className="flex items-start gap-2 text-text-secondary">
            <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p>
                Dikirim dengan{" "}
                <b className="text-text-primary">delay 3 detik</b> antar kontak
                (anti-ban).
              </p>
              <p>
                Estimasi untuk{" "}
                <b className="text-text-primary">{contactCount} kontak</b>:{" "}
                <b className="text-accent">
                  {contactCount === 0
                    ? "–"
                    : contactCount < 20
                      ? `~${Math.ceil((contactCount * 3) / 60)} menit`
                      : `~${((contactCount * 3) / 60).toFixed(0)} menit`}
                </b>
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={sending || contactCount === 0}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
        >
          {sending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Mempersiapkan...
            </>
          ) : isScheduled ? (
            <>
              <Calendar className="w-5 h-5" /> Jadwalkan Campaign
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" /> Kirim ke{" "}
              {contactCount.toLocaleString()} Kontak
            </>
          )}
        </button>

        {contactCount === 0 && (
          <p className="text-center text-text-muted text-sm">
            Belum ada kontak.{" "}
            <a href="/contacts" className="text-accent hover:underline">
              Tambah kontak dulu →
            </a>
          </p>
        )}
      </form>
    </div>
  );
}
