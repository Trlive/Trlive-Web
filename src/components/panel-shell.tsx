"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Coins,
  Gift,
  Medal,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

type PanelType = "admin" | "agency" | "dealer";

type PanelShellProps = {
  panel: PanelType;
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
      { label: "WIP Mağazası", href: "/agency/wip", icon: Gift },
      { label: "Madalya Sistemi", href: "/agency/medals", icon: Medal },
      { label: "Ayarlar", href: "/agency/settings", icon: Settings },
    ],
  },
  dealer: {
    title: "Coin Bayi Paneli",
    subtitle: "TR LIVE COIN DEALER",
    links: [
      { label: "Genel Bakış", href: "/dealer/dashboard", icon: LayoutDashboard },
      { label: "Coin İşlemleri", href: "/dealer/transactions", icon: Coins },
      { label: "İşlem Geçmişi", href: "/dealer/history", icon: Users },
      { label: "Ayarlar", href: "/dealer/settings", icon: Settings },
    ],
  },
};

export default function PanelShell({
  panel,
  children,
}: PanelShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const config = panelConfig[panel];

  return (
    <div className="min-h-screen bg-[#090909] text-white">
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-[#292319] bg-[#101010] p-6 transition-transform lg:static lg:translate-x-0 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-10">
            <div className="text-2xl font-black tracking-widest text-[#d7b56d]">
              TR LIVE
            </div>
            <div className="mt-2 text-xs tracking-[0.25em] text-gray-500">
              {config.subtitle}
            </div>
          </div>

          <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
            Menü
          </div>

          <nav className="space-y-2">
            {config.links.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                    active
                      ? "border border-[#8c713d] bg-[#292114] text-[#e5c77e]"
                      : "text-gray-400 hover:bg-[#1d1d1d] hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Link
            href={`/${panel}/login`}
            className="mt-10 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-400 hover:bg-red-950/30"
          >
            <LogOut size={18} />
            Oturumu Kapat
          </Link>
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
                <h1 className="text-lg font-bold text-white">
                  {config.title}
                </h1>
                <p className="text-xs text-gray-500">
                  TR Live yönetim sistemi
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-[#4b3c22] px-4 py-2 text-xs text-[#d7b56d] sm:flex">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Panel
            </div>
          </header>

          <section className="p-5 md:p-8">{children}</section>
        </main>
      </div>
    </div>
  );
}
