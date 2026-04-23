import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Edit3,
  X,
  MessageSquare,
  Mail,
  Zap,
  Eye,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import clsx from "clsx";
import api from "../lib/api";
import type { MessageTemplate, CreateTemplatePayload } from "../types/template";
import type { CampaignChannel } from "../types/campaign";
import type { ApiError } from "../types";

// ─── Channel config ────────────────────────────────────────────
const CHANNEL_CONFIG = {
  whatsapp: {
    label: "WhatsApp",
    icon: MessageSquare,
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
  },
  email: {
    label: "Email",
    icon: Mail,
    color: "text-info",
    bg: "bg-info/10",
    border: "border-info/20",
  },
  both: {
    label: "WA+Email",
    icon: Zap,
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
  },
};

const TEMPLATE_VARS = [
  { var: "{{nama}}", desc: "Nama kontak" },
  { var: "{{phone}}", desc: "Nomor WA" },
  { var: "{{email}}", desc: "Email" },
];

// ─── Form values ───────────────────────────────────────────────
interface TemplateForm {
  name: string;
  channel: CampaignChannel;
  content: string;
  subject: string;
}

// ─── Modal Buat / Edit ─────────────────────────────────────────
function TemplateModal({
  template,
  onClose,
  onSaved,
}: {
  template: MessageTemplate | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = template !== null;
  const [isPreview, setIsPreview] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TemplateForm>({
    defaultValues: isEdit
      ? {
          name: template.name,
          channel: template.channel,
          content: template.content,
          subject: template.subject ?? "",
        }
      : { channel: "whatsapp", name: "", content: "", subject: "" },
  });

  const channel = watch("channel");
  const content = watch("content");

  const insertVar = (v: string) => setValue("content", watch("content") + v);

  const onSubmit = async (data: TemplateForm) => {
    try {
      const payload: CreateTemplatePayload = {
        name: data.name,
        channel: data.channel,
        content: data.content,
        subject: data.subject || undefined,
      };
      if (isEdit) {
        await api.put(`/templates/${template.id}`, payload);
        toast.success("Template diperbarui");
      } else {
        await api.post("/templates", payload);
        toast.success("Template disimpan");
      }
      onSaved();
      onClose();
    } catch (err) {
      const e = err as AxiosError<ApiError>;
      toast.error(e.response?.data?.message ?? "Gagal menyimpan template");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-xl max-h-[90vh] flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-bg-border flex-shrink-0">
          <h2 className="text-text-primary font-semibold">
            {isEdit ? "Edit Template" : "Buat Template Baru"}
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          <form
            id="template-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {/* Nama */}
            <div>
              <label className="text-sm text-text-secondary mb-1.5 block">
                Nama Template <span className="text-danger">*</span>
              </label>
              <input
                className="input"
                placeholder="Contoh: Promo Bulanan, Follow Up, dll"
                {...register("name", { required: "Nama wajib diisi" })}
              />
              {errors.name && (
                <p className="text-danger text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Channel */}
            <div>
              <label className="text-sm text-text-secondary mb-2 block">
                Channel
              </label>
              <Controller
                name="channel"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      Object.entries(CHANNEL_CONFIG) as [
                        CampaignChannel,
                        typeof CHANNEL_CONFIG.whatsapp,
                      ][]
                    ).map(([val, cfg]) => {
                      const Icon = cfg.icon;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => field.onChange(val)}
                          className={clsx(
                            "flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 transition-all text-sm",
                            field.value === val
                              ? `${cfg.bg} ${cfg.color} ${cfg.border}`
                              : "border-bg-border text-text-secondary hover:border-accent/30",
                          )}
                        >
                          <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              />
            </div>

            {/* Subject */}
            {(channel === "email" || channel === "both") && (
              <div className="animate-slide-up">
                <label className="text-sm text-text-secondary mb-1.5 block">
                  Subject Email <span className="text-danger">*</span>
                </label>
                <input
                  className="input"
                  placeholder="Subject email untuk {{nama}}"
                  {...register("subject", {
                    required:
                      channel !== "whatsapp"
                        ? "Subject wajib untuk email"
                        : false,
                  })}
                />
                {errors.subject && (
                  <p className="text-danger text-xs mt-1">
                    {errors.subject.message}
                  </p>
                )}
              </div>
            )}

            {/* Konten */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm text-text-secondary">
                  Isi Pesan <span className="text-danger">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsPreview(!isPreview)}
                  className="text-xs text-accent flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" /> {isPreview ? "Edit" : "Preview"}
                </button>
              </div>

              {/* Variabel */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {TEMPLATE_VARS.map((v) => (
                  <button
                    key={v.var}
                    type="button"
                    onClick={() => insertVar(v.var)}
                    title={v.desc}
                    className="text-xs font-mono bg-bg-surface border border-bg-border text-text-secondary
                               px-2 py-1 rounded hover:border-accent/50 hover:text-accent transition-colors"
                  >
                    {v.var}
                  </button>
                ))}
              </div>

              {isPreview ? (
                <div className="bg-bg-surface border border-bg-border rounded-lg p-3 min-h-[120px] text-text-primary text-sm whitespace-pre-wrap">
                  {content
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
                  rows={5}
                  placeholder={`Halo {{nama}},\n\nKami ingin menginfokan...\n\nSalam, Tim Kami`}
                  {...register("content", {
                    required: "Isi pesan wajib diisi",
                  })}
                />
              )}
              {errors.content && (
                <p className="text-danger text-xs mt-1">
                  {errors.content.message}
                </p>
              )}
              <p className="text-text-muted text-xs mt-1">
                {content.length} karakter
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-bg-border flex-shrink-0">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">
            Batal
          </button>
          <button
            type="submit"
            form="template-form"
            disabled={isSubmitting}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isEdit ? (
              "Simpan"
            ) : (
              "Buat Template"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Template Card ─────────────────────────────────────────────
function TemplateCard({
  template,
  onEdit,
  onDelete,
  onUse,
}: {
  template: MessageTemplate;
  onEdit: () => void;
  onDelete: () => void;
  onUse: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const cfg = CHANNEL_CONFIG[template.channel];
  const Icon = cfg.icon;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(template.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Isi pesan disalin!");
  };

  return (
    <div className="card p-5 hover:border-accent/20 transition-all group flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-text-primary font-semibold truncate">
            {template.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={clsx(
                "badge flex items-center gap-1 text-xs",
                cfg.bg,
                cfg.color,
                cfg.border,
                "border",
              )}
            >
              <Icon className="w-3 h-3" /> {cfg.label}
            </span>
            {template.used_count > 0 && (
              <span className="text-text-muted text-xs">
                Dipakai {template.used_count}x
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Subject (kalau ada) */}
      {template.subject && (
        <div className="bg-bg-surface rounded px-2.5 py-1.5">
          <p className="text-text-muted text-xs">
            Subject:{" "}
            <span className="text-text-secondary">{template.subject}</span>
          </p>
        </div>
      )}

      {/* Preview konten */}
      <p className="text-text-secondary text-sm line-clamp-3 leading-relaxed flex-1">
        {template.content}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-bg-border/50">
        <button
          onClick={onUse}
          className="btn-primary flex-1 text-xs py-1.5 flex items-center justify-center gap-1.5"
        >
          <Zap className="w-3.5 h-3.5" /> Pakai
        </button>
        <button
          onClick={handleCopy}
          title="Salin isi pesan"
          className="p-2 text-text-muted hover:text-accent hover:bg-accent/10 rounded transition-colors"
        >
          {copied ? (
            <Check className="w-4 h-4 text-accent" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={onEdit}
          title="Edit"
          className="p-2 text-text-muted hover:text-accent hover:bg-accent/10 rounded transition-colors"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          title="Hapus"
          className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────
export default function TemplatesPage() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCh, setFilterCh] = useState<"all" | CampaignChannel>("all");
  const [modal, setModal] = useState<MessageTemplate | null | "new">(null);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (filterCh !== "all") params.channel = filterCh;
      const { data } = await api.get<{ templates: MessageTemplate[] }>(
        "/templates",
        { params },
      );
      setTemplates(data.templates);
    } catch {
      toast.error("Gagal memuat template");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [search, filterCh]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Hapus template ini?")) return;
    try {
      await api.delete(`/templates/${id}`);
      toast.success("Template dihapus");
      fetchTemplates();
    } catch {
      toast.error("Gagal menghapus");
    }
  };

  const handleUse = (template: MessageTemplate) => {
    // Navigasi ke compose dengan state template
    api.post(`/templates/${template.id}/use`).catch(() => {});
    window.location.href = `/compose?template=${template.id}`;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" /> Template Pesan
          </h1>
          <p className="text-text-muted text-sm mt-0.5">
            {templates.length} template tersimpan
          </p>
        </div>
        <button
          onClick={() => setModal("new")}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Buat Template
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            className="input pl-10 text-sm"
            placeholder="Cari nama atau isi template..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5">
          {(["all", "whatsapp", "email", "both"] as const).map((ch) => (
            <button
              key={ch}
              onClick={() => setFilterCh(ch)}
              className={clsx(
                "text-xs px-3 py-2 rounded-lg font-medium transition-all border",
                filterCh === ch
                  ? "bg-accent text-bg-base border-accent"
                  : "text-text-secondary bg-bg-surface border-bg-border hover:border-accent/30",
              )}
            >
              {ch === "all" ? "Semua" : CHANNEL_CONFIG[ch].label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-text-muted">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Memuat...
        </div>
      ) : templates.length === 0 ? (
        <div className="card p-12 text-center border-dashed">
          <FileText className="w-10 h-10 text-text-muted/30 mx-auto mb-3" />
          <p className="text-text-secondary font-medium">
            {search || filterCh !== "all"
              ? "Tidak ada hasil"
              : "Belum ada template"}
          </p>
          <p className="text-text-muted text-sm mt-1">
            Simpan pesan yang sering dipakai agar tidak perlu ketik ulang
          </p>
          {!search && filterCh === "all" && (
            <button
              onClick={() => setModal("new")}
              className="btn-primary inline-flex items-center gap-2 mt-4 text-sm"
            >
              <Plus className="w-4 h-4" /> Buat Template Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onEdit={() => setModal(t)}
              onDelete={() => handleDelete(t.id)}
              onUse={() => handleUse(t)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modal !== null && (
        <TemplateModal
          template={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchTemplates}
        />
      )}
    </div>
  );
}
