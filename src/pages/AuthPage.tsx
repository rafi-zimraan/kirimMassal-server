import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Zap,
  TrendingUp,
  CheckCircle2,
  Send,
} from "lucide-react";
import { AxiosError } from "axios";
import useAuthStore from "../store/authStore";
import type { ApiError } from "../types";

type Mode = "login" | "register";

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm extends LoginForm {
  name: string;
}

type FormValues = LoginForm | RegisterForm;

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();
  const { login, register: registerUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<FormValues>();

  const watchEmail = watch("email");
  const watchPassword = watch("password");
  const watchName = watch("name");

  useEffect(() => {
    if (mode === "login") {
      setIsFormValid(!!(watchEmail && watchPassword && watchPassword.length >= 6));
    } else {
      setIsFormValid(!!(watchName && watchEmail && watchPassword && watchPassword.length >= 6));
    }
  }, [watchEmail, watchPassword, watchName, mode]);

  const onSubmit = async (data: FormValues) => {
    try {
      if (mode === "login") {
        const { email, password } = data as LoginForm;
        await login(email, password);
        toast.success("Selamat datang kembali!");
      } else {
        const { name, email, password } = data as RegisterForm;
        await registerUser(name!, email, password);
        toast.success("Akun berhasil dibuat!");
      }
      navigate("/");
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      toast.error(axiosErr.response?.data?.message ?? "Terjadi kesalahan");
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    reset();
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", overflow: "hidden" }}>
      <style>{`
        .auth-input:focus { border-color: #10b981 !important; box-shadow: 0 0 0 3px rgba(16,185,129,0.12); }
      `}</style>

      {/* ══════════════════════════════════════════
          LEFT PANEL — Form (White background)
      ══════════════════════════════════════════ */}
      <div
        style={{
          background: "#ffffff",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "48px",
          position: "relative",
        }}
        className="lg:w-[45%]"
      >
        {/* Subtle gradient tint */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(16,185,129,0.03) 0%, rgba(14,165,233,0.03) 100%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 400, margin: "0 auto", width: "100%" }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36 }}>
            <div
              style={{
                width: 44,
                height: 44,
                background: "linear-gradient(135deg, #10b981, #0ea5e9)",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Zap size={22} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, background: "linear-gradient(135deg, #10b981, #0ea5e9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                KirimMassal
              </div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>Customer Service Platform</div>
            </div>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 36, fontWeight: 700, color: "#111827", margin: 0, marginBottom: 8 }}>
              {mode === "login" ? "Masuk" : "Buat Akun"}
            </h1>
            <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
              {mode === "login"
                ? "Lihat pertumbuhan dan dapatkan dukungan konsultasi!"
                : "Daftar dan mulai kelola broadcast yayasanmu"}
            </p>
          </div>

          {/* Card */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            }}
          >
            {/* Google Button */}
            <button
              type="button"
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: "10px 16px",
                border: "1px solid #d1d5db",
                borderRadius: 10,
                background: "#ffffff",
                color: "#374151",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                marginBottom: 20,
                transition: "background 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
              onMouseLeave={e => (e.currentTarget.style.background = "#ffffff")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#4285F4" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Masuk dengan Google
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, borderTop: "1px solid #e5e7eb" }} />
              <span style={{ fontSize: 12, color: "#9ca3af" }}>atau masuk dengan email</span>
              <div style={{ flex: 1, borderTop: "1px solid #e5e7eb" }} />
            </div>

            {/* Tab switcher */}
            <div
              style={{
                display: "flex",
                background: "#f3f4f6",
                borderRadius: 10,
                padding: 4,
                marginBottom: 20,
              }}
            >
              {(["login", "register"] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    fontSize: 14,
                    fontWeight: 600,
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    background: mode === m
                      ? "linear-gradient(135deg, #10b981, #0ea5e9)"
                      : "transparent",
                    color: mode === m ? "#ffffff" : "#6b7280",
                    boxShadow: mode === m ? "0 2px 8px rgba(16,185,129,0.3)" : "none",
                  }}
                >
                  {m === "login" ? "Masuk" : "Daftar"}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Name (register only) */}
              {mode === "register" && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                    Nama Lengkap
                  </label>
                  <div style={{ position: "relative" }}>
                    <User
                      size={16}
                      color="#9ca3af"
                      style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
                    />
                    <input
                      style={{
                        width: "100%",
                        padding: "10px 12px 10px 38px",
                        border: "1px solid #d1d5db",
                        borderRadius: 8,
                        fontSize: 14,
                        color: "#111827",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                      className="auth-input"
                      placeholder="John Doe"
                      {...register("name" as keyof FormValues, { required: "Nama wajib diisi" })}
                    />
                  </div>
                  {"name" in errors && errors.name && (
                    <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{errors.name.message}</p>
                  )}
                </div>
              )}

              {/* Email */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                  Email
                </label>
                <div style={{ position: "relative" }}>
                  <Mail
                    size={16}
                    color="#9ca3af"
                    style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
                  />
                  <input
                    style={{
                      width: "100%",
                      padding: "10px 12px 10px 38px",
                      border: "1px solid #d1d5db",
                      borderRadius: 8,
                      fontSize: 14,
                      color: "#111827",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    className="auth-input"
                    type="email"
                    placeholder="mail@website.com"
                    {...register("email", { required: "Email wajib diisi" })}
                  />
                </div>
                {errors.email && (
                  <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <Lock
                    size={16}
                    color="#9ca3af"
                    style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
                  />
                  <input
                    style={{
                      width: "100%",
                      padding: "10px 38px 10px 38px",
                      border: "1px solid #d1d5db",
                      borderRadius: 8,
                      fontSize: 14,
                      color: "#111827",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    className="auth-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 character"
                    {...register("password", {
                      required: "Password wajib diisi",
                      minLength: { value: 6, message: "Min 6 karakter" },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#9ca3af",
                      padding: 0,
                      display: "flex",
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{errors.password.message}</p>
                )}
              </div>

              {/* Remember & Forgot */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    style={{ width: 16, height: 16, accentColor: "#10b981", cursor: "pointer" }}
                  />
                  Ingat saya
                </label>
                <a href="#" style={{ fontSize: 13, color: "#0ea5e9", fontWeight: 500, textDecoration: "none" }}>
                  Lupa password?
                </a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: isFormValid && !isSubmitting
                    ? "linear-gradient(135deg, #10b981, #0ea5e9)"
                    : "#d1d5db",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: isFormValid && !isSubmitting ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {isSubmitting ? (
                  <div className="loader-dots">
                    <span style={{ background: "#fff" }} />
                    <span style={{ background: "#fff" }} />
                    <span style={{ background: "#fff" }} />
                  </div>
                ) : (
                  mode === "login" ? "Masuk" : "Buat Akun"
                )}
              </button>
            </form>

            {/* Switch link */}
            <p style={{ textAlign: "center", fontSize: 13, color: "#6b7280", marginTop: 16, marginBottom: 0 }}>
              {mode === "login" ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
              <button
                type="button"
                onClick={() => switchMode(mode === "login" ? "register" : "login")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#10b981", fontWeight: 600, fontSize: 13 }}
              >
                {mode === "login" ? "Buat Akun" : "Masuk"}
              </button>
            </p>
          </div>

          {/* Footer */}
          <p style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", marginTop: 24 }}>
            © 2025 KirimMassal · All rights reserved.
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT PANEL — Decorative (hidden mobile)
      ══════════════════════════════════════════ */}
      <div
        className="hidden lg:flex"
        style={{
          width: "55%",
          flexShrink: 0,
          background: "linear-gradient(135deg, #059669 0%, #0ea5e9 50%, #10b981 100%)",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated blobs */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div
            style={{
              position: "absolute",
              top: -60,
              right: -60,
              width: 300,
              height: 300,
              background: "rgba(255,255,255,0.1)",
              borderRadius: "50%",
              filter: "blur(40px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 80,
              left: -40,
              width: 250,
              height: 250,
              background: "rgba(255,255,255,0.08)",
              borderRadius: "50%",
              filter: "blur(40px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "45%",
              right: "10%",
              width: 180,
              height: 180,
              background: "rgba(255,255,255,0.06)",
              borderRadius: "50%",
              filter: "blur(30px)",
            }}
          />
          {/* Grid pattern */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Top content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: 40, fontWeight: 700, color: "#ffffff", margin: 0, marginBottom: 16, lineHeight: 1.2 }}>
            Turn your ideas
            <br />
            into reality.
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", margin: 0, maxWidth: 340, lineHeight: 1.6 }}>
            Platform komunikasi broadcast untuk meningkatkan layanan customer service yayasanmu dengan mudah dan efisien.
          </p>
        </div>

        {/* Stats cards */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { icon: <Send size={18} color="white" />, value: "500+", label: "Yayasan aktif menggunakan platform" },
            { icon: <CheckCircle2 size={18} color="white" />, value: "90%", label: "Tingkat keberhasilan pengiriman" },
            { icon: <TrendingUp size={18} color="white" />, value: "3x", label: "Lebih cepat dari broadcast manual" },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 14,
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#ffffff", lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonial Card */}
        <div style={{ position: "relative", zIndex: 1, marginTop: 12 }}>
          <div
            style={{
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 20,
              padding: "28px 32px",
            }}
          >
            {/* Quote mark */}
            <div
              style={{
                fontSize: 64,
                lineHeight: 1,
                color: "rgba(255,255,255,0.25)",
                fontFamily: "Georgia, serif",
                marginBottom: 4,
                marginTop: -8,
              }}
            >
              "
            </div>

            {/* Quote text */}
            <p
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.92)",
                lineHeight: 1.65,
                margin: 0,
                marginBottom: 20,
                fontStyle: "italic",
              }}
            >
              Platform ini menghemat waktu tim CS kami hingga 5 jam sehari.
              Broadcast ke ribuan kontak kini hanya butuh hitungan menit.
            </p>

            {/* Author */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#ffffff" }}>
                  Nur Azizah
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
                  Head of Customer Service · Yayasan Peduli Bangsa
                </div>
              </div>

              {/* Pagination dots */}
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {[0, 1, 2].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: 6,
                      width: i === 0 ? 20 : 6,
                      borderRadius: 3,
                      background: i === 0 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
