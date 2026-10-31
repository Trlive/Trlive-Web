import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  ArrowRight,
  LockKeyhole,
  Crown,
} from "lucide-react";

const panels = [
  {
    title: "Yönetim Paneli",
    description:
      "Kullanıcılar, ajanslar, coin, WIP ve platform yönetimi.",
    detail: "YETKİLİ YÖNETİM",
    href: "/admin/login",
    icon: ShieldCheck,
  },
  {
    title: "Ajans Paneli",
    description:
      "Yayıncı ekibi, performans, görevler ve ajans işlemleri.",
    detail: "AJANS YÖNETİMİ",
    href: "/agency/login",
    icon: Building2,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen px-5 py-12 sm:px-8">
      <div className="mx-auto flex min-h-[85vh] max-w-6xl flex-col justify-center">
        <header className="mb-14 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10">
            <Crown size={34} className="text-amber-300" />
          </div>

          <p className="mb-3 text-xs font-bold tracking-[0.4em] text-amber-300">
            PREMIUM MANAGEMENT
          </p>

          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">
            TR <span className="gold-text">LIVE</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-neutral-400 sm:text-base">
            TR Live yönetim platformuna hoş geldiniz.
            Devam etmek için yetkili olduğunuz paneli seçin.
          </p>
        </header>

        <section className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
          {panels.map((panel) => {
            const Icon = panel.icon;

            return (
              <Link
                key={panel.href}
                href={panel.href}
                className="group rounded-2xl border border-amber-400/15 bg-[#111111] p-7 transition duration-300 hover:-translate-y-1 hover:border-amber-300/50 hover:bg-[#171511]"
              >
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10 text-amber-300">
                    <Icon size={27} />
                  </div>

                  <span className="text-[10px] font-bold tracking-widest text-neutral-500">
                    {panel.detail}
                  </span>
                </div>

                <h2 className="mb-3 text-xl font-bold text-white">
                  {panel.title}
                </h2>

                <p className="min-h-[52px] text-sm leading-6 text-neutral-400">
                  {panel.description}
                </p>

                <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5">
                  <span className="text-sm font-semibold text-amber-300">
                    Panele Giriş
                  </span>
                  <ArrowRight
                    size={19}
                    className="text-amber-300 transition-transform group-hover:translate-x-1"
                  />
                </div>
              </Link>
            );
          })}
        </section>

        <footer className="mt-12 flex items-center justify-center gap-2 text-xs text-neutral-600">
          <LockKeyhole size={13} />
          <span>Güvenli erişim · Uygulamadaki TR Live hesabınızla giriş yapın</span>
        </footer>
      </div>
    </main>
  );
}
