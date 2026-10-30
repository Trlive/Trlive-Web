import type { Metadata } from "next";
import Link from "next/link";
import PanelShell from "@/components/panel-shell";
import {
  Coins,
  History,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Coin Bayi Paneli | TR Live",
};

const sections = [
  {
    title: "Coin İşlemleri",
    description: "Yetkiniz dahilindeki Coin işlemlerini yönetin.",
    href: "/dealer/transactions",
    icon: Coins,
  },
  {
    title: "İşlem Geçmişi",
    description: "Gerçekleşen işlemleri ve işlem kayıtlarını inceleyin.",
    href: "/dealer/history",
    icon: History,
  },
];

export default function DealerDashboardPage() {
  return (
    <PanelShell panel="dealer">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-[#d7b56d]">
          <ShieldCheck size={17} />
          Coin bayi yönetimi
        </div>

        <h2 className="mt-2 text-2xl font-bold">
          Bayi Genel Bakış
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Coin işlemlerinizi ve bayi hareketlerinizi buradan takip edin.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#30291e] bg-[#111111] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">İşlem sayısı</span>
            <History size={21} className="text-[#d7b56d]" />
          </div>
          <p className="mt-5 text-2xl font-bold">—</p>
          <p className="mt-2 text-xs text-gray-500">
            Gerçek işlem sayısı API bağlantısıyla gösterilecek.
          </p>
        </div>

        <div className="rounded-2xl border border-[#30291e] bg-[#111111] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Coin hareketleri</span>
            <Coins size={21} className="text-[#d7b56d]" />
          </div>
          <p className="mt-5 text-2xl font-bold">—</p>
          <p className="mt-2 text-xs text-gray-500">
            Gerçek Coin bilgisi API bağlantısıyla gösterilecek.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold">Bayi işlemleri</h3>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <Link
                key={section.href}
                href={section.href}
                className="group rounded-2xl border border-[#30291e] bg-[#111111] p-5 transition hover:border-[#8c713d]"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-[#292114] p-3 text-[#d7b56d]">
                    <Icon size={21} />
                  </div>
                  <ArrowUpRight
                    size={18}
                    className="text-gray-500 group-hover:text-[#d7b56d]"
                  />
                </div>

                <h4 className="mt-5 font-semibold">{section.title}</h4>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {section.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </PanelShell>
  );
}
