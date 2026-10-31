"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Coins,
  Medal,
  Settings,
  LogOut,
  Menu,
  UserPlus,
  Loader2,
  Radio,
  Home,
  UserCog,
  Flag,
  Headphones,
  ShieldAlert,
  Building2,
  Banknote,
  Fingerprint,
  Package,
  Megaphone,
  Crown,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api, getSession, logout, type PanelSession, type PanelType } from "@/lib/api";

type NavLink = { label: string; href: string; icon: LucideIcon; match?: string[]; adminOnly?: boolean; badge?: string };
type NavGroup = { title: string; links: NavLink[] };

type PanelShellProps = {
  panel: PanelType | "dealer";
  children: React.ReactNode;
};

// Yönetim menüsü: gruplar. adminOnly bağlantılar yardımcı admine gösterilmez; badge, bekleyen iş sayısının anahtarıdır.
const adminGroups: NavGroup[] = [
  { title: "Genel", links: [{ label: "Genel Bakış", href: "/admin/dashboard", icon: LayoutDashboard, adminOnly: true }] },
  {
    title: "Topluluk",
    links: [
      { label: "Kullanıcılar", href: "/admin/users", icon: Users, match: ["/admin/user"] },
      { label: "Odalar", href: "/admin/rooms", icon: Radio, match: ["/admin/room"], adminOnly: true },
      { label: "Aileler", href: "/admin/families", icon: Home, adminOnly: true },
      { label: "Yetkililer", href: "/admin/staff", icon: UserCog, adminOnly: true },
    ],
  },
  {
    title: "Moderasyon",
    links: [
      { label: "Şikâyetler", href: "/admin/reports", icon: Flag, adminOnly: true, badge: "reports" },
      { label: "Destek", href: "/admin/support", icon: Headphones, badge: "support" },
      { label: "Güvenlik", href: "/admin/security", icon: ShieldAlert, adminOnly: true, badge: "errors" },
    ],
  },
  {
    title: "Ajans ve ödeme",
    links: [
      { label: "Ajanslar", href: "/admin/agencies", icon: Building2, adminOnly: true, badge: "agencyTotal" },
      { label: "Maaş Dönemleri", href: "/admin/payouts", icon: Banknote, match: ["/admin/payout"], adminOnly: true },
      { label: "Kimlik Onayları", href: "/admin/kyc", icon: Fingerprint, adminOnly: true, badge: "kyc" },
    ],
  },
  {
    title: "Ekonomi",
    links: [
      { label: "Mali Kayıtlar", href: "/admin/coins", icon: Coins, adminOnly: true },
      { label: "Katalog", href: "/admin/catalog", icon: Package, adminOnly: true },
      { label: "WIP Mağazası", href: "/admin/wip", icon: Crown, adminOnly: true },
      { label: "Madalyalar", href: "/admin/medals", icon: Medal, adminOnly: true },
    ],
  },
  {
    title: "Sistem",
    links: [
      { label: "Duyurular", href: "/admin/announcements", icon: Megaphone, adminOnly: true },
      { label: "Ayarlar", href: "/admin/settings", icon: Settings, adminOnly: true },
    ],
  },
];

const panelConfig: Record<PanelType, { title: string; subtitle: string; groups: NavGroup[] }> = {
  admin: { title: "Yönetim Paneli", subtitle: "TR LIVE MANAGEMENT", groups: adminGroups },
  agency: {
    title: "Ajans Paneli",
    subtitle: "TR LIVE AGENCY",
    groups: [
      {
        title: "Menü",
        links: [
          { label: "Genel Bakış", href: "/agency/dashboard", icon: LayoutDashboard },
          { label: "Yayıncılar", href: "/agency/broadcasters", icon: Users },
          { label: "Kazançlar", href: "/agency/earnings", icon: Coins },
          { label: "Davet ve Transfer", href: "/agency/invite", icon: UserPlus },
          { label: "Ayarlar", href: "/agency/settings", icon: Settings },
        ],
      },
    ],
  },
};

type Pending = { support?: number; reports?: number; kyc?: number; transfers?: number; applications?: number; broadcasters?: number; errors?: number };

const roleText: Record<string, string> = { admin: "Yönetici", support: "Yardımcı admin" };

/** Panel çerçevesi: oturum yoksa giriş sayfasına yönlendirir; menü, kullanıcı ve çıkış. */
export default function PanelShell({ panel, children }: PanelShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [session, setSession] = useState<PanelSession | null>(null);
  const [checked, setChecked] = useState(false);
  const [pending, setPending] = useState<Pending>({});

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

  // Menü rozetleri (bekleyen işler): sayfa değişince ve her 60 saniyede bir yenilenir.
  useEffect(() => {
    if (active !== "admin" || !checked) return;
    let alive = true;
    const load = () =>
      api<Pending>("/api/admin/overview/pending")
        .then((p) => {
          if (alive) setPending(p);
        })
        .catch(() => {});
    load();
    const t = window.setInterval(load, 60000);
    return () => {
      alive = false;
      window.clearInterval(t);
    };
  }, [active, checked, pathname]);

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

  const isFull = active === "agency" || session.user.systemRole === "admin";
  const badgeCount = (k: string): number => {
    if (k === "agencyTotal") return (pending.transfers ?? 0) + (pending.applications ?? 0) + (pending.broadcasters ?? 0);
    return Number((pending as Record<string, number | undefined>)[k] ?? 0);
  };

  async function signOut() {
    await logout();
    router.replace(`/${active}/login`);
  }

  return (
    <div className="min-h-screen bg-[#090909] text-white">
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#292319] bg-[#101010] p-5 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-5 shrink-0">
            <div className="text-2xl font-black tracking-widest text-[#d7b56d]">TR LIVE</div>
            <div className="mt-2 text-xs tracking-[0.25em] text-gray-500">{config.subtitle}</div>
          </div>

          <div className="mb-5 shrink-0 rounded-xl border border-[#30291e] bg-[#151209] p-4">
            <p className="truncate text-sm font-semibold text-white">{who}</p>
            <p className="mt-1 text-xs text-[#d7b56d]">{roleLabel}</p>
            {active === "agency" && session.agencyName && <p className="mt-1 truncate text-xs text-gray-500">{session.agencyName}</p>}
          </div>

          <nav className="-mr-2 flex-1 space-y-5 overflow-y-auto pr-2">
            {config.groups.map((g) => {
              const links = g.links.filter((l) => !l.adminOnly || isFull);
              if (!links.length) return null;
              return (
                <div key={g.title}>
                  <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-widest text-gray-500">{g.title}</div>
                  <div className="space-y-1">
                    {links.map((item) => {
                      const Icon = item.icon;
                      const here = pathname.replace(/\/+$/, "");
                      const isActive = here === item.href || (item.match ?? []).some((m) => here === m);
                      const n = item.badge ? badgeCount(item.badge) : 0;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                            isActive ? "border border-[#8c713d] bg-[#292114] text-[#e5c77e]" : "border border-transparent text-gray-400 hover:bg-[#1d1d1d] hover:text-white"
                          }`}
                        >
                          <Icon size={17} />
                          <span className="flex-1">{item.label}</span>
                          {n > 0 && <span className="rounded-full bg-red-600 px-1.5 text-[11px] font-bold text-white">{n > 99 ? "99+" : n}</span>}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={signOut}
            className="mt-4 flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-red-400 hover:bg-red-950/30"
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
