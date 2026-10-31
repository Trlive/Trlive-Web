"use client";

import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { api, absoluteUrl, fmtNumber } from "@/lib/api";
import { inputCls } from "@/components/ui";

export type AdminUser = {
  id: string;
  publicId?: string | null;
  username: string;
  displayName?: string;
  avatarUrl?: string | null;
  coins?: string;
  diamonds?: string;
  systemRole?: string;
  accountStatus?: string;
  bannedUntil?: string | null;
  banReason?: string | null;
};

export function Avatar({ url, name, size = 36 }: { url?: string | null; name?: string; size?: number }) {
  const src = absoluteUrl(url);
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
  ) : (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-[#292114] text-xs font-bold text-[#d7b56d]"
      style={{ width: size, height: size }}
    >
      {(name ?? "?").slice(0, 1).toUpperCase()}
    </div>
  );
}

/** Kullanıcı arama (kullanıcı adı, görünen ad, ID). Sonuçtan biri seçilince onPick çağrılır. */
export function UserPicker({ onPick, placeholder = "Kullanıcı adı, görünen ad veya ID" }: { onPick: (u: AdminUser) => void; placeholder?: string }) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<AdminUser[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  async function search(e: FormEvent) {
    e.preventDefault();
    if (q.trim().length < 2) {
      setError("Aramak için en az 2 karakter girin.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const r = await api<{ users: AdminUser[] }>(`/api/admin/users?q=${encodeURIComponent(q.trim())}`);
      setItems(r.users ?? []);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Arama yapılamadı.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <form onSubmit={search} className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} aria-label="Kullanıcı ara" className={`${inputCls} pl-10`} />
        </div>
        <button type="submit" disabled={busy} className="gold-button shrink-0 px-5 disabled:opacity-60">
          {busy ? "Aranıyor..." : "Ara"}
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
      {searched && !error && (
        <div className="mt-3 max-h-80 space-y-1 overflow-y-auto">
          {items.length === 0 && <p className="py-4 text-center text-sm text-gray-500">Kullanıcı bulunamadı.</p>}
          {items.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => onPick(u)}
              className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-left hover:border-[#4b3c22] hover:bg-[#17140e]"
            >
              <Avatar url={u.avatarUrl} name={u.displayName || u.username} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{u.displayName || u.username}</p>
                <p className="truncate text-xs text-gray-500">
                  @{u.username} · ID {u.publicId ?? "—"}
                  {u.coins !== undefined ? ` · ${fmtNumber(u.coins)} Coin` : ""}
                </p>
              </div>
              {u.accountStatus && u.accountStatus !== "active" && <span className="text-xs text-red-300">{u.accountStatus === "banned" ? "Banlı" : "Silinmiş"}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
