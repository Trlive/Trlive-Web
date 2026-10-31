"use client";

import { useState } from "react";
import { Crown, Gift } from "lucide-react";
import { api, fmtNumber } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { Badge, Card, ErrorBox, Loading, Notice, PageHeader, inputCls } from "@/components/ui";
import { Avatar, UserPicker, type AdminUser } from "./user-picker";

type Tier = {
  level: number;
  name: string;
  features: Record<string, unknown>;
  plans: { id: string; name: string; durationDays: number; priceCoins: string }[];
};

const featureText: [string, string][] = [
  ["viewVisitors", "Ziyaretçileri görme"],
  ["vipGifts", "Vip hediyeler"],
  ["muteImmunity", "Susturulamaz"],
  ["profileEffect", "Profil ışık efekti"],
  ["kickImmunity", "Odadan atılamaz"],
  ["customRoomTheme", "Özel oda teması"],
  ["hideCountry", "Ülke/Bölgeyi gizle"],
  ["hideOnline", "Çevrimiçi saati gizle"],
  ["invisibleVisit", "Görüntüleme geçmişini gizle"],
  ["animatedAvatar", "Hareketli profil fotoğrafı"],
  ["hiddenUser", "Gizli kullanıcı"],
  ["ghostMode", "Hayalet mod"],
];

const label = (level: number) => (level >= 11 ? "SWIP" : `WIP ${level}`);

export default function AdminWip() {
  const { data, error, loading, reload } = useApi<{ tiers: Tier[] }>("/api/wip/tiers");
  const [user, setUser] = useState<AdminUser | null>(null);
  const [level, setLevel] = useState("1");
  const [days, setDays] = useState("30");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  async function act(kind: "grant" | "revoke") {
    if (!user || busy) return;
    if (kind === "revoke" && !window.confirm(`${user.displayName || user.username} kullanıcısının WIP üyeliği kaldırılsın mı?`)) return;
    setBusy(true);
    setMsg(null);
    try {
      if (kind === "grant") {
        await api(`/api/admin/users/${user.id}/wip`, { method: "POST", body: { level: Number(level), days: Number(days) } });
        setMsg({ tone: "ok", text: `${label(Number(level))} ${days} günlüğüne verildi.` });
      } else {
        await api(`/api/admin/users/${user.id}/wip`, { method: "DELETE" });
        setMsg({ tone: "ok", text: "WIP üyeliği kaldırıldı." });
      }
    } catch (e) {
      setMsg({ tone: "error", text: e instanceof Error ? e.message : "İşlem başarısız." });
    } finally {
      setBusy(false);
    }
  }

  const tiers = data?.tiers ?? [];
  return (
    <div>
      <PageHeader icon={<Gift size={18} />} kicker="Üyelik" title="WIP Mağazası" description="WIP kademeleri, satıştaki paketler ve kullanıcıya WIP verme." />
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card title="Kullanıcıya WIP ver" subtitle="Kullanıcıyı bulun, kademe ve süreyi seçin">
          <UserPicker onPick={(u) => { setUser(u); setMsg(null); }} />
          {user && (
            <div className="mt-5 space-y-3 rounded-xl border border-[#30291e] p-4">
              <div className="flex items-center gap-3">
                <Avatar url={user.avatarUrl} name={user.displayName || user.username} />
                <div>
                  <p className="font-semibold text-white">{user.displayName || user.username}</p>
                  <p className="text-xs text-gray-500">ID {user.publicId ?? "—"}</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <select value={level} onChange={(e) => setLevel(e.target.value)} className={inputCls} aria-label="Kademe">
                  {Array.from({ length: 11 }, (_, i) => i + 1).map((l) => (
                    <option key={l} value={l}>
                      {label(l)}
                    </option>
                  ))}
                </select>
                <select value={days} onChange={(e) => setDays(e.target.value)} className={inputCls} aria-label="Süre">
                  {["1", "3", "7", "15", "30", "60", "90", "180", "365"].map((d) => (
                    <option key={d} value={d}>
                      {d} gün
                    </option>
                  ))}
                </select>
              </div>
              {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
              <div className="grid gap-3 sm:grid-cols-2">
                <button type="button" disabled={busy} onClick={() => act("grant")} className="gold-button disabled:opacity-60">
                  <Crown size={16} />
                  WIP ver
                </button>
                <button type="button" disabled={busy} onClick={() => act("revoke")} className="rounded-xl border border-red-500/40 px-4 py-3 text-sm text-red-300 hover:bg-red-500/10 disabled:opacity-60">
                  {"WIP'i kaldır"}
                </button>
              </div>
            </div>
          )}
        </Card>

        <Card title="Kademeler ve paketler" subtitle="Ayrıcalıklar birikimlidir; fiyatlar uygulamada gösterilir">
          {loading && !data && <Loading />}
          {error && <ErrorBox message={error} onRetry={reload} />}
          <div className="space-y-3">
            {tiers.map((t) => (
              <details key={t.level} className="rounded-xl border border-[#262117] bg-[#141210] p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                  <span className="font-semibold text-white">{t.name}</span>
                  <span className="text-xs text-gray-500">
                    {t.plans.length ? t.plans.map((p) => `${p.durationDays} gün · ${fmtNumber(p.priceCoins)} Coin`).join("  |  ") : "Satışta paket yok"}
                  </span>
                </summary>
                <div className="mt-3 flex flex-wrap gap-2">
                  {featureText.map(([k, txt]) => (t.features[k] === true ? <Badge key={k}>{txt}</Badge> : null))}
                  <Badge tone="gray">Aynı anda {String(t.features.maxRooms ?? 1)} oda</Badge>
                </div>
              </details>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
