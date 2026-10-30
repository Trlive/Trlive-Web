
"use client";

import { useState } from "react";
import {
  Gift,
  Search,
  Send,
  ShieldCheck,
  PackageOpen,
  Info,
} from "lucide-react";
import PanelShell from "@/components/panel-shell";

export default function AgencyWipPage() {
  const [wipId, setWipId] = useState("");
  const [userId, setUserId] = useState("");
  const [quantity, setQuantity] = useState("1");

  return (
    <PanelShell panel="agency">
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-amber-400">
            <Gift size={17} />
            Ajans ödül yönetimi
          </div>
          <h1 className="mt-2 text-2xl font-bold text-white">
            WIP Ödülleri
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Etkinliklerden ve ajans ödüllerinden ajansınıza tanımlanan
            WIP hediyelerini görüntüleyin ve kullanıcılara gönderin.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="panel-card rounded-xl p-5">
            <div className="flex items-center gap-3">
              <PackageOpen className="text-amber-400" size={22} />
              <div>
                <h2 className="font-semibold text-white">
                  Ajans WIP stoğu
                </h2>
                <p className="text-xs text-zinc-400">
                  Tanımlanmış ödüller
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-lg border border-dashed border-zinc-700 p-6 text-center">
              <Gift className="mx-auto text-zinc-500" size={30} />
              <p className="mt-3 text-sm font-medium text-zinc-300">
                Henüz WIP listesi yüklenmedi
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Mevcut ajans ödül API bağlantısı yapıldığında
                tanımlı hediyeler burada görünecek.
              </p>
            </div>
          </section>

          <section className="panel-card rounded-xl p-5">
            <div className="flex items-center gap-3">
              <Send className="text-amber-400" size={22} />
              <div>
                <h2 className="font-semibold text-white">
                  Kullanıcıya WIP gönder
                </h2>
                <p className="text-xs text-zinc-400">
                  Kullanıcı ID ve WIP ID ile gönderim
                </p>
              </div>
            </div>

            <form
              className="mt-5 space-y-4"
              onSubmit={(event) => event.preventDefault()}
            >
              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  WIP ID
                </label>
                <input
                  className="form-input w-full"
                  value={wipId}
                  onChange={(event) => setWipId(event.target.value)}
                  placeholder="Gönderilecek WIP ID"
                  inputMode="numeric"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Kullanıcı ID
                </label>
                <input
                  className="form-input w-full"
                  value={userId}
                  onChange={(event) => setUserId(event.target.value)}
                  placeholder="Hediyenin gönderileceği kullanıcı ID"
                  inputMode="numeric"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Gönderilecek adet
                </label>
                <input
                  className="form-input w-full"
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                />
              </div>

              <button
                type="button"
                disabled
                className="gold-button flex w-full cursor-not-allowed items-center justify-center gap-2 opacity-50"
              >
                <Send size={16} />
                WIP Gönder
              </button>

              <p className="text-xs text-zinc-500">
                Gönderim, mevcut backend WIP gönderme servisi
                doğrulanıp bağlandıktan sonra etkinleştirilecektir.
              </p>
            </form>
          </section>
        </div>

        <section className="panel-card rounded-xl p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-amber-400" size={20} />
            <h2 className="font-semibold text-white">
              Gönderim geçmişi
            </h2>
          </div>
          <div className="mt-4 rounded-lg border border-dashed border-zinc-700 p-5 text-center">
            <Search className="mx-auto text-zinc-500" size={25} />
            <p className="mt-2 text-sm text-zinc-400">
              Henüz gönderim geçmişi yüklenmedi.
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Gerçek gönderim kayıtları backend bağlantısından
              alınacaktır.
            </p>
          </div>
        </section>

        <div className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <Info className="mt-0.5 shrink-0 text-amber-400" size={18} />
          <p className="text-xs leading-6 text-zinc-400">
            Ajans yalnızca kendisine tanımlanan ödülleri
            gönderebilmelidir. WIP stoğu, gönderim yetkisi ve
            işlem geçmişi sunucu tarafında kontrol edilmelidir.
          </p>
        </div>
      </div>
    </PanelShell>
  );
}
