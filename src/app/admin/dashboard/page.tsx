import type { Metadata } from "next";
import PanelShell from "@/components/panel-shell";
import {
  Users,
  Coins,
  Gift,
  Building2,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Yönetim Paneli | TR Live",
};

const stats = [
  {
    label: "Toplam Kullanıcı",
    value: "—",
    note: "API bağlantısı bekleniyor",
    icon: Users,
  },
  {
    label: "Coin İşlemleri",
    value: "—",
    note: "API bağlantısı bekleniyor",
    icon: Coins,
  },
  {
    label: "Aktif Ajanslar",
    value: "—",
    note: "API bağlantısı bekleniyor",
    icon: Building2,
  },
  {
    label: "WIP Mağazası",
    value: "Yönetim",
    note: "Mağaza bölümüne erişim",
    icon: Gift,
  },
];

export default function AdminDashboardPage() {
  return (
    <PanelShell panel="admin">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm text-[#d7b56d]">Hoş geldiniz</p>
          <h2 className="mt-1 text-2xl font-bold">Platform Genel Bakış</h2>
          <p className="mt-2 text-sm text-gray-500">
            TR Live yönetim merkezinin genel durumu.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-[#4b3c22] bg-[#17140e] px-4 py-3 text-sm text-[#d7b56d]">
          <ShieldCheck size={18} />
          Yönetim alanı
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-2xl border border-[#30291e] bg-[#111111] p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{item.label}</span>
                <div className="rounded-xl bg-[#292114] p-3 text-[#d7b56d]">
                  <Icon size={20} />
                </div>
              </div>

              <div className="mt-6 text-2xl font-bold text-white">
                {item.value}
              </div>

              <p className="mt-2 text-xs text-gray-500">{item.note}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-2">
        <div className="rounded-2xl border border-[#30291e] bg-[#111111] p-6">
          <h3 className="text-lg font-semibold">Yönetim kısayolları</h3>
          <p className="mt-1 text-sm text-gray-500">
            Yönetim bölümlerine buradan ulaşabilirsiniz.
          </p>

          <div className="mt-5 space-y-3">
            {[
              ["Kullanıcı yönetimi", "/admin/users"],
              ["Coin işlemleri", "/admin/coins"],
              ["WIP mağazası", "/admin/wip"],
              ["Madalya sistemi", "/admin/medals"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="flex items-center justify-between rounded-xl border border-[#292319] bg-[#171717] px-4 py-4 text-sm text-gray-300 transition hover:border-[#8c713d] hover:text-[#e5c77e]"
              >
                {label}
                <ArrowUpRight size={17} />
              </a>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#30291e] bg-[#111111] p-6">
          <h3 className="text-lg font-semibold">Sistem bağlantısı</h3>
          <p className="mt-1 text-sm text-gray-500">
            Mevcut TR Live servislerinin durumu.
          </p>

          <div className="mt-6 rounded-xl border border-[#292319] bg-[#171717] p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Backend API</span>
              <span className="text-xs text-amber-400">Doğrulanmadı</span>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Gerçek bağlantı kontrolü API entegrasyonunda yapılacak.
            </p>
          </div>

          <div className="mt-3 rounded-xl border border-[#292319] bg-[#171717] p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Veritabanı</span>
              <span className="text-xs text-amber-400">Doğrulanmadı</span>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Mevcut PostgreSQL servisi kullanılacak; burada yeni veritabanı oluşturulmayacak.
            </p>
          </div>
        </div>
      </div>
    </PanelShell>
  );
}
