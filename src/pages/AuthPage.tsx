import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Zap, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
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
  const navigate = useNavigate();
  const { login, register: registerUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>();

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
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-info/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-accent/10 border border-accent/30 rounded-xl mb-4">
            <Zap className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">KirimMassal</h1>
          <p className="text-text-secondary text-sm mt-1">
            Platform pesan massal untuk bisnismu
          </p>
        </div>

        {/* Card */}
        <div className="card p-6">
          {/* Tab switch */}
          <div className="flex bg-bg-surface rounded-lg p-1 mb-6">
            {(["login", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  mode === m
                    ? "bg-accent text-bg-base"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {m === "login" ? "Masuk" : "Daftar"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="text-sm text-text-secondary mb-1.5 block">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    className="input pl-10"
                    placeholder="John Doe"
                    {...register("name" as keyof FormValues, {
                      required: "Nama wajib diisi",
                    })}
                  />
                </div>
                {"name" in errors && errors.name && (
                  <p className="text-danger text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="text-sm text-text-secondary mb-1.5 block">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  className="input pl-10"
                  type="email"
                  placeholder="kamu@email.com"
                  {...register("email", { required: "Email wajib diisi" })}
                />
              </div>
              {errors.email && (
                <p className="text-danger text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm text-text-secondary mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  className="input pl-10"
                  type="password"
                  placeholder="••••••••"
                  {...register("password", {
                    required: "Password wajib diisi",
                    minLength: { value: 6, message: "Min 6 karakter" },
                  })}
                />
              </div>
              {errors.password && (
                <p className="text-danger text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Masuk" : "Buat Akun"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-text-muted text-xs mt-4">
          © {new Date().getFullYear()} KirimMassal · Dibuat dengan ❤️ di
          Indonesia
        </p>
      </div>
    </div>
  );
}
