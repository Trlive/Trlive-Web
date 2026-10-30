
import {
  History,
  Search,
  ReceiptText,
  CalendarDays,
  Info,
} from "lucide-react";
import PanelShell from "@/components/panel-shell";

export default function DealerHistoryPage() {
  return (
    <PanelShell panel="dealer">
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-amber-400">
            <History size={17} />
            Coin Bayisi
          </div>
          <h1 className="mt-2 text-2xl font-bold text-white">
            İşlem Geçmişi
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Geçmiş Coin işlemlerini ve işlem ayrıntılarını inceleyin.
          </p>
        </div>

        <section className="panel-card rounded-xl p-5">
          <h2 className="font-semibold text-white">İşlem filtreleri</h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                İşlem ID
              </label>
              <div className="form-input flex items-center gap-2">
                <Search size={16} className="text-zinc-500" />
                <span className="text-sm text-zinc-500">
                  İşlem ID ile arama
                </span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Tarih aralığı
              </label>
              <div className="form-input flex items-center gap-2">
                <CalendarDays size={16} className="text-zinc-500" />
                <span className="text-sm text-zinc-500">
                  Tarih filtresi backend bağlantısıyla eklenecek
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="panel-card rounded-xl p-5">
          <div className="flex items-center gap-2">
            <ReceiptText size={20} className="text-amber-400" />
            <h2 className="font-semibold text-white">
              Geçmiş işlemler
            </h2>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-zinc-500">
                  <th className="px-3 py-3 font-medium">İşlem ID</th>
                  <th className="px-3 py-3 font-medium">Tarih</th>
                  <th className="px-3 py-3 font-medium">Kullanıcı ID</th>
                  <th className="px-3 py-3 font-medium">İşlem türü</th>
                  <th className="px-3 py-3 font-medium">Coin miktarı</th>
                  <th className="px-3 py-3 font-medium">Durum</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={6} className="px-3 py-12 text-center">
                    <History className="mx-auto text-zinc-600" size={28} />
                    <p className="mt-3 text-sm text-zinc-400">
                      Henüz geçmiş işlem verisi bulunmuyor.
                    </p>
                    <p className="mt-1 text-xs text-zinc-600">
                      İşlem kayıtları mevcut backend üzerinden yüklenecek.
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
            Geçmiş kayıtlar silinmeden korunmalıdır. İşlem detayları,
            tarih ve bakiye hareketleri sunucu kayıtlarıyla
            eşleştirilerek gösterilecektir.
          </p>
        </div>
      </div>
    </PanelShell>
  );
}
