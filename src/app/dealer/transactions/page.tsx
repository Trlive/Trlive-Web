
import {
  ArrowDownLeft,
  ArrowUpRight,
  History,
  Search,
  Info,
  ReceiptText,
} from "lucide-react";
import PanelShell from "@/components/panel-shell";

export default function DealerTransactionsPage() {
  return (
    <PanelShell panel="dealer">
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-amber-400">
            <ReceiptText size={17} />
            Coin Bayisi
          </div>
          <h1 className="mt-2 text-2xl font-bold text-white">
            Coin İşlemleri
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Bayi hesabınızla gerçekleştirilen Coin hareketlerini takip edin.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <section className="panel-card rounded-xl p-5">
            <div className="flex items-center gap-3">
              <ArrowDownLeft className="text-emerald-400" size={22} />
              <div>
                <p className="text-sm text-zinc-400">Gelen işlemler</p>
                <p className="mt-1 text-lg font-semibold text-white">—</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-zinc-500">
              Backend verisi bekleniyor
            </p>
          </section>

          <section className="panel-card rounded-xl p-5">
            <div className="flex items-center gap-3">
              <ArrowUpRight className="text-amber-400" size={22} />
              <div>
                <p className="text-sm text-zinc-400">Giden işlemler</p>
                <p className="mt-1 text-lg font-semibold text-white">—</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-zinc-500">
              Backend verisi bekleniyor
            </p>
          </section>
        </div>

        <section className="panel-card rounded-xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <History className="text-amber-400" size={20} />
              <h2 className="font-semibold text-white">
                İşlem geçmişi
              </h2>
            </div>
            <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
              Tüm işlemler
            </span>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-zinc-500">
                  <th className="px-3 py-3 font-medium">İşlem ID</th>
                  <th className="px-3 py-3 font-medium">Kullanıcı ID</th>
                  <th className="px-3 py-3 font-medium">İşlem türü</th>
                  <th className="px-3 py-3 font-medium">Coin</th>
                  <th className="px-3 py-3 font-medium">Tarih</th>
                  <th className="px-3 py-3 font-medium">Durum</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={6} className="px-3 py-12 text-center">
                    <Search className="mx-auto text-zinc-600" size={26} />
                    <p className="mt-3 text-sm text-zinc-400">
                      Henüz işlem kaydı yüklenmedi.
                    </p>
                    <p className="mt-1 text-xs text-zinc-600">
                      Gerçek işlem kayıtları mevcut sistemden alınacaktır.
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <Info className="mt-0.5 shrink-0 text-amber-400" size={18} />
          <p className="text-xs leading-6 text-zinc-400">
            Bu ekran henüz görüntüleme taslağıdır. Coin bakiyesi,
            işlem kayıtları ve işlem yetkileri mevcut backend üzerinden
            doğrulanmadan hiçbir bakiye hareketi yapılmaz.
          </p>
        </div>
      </div>
    </PanelShell>
  );
}
