"use client";

import { useState } from "react";
import { Bug, Lock, ShieldAlert, Trash2 } from "lucide-react";
import { api, fmtDate } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { Badge, Card, Empty, ErrorBox, Loading, PageHeader, StatCard, inputCls, tableCls, tableWrap, tdCls, thCls } from "@/components/ui";
import { ActionMsg, Tabs, UserLink, btnDangerOutline, btnGhost, btnSmall, fmtRel, selectCls, useAction, userHref, type Brief } from "./kit";
import Link from "next/link";

type TabKey = "events" | "blocks" | "errors";

const eventText: Record<string, string> = {
  ip_banned: "IP engellendi",
  login_lockout: "Giriş kilidi (çok deneme)",
  login_name_attack: "Kullanıcı adı denemesi saldırısı",
  oauth_login: "Google / Facebook girişi",
};
const evLabel = (t: string) => eventText[t] ?? (t.startsWith("violation:") ? `İhlal: ${t.slice(10)}` : t);

export default function AdminSecurity() {
  const pending = useApi<{ errors?: number }>("/api/admin/overview/pending");
  const [tab, setTab] = useState<TabKey>("events");
  return (
    <div>
      <PageHeader icon={<ShieldAlert size={18} />} kicker="Güvenlik duvarı" title="Güvenlik" description="Saldırı / şüpheli olay kayıtları, IP engelleri ve uygulamadan gelen hata raporları." />
      <Tabs
        tabs={[
          { key: "events", label: "Güvenlik olayları" },
          { key: "blocks", label: "IP engelleri" },
          { key: "errors", label: "Uygulama hataları", count: pending.data?.errors },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === "events" && <Events />}
      {tab === "blocks" && <Blocks />}
      {tab === "errors" && <Errors onChanged={pending.reload} />}
    </div>
  );
}

type Ev = { id: string; event_type: string; ip: string | null; user_id: string | null; detail: unknown; created_at: string };

function Events() {
  const [type, setType] = useState("");
  const { data, error, loading, reload } = useApi<{ events: Ev[]; stats: { bans: number; eventsLogged: number; limiterKeys: number } }>(
    `/api/admin/security/events?limit=300${type ? `&type=${encodeURIComponent(type)}` : ""}`
  );
  const { busy, msg, run } = useAction();
  return (
    <div className="space-y-6">
      {data && (
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
          <StatCard label="Engelli IP" value={data.stats.bans} icon={<Lock size={18} />} tone="red" />
          <StatCard label="Olay (sunucu açıldığından beri)" value={data.stats.eventsLogged} icon={<ShieldAlert size={18} />} />
          <StatCard label="İzlenen istek anahtarı" value={data.stats.limiterKeys} tone="blue" />
        </div>
      )}
      <Card
        title="Güvenlik olayları"
        subtitle="Son 300 olay"
        action={
          <select value={type} onChange={(e) => setType(e.target.value)} className={selectCls} aria-label="Olay türü">
            <option value="">Tüm olaylar</option>
            {Object.entries(eventText).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
        }
      >
        <ActionMsg msg={msg} />
        {loading && !data && <Loading />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {data && data.events.length === 0 && <Empty title="Olay yok" />}
        {data && data.events.length > 0 && (
          <div className={`${tableWrap} mt-2`}>
            <table className={`${tableCls} min-w-[820px]`}>
              <thead>
                <tr>
                  <th className={thCls}>Tarih</th>
                  <th className={thCls}>Olay</th>
                  <th className={thCls}>IP</th>
                  <th className={thCls}>Kullanıcı</th>
                  <th className={thCls}>Ayrıntı</th>
                </tr>
              </thead>
              <tbody>
                {data.events.map((e) => (
                  <tr key={e.id}>
                    <td className={`${tdCls} whitespace-nowrap text-xs text-gray-400`}>{fmtDate(e.created_at)}</td>
                    <td className={tdCls}>{evLabel(e.event_type)}</td>
                    <td className={tdCls}>
                      {e.ip ? (
                        <span className="inline-flex items-center gap-2 font-mono text-xs">
                          {e.ip}
                          <button
                            type="button"
                            disabled={busy}
                            className={btnSmall}
                            onClick={() =>
                              run(`${e.ip} 24 saat engellendi.`, async () => {
                                if (!window.confirm(`${e.ip} adresi 24 saat engellensin mi?`)) return false;
                                await api("/api/admin/security/blocks", { method: "POST", body: { ip: e.ip, minutes: 1440, reason: evLabel(e.event_type) } });
                              })
                            }
                          >
                            Engelle
                          </button>
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className={tdCls}>
                      {e.user_id ? (
                        <Link href={userHref(e.user_id)} className="text-xs text-[#e5c77e] hover:underline">
                          Kullanıcıyı aç
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className={`${tdCls} max-w-[280px] text-xs text-gray-400`}>
                      <span className="line-clamp-2 break-all">{e.detail ? JSON.stringify(e.detail) : "—"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function Blocks() {
  const { data, error, loading, reload } = useApi<{ blocks: { ip: string; reason: string | null; until: string | null }[] }>("/api/admin/security/blocks");
  const { busy, msg, run } = useAction();
  const [ip, setIp] = useState("");
  const [minutes, setMinutes] = useState("1440");
  const [reason, setReason] = useState("");
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card title="Engelli IP adresleri">
        <ActionMsg msg={msg} />
        {loading && !data && <Loading />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {data && data.blocks.length === 0 && <Empty title="Engelli IP yok" />}
        {data && data.blocks.length > 0 && (
          <ul className="mt-2 space-y-2">
            {data.blocks.map((b) => (
              <li key={b.ip} className="flex items-center justify-between gap-3 rounded-xl border border-[#262117] bg-[#141210] px-4 py-3">
                <span className="min-w-0">
                  <span className="block font-mono text-sm text-white">{b.ip}</span>
                  <span className="block truncate text-xs text-gray-500">
                    {b.reason ?? "—"} · {b.until ? `bitiş ${fmtRel(b.until)}` : "süresiz"}
                  </span>
                </span>
                <button
                  type="button"
                  disabled={busy}
                  className={btnSmall}
                  onClick={() =>
                    run("Engel kaldırıldı.", async () => {
                      await api(`/api/admin/security/blocks/${encodeURIComponent(b.ip)}`, { method: "DELETE" });
                      reload();
                    })
                  }
                >
                  Kaldır
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card title="IP engelle">
        <div className="space-y-3">
          <input value={ip} onChange={(e) => setIp(e.target.value.trim())} placeholder="IP adresi (ör. 1.2.3.4)" className={inputCls} aria-label="IP" />
          <select value={minutes} onChange={(e) => setMinutes(e.target.value)} className={`${selectCls} w-full`} aria-label="Süre">
            <option value="60">1 saat</option>
            <option value="1440">1 gün</option>
            <option value="10080">7 gün</option>
            <option value="43200">30 gün</option>
            <option value="">Süresiz</option>
          </select>
          <input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={200} placeholder="Neden" className={inputCls} aria-label="Neden" />
          <button
            type="button"
            disabled={busy}
            className={`${btnGhost} w-full`}
            onClick={() =>
              run("IP engellendi.", async () => {
                if (!ip) throw new Error("IP adresi girin.");
                await api("/api/admin/security/blocks", { method: "POST", body: { ip, minutes: minutes ? Number(minutes) : null, reason: reason.trim() || null } });
                setIp("");
                setReason("");
                reload();
              })
            }
          >
            <Lock size={15} /> Engelle
          </button>
          <p className="text-xs text-gray-500">Mobil operatörlerde aynı IP'yi binlerce kişi paylaşabilir; süresiz engeli dikkatli kullanın.</p>
        </div>
      </Card>
    </div>
  );
}

type ClientError = {
  id: string;
  source: string;
  message: string;
  stack: string | null;
  appVersion: string | null;
  device: string | null;
  occurredAt: string | null;
  createdAt: string;
  user: Brief | null;
};

function Errors({ onChanged }: { onChanged: () => void }) {
  const { data, error, loading, reload } = useApi<{ errors: ClientError[]; top: { source: string; message: string; count: number; users: number; lastAt: string }[] }>("/api/admin/client-errors?limit=200");
  const { busy, msg, run } = useAction();
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="space-y-6">
      <Card
        title="En sık hatalar (son 7 gün)"
        action={
          <button
            type="button"
            disabled={busy}
            className={btnDangerOutline}
            onClick={() =>
              run("Hata kayıtları temizlendi.", async () => {
                if (!window.confirm("Tüm uygulama hata kayıtları silinsin mi?")) return false;
                await api("/api/admin/client-errors", { method: "DELETE" });
                reload();
                onChanged();
              })
            }
          >
            <Trash2 size={15} /> Tümünü temizle
          </button>
        }
      >
        <ActionMsg msg={msg} />
        {loading && !data && <Loading />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {data && data.top.length === 0 && <Empty title="Hata yok" />}
        {data && data.top.length > 0 && (
          <ul className="mt-2 space-y-2">
            {data.top.map((t, i) => (
              <li key={i} className="flex items-start justify-between gap-3 rounded-xl border border-[#262117] bg-[#141210] px-4 py-3">
                <span className="min-w-0">
                  <span className="block break-words text-sm text-white">{t.message}</span>
                  <span className="text-xs text-gray-500">
                    {t.source} · {t.users} kişi · son {fmtRel(t.lastAt)}
                  </span>
                </span>
                <Badge tone="red">{t.count}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card title="Son hata raporları">
        {data && data.errors.length === 0 && <Empty title="Rapor yok" />}
        {data && data.errors.length > 0 && (
          <ul className="space-y-2">
            {data.errors.map((e) => (
              <li key={e.id} className="rounded-xl border border-[#262117] bg-[#141210] px-4 py-3">
                <button type="button" onClick={() => setOpen(open === e.id ? null : e.id)} className="flex w-full items-start gap-3 text-left">
                  <Bug size={15} className="mt-0.5 shrink-0 text-red-300" />
                  <span className="min-w-0 flex-1">
                    <span className="block break-words text-sm text-white">{e.message}</span>
                    <span className="text-xs text-gray-500">
                      {e.source} · {e.appVersion ?? "?"} · {e.device ?? "cihaz ?"} · {fmtDate(e.createdAt)}
                    </span>
                  </span>
                </button>
                {open === e.id && (
                  <div className="mt-3 space-y-2">
                    {e.user && <UserLink user={e.user} size={24} />}
                    {e.stack && <pre className="max-h-64 overflow-auto rounded-lg bg-black/40 p-3 text-[11px] leading-4 text-gray-400">{e.stack}</pre>}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
