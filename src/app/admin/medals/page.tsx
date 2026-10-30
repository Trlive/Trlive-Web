import type { Metadata } from "next";
import PanelShell from "@/components/panel-shell";
import {
  Medal,
  Search,
  ShieldCheck,
  Trophy,
  Award,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Madalya Sistemi | TR Live",
};

export default function AdminMedalsPage() {
  return (
    <PanelShell panel="admin">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-[#d7b56d]">
          <Medal size={18} />
          Madalya yönetimi
        </div>

        <h2 className="mt-2 text-2xl font-bold">Madalya Sistemi</h2>

        <p className="mt-2 text-sm text-gray-500">
          Mevcut TR Live madalya ve başarı kayıtlarını yönetin.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#30291e] bg-[#111111] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Toplam madalya</span>
            <Medal size={21} className="text-[#d7b56d]" />
          </div>
          <p className="mt-5 text-2xl font-bold">—</p>
          <p className="mt-2 text-xs text-gray-500">
            Mevcut API üzerinden yüklenecek.
          </p>
        </div>

        <div className="rounded-2xl border border-[#30291e] bg-[#111111] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Kazanılan madalya</span>
            <Trophy size={21} className="text-[#d7b56d]" />
          </div>
          <p className="mt-5 text-2xl font-bold">—</p>
          <p className="mt-2 text-xs text-gray-500">
            Mevcut API üzerinden yüklenecek.
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-[#30291e] bg-[#111111] p-5 md:p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h3 className="text-lg font-semibold">Madalya kayıtları</h3>
            <p className="mt-1 text-sm text-gray-500">
              Mevcut madalya tanımları ve kullanıcı kazanımları burada listelenecek.
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
            disabled
            aria-label="Madalya ara"
            placeholder="Madalya adı veya kullanıcı ID..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-600 disabled:cursor-not-allowed"
          />
        </div>

        <div className="mt-5 rounded-xl border border-dashed border-[#403522] px-5 py-12 text-center">
          <Award size={32} className="mx-auto mb-3 text-[#8c713d]" />
          <p className="font-medium text-gray-300">
            Madalya verisi henüz yüklenmedi.
          </p>
          <p className="mx-auto mt-2 max-w-lg text-xs leading-6 text-gray-500">
            Madalya tanımları ve kullanıcı kazanımları mevcut TR Live
            backend API'sinden alınacak. Backend doğrulanmadan madalya
            ekleme, silme veya kullanıcıya madalya verme işlemi yapılmayacak.
          </p>
        </div>
      </div>
    </PanelShell>
  );
}
