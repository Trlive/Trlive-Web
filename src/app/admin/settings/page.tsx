import type { Metadata } from "next";
import PanelShell from "@/components/panel-shell";
import {
  Settings,
  ShieldCheck,
  Database,
  Server,
  Bell,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Yönetim Ayarları | TR Live",
};

const settings = [
  {
    title: "Güvenlik",
    description: "Yönetici erişimi ve yetki kontrolleri.",
    icon: ShieldCheck,
  },
  {
    title: "Backend API",
    description: "Mevcut TR Live API bağlantı bilgileri.",
    icon: Server,
  },
  {
    title: "Veritabanı",
    description: "Mevcut PostgreSQL hizmetinin bağlantı durumu.",
    icon: Database,
  },
  {
    title: "Bildirimler",
    description: "Panel bildirimlerinin yönetimi.",
    icon: Bell,
  },
];

export default function AdminSettingsPage() {
  return (
    <PanelShell panel="admin">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-[#d7b56d]">
          <Settings size={18} />
          Sistem ayarları
        </div>

        <h2 className="mt-2 text-2xl font-bold">Yönetim Ayarları</h2>

        <p className="mt-2 text-sm text-gray-500">
          Yönetim paneli ve mevcut servisler hakkındaki ayarlar.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {settings.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-[#30291e] bg-[#111111] p-5"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#292114] p-3 text-[#d7b56d]">
                  <Icon size={21} />
                </div>

                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[#30291e] pt-4">
                <span className="text-xs text-gray-500">
                  Bağlantı doğrulaması bekleniyor
                </span>
                <span className="rounded-full border border-[#59472a] px-3 py-1 text-xs text-[#d7b56d]">
                  Bilgi
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-[#59472a] bg-[#17140e] p-5">
        <div className="flex items-center gap-2 text-[#d7b56d]">
          <ShieldCheck size={19} />
          <h3 className="font-semibold">Güvenli yapılandırma</h3>
        </div>

        <p className="mt-3 text-sm leading-6 text-gray-400">
          Gizli anahtarlar, veritabanı parolaları ve API erişim bilgileri
          bu sayfada gösterilmeyecek. Mevcut servis yapılandırmaları
          korunacak; doğrulama yapılmadan hiçbir ayar değiştirilmez.
        </p>
      </div>
    </PanelShell>
  );
}
