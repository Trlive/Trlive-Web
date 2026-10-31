"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Coins,
  Gift,
  Medal,
  Settings,
  LogOut,
  Menu,
  UserPlus,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getSession, logout, type PanelSession, type PanelType } from "@/lib/api";

type PanelShellProps = {
  panel: PanelType | "dealer";
  children: React.ReactNode;
};

const panelConfig = {
  admin: {
    title: "Yönetim Paneli",
    subtitle: "TR LIVE MANAGEMENT",
    links: [
      { label: "Genel Bakış", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Kullanıcılar", href: "/admin/users", icon: Users },
      { label: "Coin İşlemleri", href: "/admin/coins", icon: Coins },
      { label: "WIP Mağazası", href: "/admin/wip", icon: Gift },
      { label: "Madalya Sistemi", href: "/admin/medals", icon: Medal },
      { label: "Ayarlar", href: "/admin/settings", icon: Settings },
    ],
  },
  agency: {
    title: "Ajans Paneli",
    subtitle: "TR LIVE AGENCY",
    links: [
      { label: "Genel Bakış", href: "/agency/dashboard", icon: LayoutDashboard },
      { label: "Yayıncılar", href: "/agency/broadcasters", icon: Users },
      { label: "Kazançlar", href: "/agency/earnings", icon: Coins },
      { label: "Davet ve Transfer", href: "/agency/invite", icon: UserPlus },
      { label: "Ayarlar", href: "/agency/settings", icon: Settings },
    ],
  },
};

const roleText: Record<string, string> = { admin: "Yönetici", support: "Yardımcı admin" };

/** Panel çerçevesi: oturum yoksa giriş sayfasına yönlendirir; menü, kullanıcı ve çıkış. */
export default function PanelShell({ panel, children }: PanelShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [session, setSession] = useState<PanelSession | null>(null);
  const [checked, setChecked] = useState(false);

  // Bayi paneli kaldırıldı (e-pin sistemi gelecek): eski adresler ana sayfaya döner.
  const active: PanelType | null = panel === "dealer" ? null : panel;

  useEffect(() => {
    if (!active) {
      router.replace("/");
      return;
    }
    const s = getSession(active);
    if (!s) {
      router.replace(`/${active}/login`);
      return;
    }
    setSession(s);
    setChecked(true);
    const onLogout = () => router.replace(`/${active}/login`);
    window.addEventListener("trlive-logout", onLogout);
    return () => window.removeEventListener("trlive-logout", onLogout);
  }, [active, router]);

  if (!active || !checked || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090909] text-sm text-gray-400">
        <Loader2 size={18} className="mr-3 animate-spin text-[#d7b56d]" />
        Oturum kontrol ediliyor...
      </div>
    );
  }

  const config = panelConfig[active];
  const who = session.user.displayName || session.user.username || "Kullanıcı";
  const roleLabel =
    active === "admin"
      ? roleText[session.user.systemRole ?? ""] ?? "Yetkili"
      : session.agencyRole === "owner"
        ? "Ajans sahibi"
        : "Ajans asistanı";

  async function signOut() {
    await logout();
    router.replace(`/${active}/login`);
  }

  return (
    <div className="min-h-screen bg-[#090909] text-white">
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#292319] bg-[#101010] p-6 transition-transform lg:static lg:translate-x-0 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-8">
            <div className="text-2xl font-black tracking-widest text-[#d7b56d]">TR LIVE</div>
            <div className="mt-2 text-xs tracking-[0.25em] text-gray-500">{config.subtitle}</div>
          </div>

          <div className="mb-6 rounded-xl border border-[#30291e] bg-[#151209] p-4">
            <p className="truncate text-sm font-semibold text-white">{who}</p>
            <p className="mt-1 text-xs text-[#d7b56d]">{roleLabel}</p>
            {active === "agency" && session.agencyName && <p className="mt-1 truncate text-xs text-gray-500">{session.agencyName}</p>}
          </div>

          <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">Menü</div>

          <nav className="space-y-2">
            {config.links.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname === `${item.href}/`;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                    isActive ? "border border-[#8c713d] bg-[#292114] text-[#e5c77e]" : "text-gray-400 hover:bg-[#1d1d1d] hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={signOut}
            className="mt-auto flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-red-400 hover:bg-red-950/30"
          >
            <LogOut size={18} />
            Oturumu Kapat
          </button>
        </aside>

        {menuOpen && (
          <button
            type="button"
            aria-label="Menüyü kapat"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          />
        )}

        <main className="min-w-0 flex-1">
          <header className="flex h-20 items-center justify-between border-b border-[#292319] bg-[#101010] px-5 md:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Menüyü aç"
                onClick={() => setMenuOpen(true)}
                className="rounded-lg border border-[#383024] p-2 text-[#d7b56d] lg:hidden"
              >
                <Menu size={20} />
              </button>
              <div>
                <h1 className="text-lg font-bold text-white">{config.title}</h1>
                <p className="text-xs text-gray-500">TR Live yönetim sistemi</p>
              </div>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-[#4b3c22] px-4 py-2 text-xs text-[#d7b56d] sm:flex">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Güvenli oturum
            </div>
          </header>

          <section className="p-5 md:p-8">{children}</section>
        </main>
      </div>
    </div>
  );
}
