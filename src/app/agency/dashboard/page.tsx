import type { Metadata } from "next";
import Link from "next/link";
import PanelShell from "@/components/panel-shell";
import {
  Users,
  Coins,
  Gift,
  Medal,
  ArrowUpRight,
  Building2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Ajans Paneli | TR Live",
};

const sections = [
  {
    title: "Yayıncılarım",
    description: "Ajansınıza bağlı yayıncıları görüntüleyin ve yönetin.",
    href: "/agency/broadcasters",
    icon: Users,
  },
  {
    title: "Kazançlar",
    description: "Ajans kazanç ve ödeme bilgilerinizi inceleyin.",
    href: "/agency/earnings",
    icon: Coins,
  },
  {
    title: "WIP Mağazası",
    description: "Mevcut WIP ürünlerini görüntüleyin.",
    href: "/agency/wip",
    icon: Gift,
  },
  {
    title: "Madalya Sistemi",
    description: "Madalya bilgilerine ve ilgili bölümlere ulaşın.",
    href: "/agency/medals",
    icon: Medal,
  },
];

export default function AgencyDashboardPage() {
  return (
    <PanelShell panel="agency">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-[#d7b56d]">
          <Building2 size={17} />
          Ajans yönetimi
        </div>

        <h2 className="mt-2 text-2xl font-bold">
          Ajans Genel Bakış
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Yayıncılarınızı ve ajans işlemlerinizi buradan yönetin.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#30291e] bg-[#111111] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">
              Ajansa bağlı yayıncı
            </span>
            <Users className="text-[#d7b56d]" size={21} />
          </div>
          <p className="mt-5 text-2xl font-bold">—</p>
          <p className="mt-2 text-xs text-gray-500">
            Gerçek veri API bağlantısıyla gösterilecek.
          </p>
        </div>

        <div className="rounded-2xl border border-[#30291e] bg-[#111111] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">
              Ajans kazancı
            </span>
            <Coins className="text-[#d7b56d]" size={21} />
          </div>
          <p className="mt-5 text-2xl font-bold">—</p>
          <p className="mt-2 text-xs text-gray-500">
            Gerçek kazanç bilgisi API bağlantısıyla gösterilecek.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold">Ajans işlemleri</h3>
        <p className="mt-1 text-sm text-gray-500">
          İhtiyacınız olan bölüme geçin.
        </p>

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
                    className="text-gray-500 transition group-hover:text-[#d7b56d]"
                  />
                </div>

                <h4 className="mt-5 font-semibold text-white">
                  {section.title}
                </h4>

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
