"use client";

import { useCallback, useState, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getSession } from "@/lib/api";
import { Badge, Notice } from "@/components/ui";
import { Avatar } from "./user-picker";

export type Brief = {
  id: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string | null;
  publicId?: string | null;
};

export const isFullAdmin = () => getSession("admin")?.user.systemRole === "admin";

/** Sunucudaki mayActOnUser ile aynı kural: yönetici hesabına (kendisi hariç) ve yardımcı admin diğer yetkililere işlem yapamaz. */
export function mayAct(targetRole: string, targetId: string): boolean {
  const s = getSession("admin");
  const actor = s?.user.systemRole;
  if (s?.user.id === targetId && actor === "admin") return true;
  if (targetRole === "admin") return false;
  if (actor === "admin") return true;
  if (actor === "support") return targetRole === "user";
  return false;
}

export const userHref = (id: string) => `/admin/user/?id=${encodeURIComponent(id)}`;
export const roomHref = (id: string) => `/admin/room/?id=${encodeURIComponent(id)}`;

/** Adres çubuğundaki ?id= değeri (detay sayfaları). Sayfa <Suspense> içinde kullanılmalı. */
export function useQueryValue(name: string): string {
  const sp = useSearchParams();
  return sp?.get(name) ?? "";
}

export function newKey() {
  return `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** İşlem çalıştırıcı: meşgul durumu ve sonuç mesajı. fn false dönerse (vazgeçildi) mesaj gösterilmez. */
export function useAction() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const run = useCallback(
    async (label: string, fn: () => Promise<void | false>) => {
      if (busy) return;
      setBusy(true);
      setMsg(null);
      try {
        const r = await fn();
        if (r !== false) setMsg({ tone: "ok", text: label });
      } catch (e) {
        setMsg({ tone: "error", text: e instanceof Error ? e.message : "İşlem başarısız." });
      } finally {
        setBusy(false);
      }
    },
    [busy]
  );
  return { busy, msg, setMsg, run };
}

export function ActionMsg({ msg }: { msg: { tone: "ok" | "error"; text: string } | null }) {
  return msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null;
}

export function fmtRel(v: unknown): string {
  if (!v) return "—";
  const d = new Date(String(v)).getTime();
  if (Number.isNaN(d)) return "—";
  const s = Math.round((Date.now() - d) / 1000);
  if (s < 0) {
    const f = -s;
    if (f < 3600) return `${Math.max(1, Math.round(f / 60))} dk sonra`;
    if (f < 86400) return `${Math.round(f / 3600)} sa sonra`;
    return `${Math.round(f / 86400)} gün sonra`;
  }
  if (s < 60) return "az önce";
  if (s < 3600) return `${Math.round(s / 60)} dk önce`;
  if (s < 86400) return `${Math.round(s / 3600)} sa önce`;
  if (s < 86400 * 30) return `${Math.round(s / 86400)} gün önce`;
  return new Date(d).toLocaleDateString("tr-TR");
}

export const roleText: Record<string, string> = { admin: "Yönetici", support: "Yardımcı admin", user: "Kullanıcı" };
export const genderText: Record<string, string> = { male: "Erkek", female: "Kadın" };
export const kycText: Record<string, string> = { none: "Yok", pending: "Bekliyor", approved: "Onaylı", rejected: "Reddedildi" };
export const hostStatusText: Record<string, string> = { pending: "Başvuru bekliyor", approved: "Onaylı", rejected: "Reddedildi", suspended: "Askıda" };
export const agencyStatusText: Record<string, string> = { pending: "Bekliyor", active: "Aktif", suspended: "Askıda", rejected: "Reddedildi" };
export const reportKindText: Record<string, string> = { user: "Kullanıcı", room: "Oda", room_message: "Oda mesajı", dm: "Özel mesaj" };
export const reportReasonText: Record<string, string> = {
  spam: "Spam / reklam",
  harassment: "Taciz / hakaret",
  hate: "Nefret söylemi",
  nudity: "Çıplaklık / cinsel içerik",
  violence: "Şiddet",
  scam: "Dolandırıcılık",
  underage: "18 yaş altı",
  other: "Diğer",
};

export function StatusBadge({ status, bannedUntil }: { status?: string; bannedUntil?: string | null }) {
  if (status === "banned") return <Badge tone="red">{bannedUntil ? `Banlı · ${new Date(bannedUntil).toLocaleDateString("tr-TR")}` : "Banlı · süresiz"}</Badge>;
  if (status === "deleted") return <Badge tone="gray">Silinmiş</Badge>;
  return <Badge tone="green">Aktif</Badge>;
}

/** Avatar + ad; tıklayınca kullanıcı detayına gider. */
export function UserLink({ user, sub, size = 32 }: { user: Brief | null | undefined; sub?: ReactNode; size?: number }) {
  if (!user) return <span className="text-gray-500">—</span>;
  const name = user.displayName || user.username || "Kullanıcı";
  return (
    <Link href={userHref(user.id)} className="group inline-flex min-w-0 max-w-full items-center gap-2.5">
      <Avatar url={user.avatarUrl} name={name} size={size} />
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-white group-hover:text-[#e5c77e]">{name}</span>
        <span className="block truncate text-xs text-gray-500">
          {sub ?? (
            <>
              {user.username ? `@${user.username}` : ""}
              {user.publicId ? ` · ID ${user.publicId}` : ""}
            </>
          )}
        </span>
      </span>
    </Link>
  );
}

export function Tabs<K extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { key: K; label: string; count?: number | null }[];
  value: K;
  onChange: (k: K) => void;
}) {
  return (
    <div className="mb-6 flex gap-2 overflow-x-auto pb-1" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          role="tab"
          aria-selected={value === t.key}
          onClick={() => onChange(t.key)}
          className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2 text-sm transition ${
            value === t.key ? "border-[#8c713d] bg-[#292114] text-[#e5c77e]" : "border-[#2a241a] text-gray-400 hover:border-[#4b3c22] hover:text-white"
          }`}
        >
          {t.label}
          {t.count ? <span className="rounded-full bg-red-600 px-1.5 text-[11px] font-bold text-white">{t.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function Pager({ page, pages, hasMore, total, onPage }: { page: number; pages?: number; hasMore?: boolean; total?: number; onPage: (p: number) => void }) {
  const canNext = pages !== undefined ? page < pages : Boolean(hasMore);
  if (page <= 1 && !canNext) return total !== undefined ? <p className="mt-4 text-xs text-gray-500">Toplam {total} kayıt</p> : null;
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
      <span className="text-xs text-gray-500">
        Sayfa {page}
        {pages !== undefined ? ` / ${pages}` : ""}
        {total !== undefined ? ` · Toplam ${total} kayıt` : ""}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-[#30291e] px-3 py-1.5 text-gray-300 hover:bg-[#1a1610] disabled:opacity-40"
        >
          <ChevronLeft size={15} /> Önceki
        </button>
        <button
          type="button"
          disabled={!canNext}
          onClick={() => onPage(page + 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-[#30291e] px-3 py-1.5 text-gray-300 hover:bg-[#1a1610] disabled:opacity-40"
        >
          Sonraki <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

/** Etiket / değer ızgarası. */
export function KV({ items, cols = 2 }: { items: [string, ReactNode][]; cols?: 2 | 3 | 4 }) {
  const c = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 xl:grid-cols-3", 4: "sm:grid-cols-2 xl:grid-cols-4" }[cols];
  return (
    <dl className={`grid gap-3 ${c}`}>
      {items.map(([k, v]) => (
        <div key={k} className="min-w-0 rounded-xl border border-[#262117] bg-[#141210] px-4 py-3">
          <dt className="text-xs text-gray-500">{k}</dt>
          <dd className="mt-1 break-words text-sm font-medium text-white">{v ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-gray-400">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    </label>
  );
}

export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#4b3c22] bg-[#17140e] px-4 py-2 text-sm text-[#d7b56d] hover:bg-[#211a0f] disabled:opacity-50";
export const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50";
export const btnDangerOutline =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/60 px-4 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-50";
export const btnOk =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50";
export const btnSmall =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#30291e] px-2.5 py-1 text-xs text-gray-300 hover:border-[#4b3c22] hover:text-white disabled:opacity-50";
export const selectCls =
  "rounded-xl border border-[#30291e] bg-[#171717] px-3 py-2.5 text-sm text-white outline-none focus:border-[#8c713d]";

/** "SİL" yazdırarak kalıcı işlem onayı. Vazgeçilirse false, hatalı yazılırsa hata fırlatır. */
export function confirmTyped(message: string, word = "SİL"): boolean {
  const typed = window.prompt(`${message}\n\nOnay için ${word} yazın.`);
  if (typed === null) return false;
  if (typed.trim().toLocaleUpperCase("tr-TR") !== word) throw new Error("Onay metni hatalı; işlem yapılmadı.");
  return true;
}

/** Uzun kimliğin kısa gösterimi (ilk 8 karakter). */
export function shortId(id: string) {
  return id.slice(0, 8);
}
