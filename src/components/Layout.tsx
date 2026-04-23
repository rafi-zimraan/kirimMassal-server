import { NavLink, useNavigate } from "react-router-dom";
import {
  type LucideIcon,
  Zap,
  LayoutDashboard,
  Users,
  Send,
  History,
  Settings,
  LogOut,
  ChevronRight,
  FileText,
} from "lucide-react";
import clsx from "clsx";
import useAuthStore from "../store/authStore";

interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/contacts", icon: Users, label: "Kontak" },
  { to: "/compose", icon: Send, label: "Kirim Pesan" },
  { to: "/templates", icon: FileText, label: "Template" }, // ← BARU
  { to: "/history", icon: History, label: "Riwayat" },
  { to: "/settings", icon: Settings, label: "Pengaturan" },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-bg-base overflow-hidden">
      <aside className="w-60 flex-shrink-0 bg-bg-surface border-r border-bg-border flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-bg-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-accent/15 border border-accent/30 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-accent" />
            </div>
            <span className="font-bold text-text-primary text-lg">
              KirimMassal
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                  isActive
                    ? "bg-accent/10 text-accent border border-accent/20"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-card",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={clsx(
                      "w-4 h-4",
                      isActive
                        ? "text-accent"
                        : "text-text-muted group-hover:text-text-secondary",
                    )}
                  />
                  <span className="flex-1">{label}</span>
                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-accent/50" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-3 border-t border-bg-border">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
            <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-accent text-sm font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-text-primary text-sm font-medium truncate">
                {user?.name}
              </p>
              <p className="text-text-muted text-xs truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Keluar"
              className="text-text-muted hover:text-danger transition-colors p-1 rounded"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
