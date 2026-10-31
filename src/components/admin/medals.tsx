"use client";

import { useState } from "react";
import { Medal } from "lucide-react";
import { api, absoluteUrl } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { Card, Empty, ErrorBox, Loading, Notice, PageHeader, inputCls } from "@/components/ui";
import { Avatar, UserPicker, type AdminUser } from "./user-picker";

type Item = { key: string; name: string; imageUrl: string | null; wip?: boolean };

export default function AdminMedals() {
  const { data, error, loading, reload } = useApi<{ items: Item[] }>("/api/admin/grantables?category=badge");
  const [item, setItem] = useState<Item | null>(null);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [days, setDays] = useState("30");
  const [filter, setFilter] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  async function grant() {
    if (!item || !user || busy) return;
    setBusy(true);
    setMsg(null);
    try {
      await api(`/api/admin/users/${user.id}/grant`, {
        method: "POST",
        body: { category: "badge", itemKey: item.key, days: days === "0" ? null : Number(days) },
      });
      setMsg({ tone: "ok", text: `"${item.name}" ${user.displayName || user.username} kullanıcısına verildi.` });
    } catch (e) {
      setMsg({ tone: "error", text: e instanceof Error ? e.message : "İşlem başarısız." });
    } finally {
      setBusy(false);
    }
  }

  const items = (data?.items ?? []).filter((i) => !filter || i.name.toLowerCase().includes(filter.toLowerCase()));
  return (
    <div>
      <PageHeader icon={<Medal size={18} />} kicker="Madalya yönetimi" title="Madalya Sistemi" description="Madalya (rozet) seçin ve bir kullanıcıya süreli ya da süresiz verin. Madalyalar profilde görünür." />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Card title="Madalyalar" subtitle={data ? `${data.items.length} madalya` : undefined}>
          <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Madalya adı ara..." className={`${inputCls} mb-4`} aria-label="Madalya ara" />
          {loading && !data && <Loading />}
          {error && <ErrorBox message={error} onRetry={reload} />}
          {data && items.length === 0 && <Empty title="Madalya bulunamadı." note="Madalyalar uygulamadaki yönetim panelinden (Mağaza → Rozet) eklenir." />}
          <div className="grid max-h-[520px] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
            {items.map((i) => {
              const src = absoluteUrl(i.imageUrl);
              const selected = item?.key === i.key;
              return (
                <button
                  key={i.key}
                  type="button"
                  onClick={() => setItem(i)}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-center text-xs transition ${
                    selected ? "border-[#d7b56d] bg-[#292114] text-[#f2d28b]" : "border-[#262117] bg-[#141210] text-gray-300 hover:border-[#4b3c22]"
                  }`}
                >
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt="" className="h-12 w-12 object-contain" />
                  ) : (
                    <Medal size={34} className="text-[#d7b56d]" />
                  )}
                  <span className="line-clamp-2">{i.name}</span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card title="Madalya ver">
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              Seçili madalya: <span className="font-semibold text-white">{item?.name ?? "—"}</span>
            </p>
            <UserPicker onPick={(u) => { setUser(u); setMsg(null); }} />
            {user && (
              <div className="flex items-center gap-3 rounded-xl border border-[#30291e] p-3">
                <Avatar url={user.avatarUrl} name={user.displayName || user.username} />
                <div>
                  <p className="font-semibold text-white">{user.displayName || user.username}</p>
                  <p className="text-xs text-gray-500">ID {user.publicId ?? "—"}</p>
                </div>
              </div>
            )}
            <select value={days} onChange={(e) => setDays(e.target.value)} className={inputCls} aria-label="Süre">
              {["7", "15", "30", "60", "90", "365"].map((d) => (
                <option key={d} value={d}>
                  {d} gün
                </option>
              ))}
              <option value="0">Süresiz</option>
            </select>
            {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
            <button type="button" disabled={!item || !user || busy} onClick={grant} className="gold-button w-full disabled:cursor-not-allowed disabled:opacity-50">
              <Medal size={16} />
              Madalyayı ver
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
