import type { Metadata } from "next";
import PanelShell from "@/components/panel-shell";
import {
  Search,
  Users,
  ShieldCheck,
  UserCheck,
  UserX,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Kullanıcı Yönetimi | TR Live",
};

export default function AdminUsersPage() {
  return (
    <PanelShell panel="admin">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-[#d7b56d]">
          <Users size={18} />
          Kullanıcı yönetimi
        </div>

        <h2 className="mt-2 text-2xl font-bold">Kullanıcılar</h2>

        <p className="mt-2 text-sm text-gray-500">
          TR Live kullanıcı hesaplarını ve hesap durumlarını yönetin.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Toplam kullanıcı",
            icon: Users,
          },
          {
            label: "Aktif kullanıcı",
            icon: UserCheck,
          },
          {
            label: "Kısıtlı hesap",
            icon: UserX,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-2xl border border-[#30291e] bg-[#111111] p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{item.label}</span>
                <Icon size={21} className="text-[#d7b56d]" />
              </div>
              <p className="mt-5 text-2xl font-bold">—</p>
              <p className="mt-2 text-xs text-gray-500">
                API bağlantısı bekleniyor
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-[#30291e] bg-[#111111] p-5 md:p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h3 className="text-lg font-semibold">Kullanıcı listesi</h3>
            <p className="mt-1 text-sm text-gray-500">
              Kullanıcı kayıtları mevcut backend üzerinden yüklenecek.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-[#4b3c22] bg-[#17140e] px-3 py-2 text-xs text-[#d7b56d]">
            <ShieldCheck size={16} />
            Yönetici yetkisi
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-xl border border-[#30291e] bg-[#171717] px-4 py-3">
          <Search size={18} className="text-gray-500" />
          <input
            type="search"
            placeholder="Kullanıcı adı veya kullanıcı ID..."
            aria-label="Kullanıcı ara"
            disabled
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-600 disabled:cursor-not-allowed"
          />
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#30291e] text-gray-500">
                <th className="px-4 py-4 font-medium">Kullanıcı</th>
                <th className="px-4 py-4 font-medium">Kullanıcı ID</th>
                <th className="px-4 py-4 font-medium">Rol</th>
                <th className="px-4 py-4 font-medium">Hesap durumu</th>
                <th className="px-4 py-4 font-medium">İşlem</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <Users
                    size={30}
                    className="mx-auto mb-3 text-gray-600"
                  />
                  <p className="font-medium text-gray-300">
                    Kullanıcı verisi henüz yüklenmedi.
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    Gerçek kullanıcı listesi API entegrasyonundan sonra
                    görüntülenecek.
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </PanelShell>
  );
}
