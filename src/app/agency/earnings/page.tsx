import type { Metadata } from "next";
import PanelShell from "@/components/panel-shell";
import {
  Coins,
  Wallet,
  TrendingUp,
  History,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Ajans Kazançları | TR Live",
};

export default function AgencyEarningsPage() {
  return (
    <PanelShell panel="agency">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-[#d7b56d]">
          <Wallet size={18} />
          Ajans finans yönetimi
        </div>

        <h2 className="mt-2 text-2xl font-bold">Kazançlar</h2>

        <p className="mt-2 text-sm text-gray-500">
          Ajansınıza ait yayıncı kazançlarını ve ödeme kayıtlarını takip edin.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { label: "Toplam kazanç", icon: Coins },
          { label: "Bu ayki kazanç", icon: TrendingUp },
          { label: "Bekleyen ödeme", icon: Wallet },
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
                Gerçek bilgi API bağlantısıyla gösterilecek.
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-[#30291e] bg-[#111111] p-5 md:p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h3 className="text-lg font-semibold">Kazanç ve ödeme geçmişi</h3>
            <p className="mt-1 text-sm text-gray-500">
              Ajansınıza ait finansal kayıtlar burada listelenecek.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-[#4b3c22] bg-[#17140e] px-3 py-2 text-xs text-[#d7b56d]">
            <ShieldCheck size={16} />
            Ajans yetkisi
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#30291e] text-gray-500">
                <th className="px-4 py-4 font-medium">İşlem numarası</th>
                <th className="px-4 py-4 font-medium">İşlem türü</th>
                <th className="px-4 py-4 font-medium">Tutar</th>
                <th className="px-4 py-4 font-medium">Tarih</th>
                <th className="px-4 py-4 font-medium">Durum</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <History
                    size={30}
                    className="mx-auto mb-3 text-gray-600"
                  />

                  <p className="font-medium text-gray-300">
                    Henüz kazanç kaydı yüklenmedi.
                  </p>

                  <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-gray-500">
                    Kazanç ve ödeme geçmişi mevcut TR Live backend API'sinden
                    alınacak. Bu ekran ajansın kendi kayıtlarıyla sınırlı
                    olacak.
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
