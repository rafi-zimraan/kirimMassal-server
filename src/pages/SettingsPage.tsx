import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import {
  Settings,
  Key,
  MessageSquare,
  Mail,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";
import api from "../lib/api";
import type { ApiError } from "../types";
import type { UserSettings } from "../types/campaign";

interface SettingsForm {
  fonnte_token: string;
  brevo_api_key: string;
  email_from: string;
  email_from_name: string;
}

interface TestState {
  loading: boolean;
  success: boolean | null;
  message: string;
}

const DEFAULT_TEST: TestState = { loading: false, success: null, message: "" };

export default function SettingsPage() {
  const [showFonnte, setShowFonnte] = useState(false);
  const [showBrevo, setShowBrevo] = useState(false);
  const [testWa, setTestWa] = useState<TestState>(DEFAULT_TEST);
  const [testEmail, setTestEmail] = useState<TestState>(DEFAULT_TEST);
  const [testPhone, setTestPhone] = useState("");
  const [testEmailTo, setTestEmailTo] = useState("");
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsForm>();

  // Load existing settings
  useEffect(() => {
    api
      .get<{ settings: UserSettings | null }>("/settings")
      .then(({ data }) => {
        if (data.settings) {
          reset({
            fonnte_token: data.settings.fonnte_token ?? "",
            brevo_api_key: data.settings.brevo_api_key ?? "",
            email_from: data.settings.email_from ?? "",
            email_from_name: data.settings.email_from_name ?? "",
          });
        }
      })
      .catch(() => {});
  }, []);

  const onSubmit = async (data: SettingsForm) => {
    setSaving(true);
    try {
      await api.put("/settings", data);
      toast.success("Pengaturan berhasil disimpan!");
    } catch (err) {
      const e = err as AxiosError<ApiError>;
      toast.error(e.response?.data?.message ?? "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleTestWa = async () => {
    if (!testPhone) {
      toast.error("Masukkan nomor WA tujuan test");
      return;
    }
    setTestWa({ loading: true, success: null, message: "" });
    try {
      const { data } = await api.post<{ success: boolean; message: string }>(
        "/settings/test-wa",
        { phone: testPhone },
      );
      setTestWa({
        loading: false,
        success: data.success,
        message: data.message,
      });
    } catch (err) {
      const e = err as AxiosError<ApiError>;
      setTestWa({
        loading: false,
        success: false,
        message: e.response?.data?.message ?? "Error",
      });
    }
  };

  const handleTestEmail = async () => {
    if (!testEmailTo) {
      toast.error("Masukkan email tujuan test");
      return;
    }
    setTestEmail({ loading: true, success: null, message: "" });
    try {
      const { data } = await api.post<{ success: boolean; message: string }>(
        "/settings/test-email",
        { email: testEmailTo },
      );
      setTestEmail({
        loading: false,
        success: data.success,
        message: data.message,
      });
    } catch (err) {
      const e = err as AxiosError<ApiError>;
      setTestEmail({
        loading: false,
        success: false,
        message: e.response?.data?.message ?? "Error",
      });
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
          <Settings className="w-5 h-5 text-accent" /> Pengaturan
        </h1>
        <p className="text-text-muted text-sm mt-0.5">
          Konfigurasi API Key untuk WA dan Email
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ── Fonnte (WhatsApp) ── */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-accent" />
            <h2 className="font-semibold text-text-primary">
              Fonnte — WhatsApp
            </h2>
            <a
              href="https://fonnte.com"
              target="_blank"
              rel="noreferrer"
              className="ml-auto text-xs text-accent hover:underline flex items-center gap-1"
            >
              Daftar Fonnte <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm text-text-secondary mb-1.5 block">
                Token API Fonnte
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  className="input pl-10 pr-10 font-mono text-sm"
                  type={showFonnte ? "text" : "password"}
                  placeholder="Token dari dashboard Fonnte"
                  {...register("fonnte_token")}
                />
                <button
                  type="button"
                  onClick={() => setShowFonnte(!showFonnte)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showFonnte ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-text-muted text-xs mt-1">
                Dapatkan token di: Fonnte Dashboard → Device → Token
              </p>
            </div>

            {/* Test WA */}
            <div className="bg-bg-surface rounded-lg p-4 space-y-3">
              <p className="text-sm text-text-secondary font-medium">
                Test Koneksi WA
              </p>
              <div className="flex gap-2">
                <input
                  className="input flex-1 text-sm font-mono"
                  placeholder="628xxxxxxxxxx"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleTestWa}
                  disabled={testWa.loading}
                  className="btn-ghost text-sm flex items-center gap-2 flex-shrink-0"
                >
                  {testWa.loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Kirim Test"
                  )}
                </button>
              </div>
              {testWa.message && (
                <div
                  className={`flex items-center gap-2 text-sm ${testWa.success ? "text-accent" : "text-danger"}`}
                >
                  {testWa.success ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  {testWa.message}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Brevo (Email) ── */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-info" />
            <h2 className="font-semibold text-text-primary">Brevo — Email</h2>
            <a
              href="https://app.brevo.com"
              target="_blank"
              rel="noreferrer"
              className="ml-auto text-xs text-info hover:underline flex items-center gap-1"
            >
              Buka Brevo <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm text-text-secondary mb-1.5 block">
                API Key Brevo
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  className="input pl-10 pr-10 font-mono text-sm"
                  type={showBrevo ? "text" : "password"}
                  placeholder="xkeysib-xxxxxxxxxx"
                  {...register("brevo_api_key")}
                />
                <button
                  type="button"
                  onClick={() => setShowBrevo(!showBrevo)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showBrevo ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-text-muted text-xs mt-1">
                Dapatkan API key di: Brevo → Settings → API Keys
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-text-secondary mb-1.5 block">
                  Email Pengirim
                </label>
                <input
                  className="input text-sm"
                  type="email"
                  placeholder="noreply@domainmu.com"
                  {...register("email_from", {
                    validate: (v) =>
                      !v ||
                      /\S+@\S+\.\S+/.test(v) ||
                      "Format email tidak valid",
                  })}
                />
                {errors.email_from && (
                  <p className="text-danger text-xs mt-1">
                    {errors.email_from.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm text-text-secondary mb-1.5 block">
                  Nama Pengirim
                </label>
                <input
                  className="input text-sm"
                  placeholder="Nama Bisnis Kamu"
                  {...register("email_from_name")}
                />
              </div>
            </div>

            {/* Test Email */}
            <div className="bg-bg-surface rounded-lg p-4 space-y-3">
              <p className="text-sm text-text-secondary font-medium">
                Test Koneksi Email
              </p>
              <div className="flex gap-2">
                <input
                  className="input flex-1 text-sm"
                  type="email"
                  placeholder="test@email.com"
                  value={testEmailTo}
                  onChange={(e) => setTestEmailTo(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleTestEmail}
                  disabled={testEmail.loading}
                  className="btn-ghost text-sm flex items-center gap-2 flex-shrink-0"
                >
                  {testEmail.loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Kirim Test"
                  )}
                </button>
              </div>
              {testEmail.message && (
                <div
                  className={`flex items-center gap-2 text-sm ${testEmail.success ? "text-accent" : "text-danger"}`}
                >
                  {testEmail.success ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  {testEmail.message}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save button */}
        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
            </>
          ) : (
            <>
              <Key className="w-4 h-4" /> Simpan Pengaturan
            </>
          )}
        </button>
      </form>
    </div>
  );
}
