"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Crown, Eye, EyeOff, LockKeyhole } from "lucide-react";

type PanelType = "admin" | "agency" | "dealer";

type PanelLoginProps = {
  panel: PanelType;
  title: string;
  description: string;
};

const panelNames: Record<PanelType, string> = {
  admin: "Yönetim Paneli",
  agency: "Ajans Paneli",
  dealer: "Coin Bayi Paneli",
};

export default function PanelLogin({
  panel,
  title,
  description,
}: PanelLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    const loginPath = process.env[
      `NEXT_PUBLIC_${panel.toUpperCase()}_LOGIN_PATH`
    ];

    if (!apiBase || !loginPath) {
      setError(
        "Giriş servisi henüz yapılandırılmadı. API bağlantı ayarları tamamlanmalıdır."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${apiBase.replace(/\/$/, "")}/${loginPath.replace(/^\//, "")}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message || "Giriş başarısız. Bilgilerinizi kontrol edin."
        );
      }

      if (result?.redirectUrl) {
        window.location.assign(result.redirectUrl);
        return;
      }

      if (result?.token) {
        setError(
          "Sunucu giriş yanıtı verdi ancak güvenli oturum aktarımı henüz tamamlanmadı."
        );
        return;
      }

      setError(
        "Sunucu yanıtı alındı ancak beklenen oturum bilgisi bulunamadı."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Bağlantı kurulamadı. Daha sonra tekrar deneyin."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-neutral-400 transition hover:text-amber-300"
        >
          <ArrowLeft size={17} />
          Panel seçimine dön
        </Link>

        <section className="rounded-2xl border border-amber-400/20 bg-[#111111] p-7 shadow-2xl sm:p-9">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10">
              <Crown size={29} className="text-amber-300" />
            </div>

            <p className="mb-2 text-[10px] font-bold tracking-[0.3em] text-amber-300">
              TR LIVE · SECURE ACCESS
            </p>

            <h1 className="text-2xl font-extrabold text-white">
              {title}
            </h1>

            <p className="mt-2 text-sm text-neutral-400">
              {description}
            </p>
          </div>

          <div className="mb-6 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-center">
            <span className="text-sm font-semibold text-amber-200">
              {panelNames[panel]}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-neutral-300"
              >
                Kullanıcı adı veya e-posta
              </label>

              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Kullanıcı bilgilerinizi girin"
                className="form-input"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-neutral-300"
              >
                Şifre
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Şifrenizi girin"
                  className="form-input pr-12"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-amber-300"
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm leading-6 text-red-300"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="gold-button w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LockKeyhole size={17} />
              {loading ? "Kontrol ediliyor..." : "Güvenli Giriş"}
            </button>
          </form>

          <p className="mt-7 text-center text-xs leading-6 text-neutral-600">
            Bu alan yalnızca yetkili kullanıcıların erişimi içindir.
          </p>
        </section>

        <p className="mt-6 text-center text-xs text-neutral-600">
          TR LIVE MANAGEMENT SYSTEM
        </p>
      </div>
    </main>
  );
}
