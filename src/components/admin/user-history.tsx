"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { LogOut, Monitor, Send, Smartphone } from "lucide-react";
import { api, absoluteUrl, fmtDate, fmtNumber } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { Badge, Card, Empty, ErrorBox, Loading, inputCls, tableCls, tableWrap, tdCls, thCls } from "@/components/ui";
import { ActionMsg, Pager, Tabs, UserLink, fmtRel, roomHref, useAction, type Brief } from "./kit";

export const txTypeText: Record<string, string> = {
  admin_adjustment: "Yönetici düzenlemesi",
  gift_sent: "Hediye gönderdi",
  gift_received: "Hediye aldı",
  store_purchase: "Mağaza alışverişi",
  wip_purchase: "WIP satın alma",
  diamond_exchange: "Elmas → Coin çevirme",
  lucky_gift_win: "Şanslı hediye kazancı",
  lucky_bag_sent: "Şans çantası gönderdi",
  lucky_bag_received: "Şans çantası aldı",
  lucky_bag_refund: "Şans çantası iadesi",
  family_cashback: "Aile geri ödemesi",
  family_reward: "Aile ödülü",
  fly_text: "Uçan yazı",
  guardian_card: "Koruyucu kartı",
  relation_invite: "İlişki daveti",
  relation_refund: "İlişki iadesi",
  salary_conversion: "Maaşa çevirme",
  salary_conversion_refund: "Maaş iadesi",
  dealer_credit: "Bayiden Coin yükleme",
  daily_bonus: "Günlük ödül",
  event_reward: "Etkinlik ödülü",
};

export const actionText: Record<string, string> = {
  admin_coin_adjustment: "Coin düzenlemesi",
  account_ban: "Ban",
  account_unban: "Ban kaldırma",
  account_delete: "Hesap silme",
  profile_display_name: "Ad değişikliği",
  profile_avatar: "Fotoğraf değişikliği",
  staff_role: "Yetki değişikliği",
  admin_wip_grant: "WIP verildi",
  admin_wip_revoke: "WIP kaldırıldı",
  admin_inventory_grant: "Öğe verildi",
  special_id_grant: "Özel ID verildi",
  special_id_revoke: "Özel ID kaldırıldı",
  host_badge_grant: "Rozet verildi",
  host_badge_revoke: "Rozet kaldırıldı",
  kyc_status: "Kimlik durumu",
  chat_restriction: "Sohbet kısıtı",
  credentials_update: "Giriş bilgisi değişikliği",
  sessions_revoke: "Oturumlar kapatıldı",
  broadcaster_status: "Yayıncılık durumu",
  agency_create: "Ajans açıldı",
  agency_status: "Ajans durumu",
  agency_referrer: "Davet eden ajans",
  agency_commission_override: "Özel komisyon",
  agency_transfer_decide: "Transfer kararı",
  host_salary_paid: "Maaş ödendi",
  agency_commission_paid: "Ajans primi ödendi",
  assistant_share_paid: "Asistan payı ödendi",
  referral_reward_paid: "Davet primi ödendi",
  statement_void: "Özet iptal",
  room_close: "Oda kapatıldı",
  room_kick: "Odadan çıkarıldı",
  room_message_delete: "Oda mesajı silindi",
  app_config_update: "Uygulama ayarı",
  banner_add: "Banner eklendi",
  banner_delete: "Banner silindi",
  announcement_add: "Duyuru eklendi",
  agency_config_update: "Ajans ayarları",
  pay_levels_update: "Maaş tablosu",
  pay_levels_reset: "Maaş tablosu sıfırlandı",
  dealer_coin_load: "Bayiye Coin",
};

type Paged<T> = { page: number; hasMore: boolean; items: T[] };

const signed = (v: string | null) => {
  if (v === null || v === "0") return <span className="text-gray-600">—</span>;
  const neg = v.startsWith("-");
  return <span className={neg ? "text-red-300" : "text-emerald-300"}>{neg ? "" : "+"}{fmtNumber(v)}</span>;
};

export function UserWallet({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useApi<Paged<{ id: string; type: string; coins: string | null; diamonds: string | null; description: string | null; createdAt: string }>>(
    `/api/admin/users/${userId}/history?kind=wallet&page=${page}`
  );
  return (
    <Card title="Cüzdan hareketleri" subtitle="Coin ve Elmas giriş / çıkışları, en yeni üstte">
      {loading && !data && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && data.items.length === 0 && <Empty title="Hareket yok" />}
      {data && data.items.length > 0 && (
        <div className={tableWrap}>
          <table className={tableCls}>
            <thead>
              <tr>
                <th className={thCls}>Tarih</th>
                <th className={thCls}>İşlem</th>
                <th className={`${thCls} text-right`}>Coin</th>
                <th className={`${thCls} text-right`}>Elmas</th>
                <th className={thCls}>Açıklama</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((x) => (
                <tr key={x.id}>
                  <td className={`${tdCls} whitespace-nowrap text-xs text-gray-400`}>{fmtDate(x.createdAt)}</td>
                  <td className={tdCls}>{txTypeText[x.type] ?? x.type}</td>
                  <td className={`${tdCls} text-right`}>{signed(x.coins)}</td>
                  <td className={`${tdCls} text-right`}>{signed(x.diamonds)}</td>
                  <td className={`${tdCls} max-w-[320px] truncate text-xs text-gray-400`} title={x.description ?? ""}>
                    {x.description ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && <Pager page={data.page} hasMore={data.hasMore} onPage={setPage} />}
    </Card>
  );
}

type GiftRow = {
  id: string;
  giftName: string;
  iconUrl: string | null;
  quantity: string;
  coins: string;
  diamonds: string | null;
  createdAt: string;
  room: { id: string; name: string } | null;
  peer: Brief | null;
};

export function GiftIcon({ url }: { url: string | null }) {
  const src = absoluteUrl(url);
  // eslint-disable-next-line @next/next/no-img-element
  return src ? <img src={src} alt="" className="h-8 w-8 shrink-0 rounded-lg object-contain" /> : <span className="h-8 w-8 shrink-0 rounded-lg bg-[#292114]" />;
}

export function UserGifts({ userId }: { userId: string }) {
  const [dir, setDir] = useState<"gifts_sent" | "gifts_received">("gifts_sent");
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useApi<Paged<GiftRow>>(`/api/admin/users/${userId}/history?kind=${dir}&page=${page}`);
  return (
    <div>
      <Tabs
        tabs={[
          { key: "gifts_sent", label: "Gönderdiği hediyeler" },
          { key: "gifts_received", label: "Aldığı hediyeler" },
        ]}
        value={dir}
        onChange={(k) => {
          setDir(k);
          setPage(1);
        }}
      />
      <Card>
        {loading && !data && <Loading />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {data && data.items.length === 0 && <Empty title="Hediye yok" />}
        {data && data.items.length > 0 && (
          <div className={tableWrap}>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>Hediye</th>
                  <th className={thCls}>{dir === "gifts_sent" ? "Alan" : "Gönderen"}</th>
                  <th className={`${thCls} text-right`}>Coin</th>
                  <th className={thCls}>Oda</th>
                  <th className={thCls}>Tarih</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((g) => (
                  <tr key={g.id}>
                    <td className={tdCls}>
                      <div className="flex items-center gap-2">
                        <GiftIcon url={g.iconUrl} />
                        <span>
                          {g.giftName}
                          {g.quantity !== "1" ? ` ×${g.quantity}` : ""}
                        </span>
                      </div>
                    </td>
                    <td className={tdCls}>
                      <UserLink user={g.peer} size={28} />
                    </td>
                    <td className={`${tdCls} text-right font-medium`}>{fmtNumber(g.coins)}</td>
                    <td className={`${tdCls} text-xs`}>
                      {g.room ? (
                        <Link href={roomHref(g.room.id)} className="text-[#e5c77e] hover:underline">
                          {g.room.name}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className={`${tdCls} whitespace-nowrap text-xs text-gray-400`}>{fmtDate(g.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && <Pager page={data.page} hasMore={data.hasMore} onPage={setPage} />}
      </Card>
    </div>
  );
}

export function metaSummary(m: unknown): string {
  if (!m || typeof m !== "object") return "";
  const parts: string[] = [];
  for (const [k, v] of Object.entries(m as Record<string, unknown>)) {
    if (v === null || v === undefined || k === "by") continue;
    const val = typeof v === "object" ? JSON.stringify(v) : String(v);
    parts.push(`${k}: ${val.length > 60 ? `${val.slice(0, 60)}…` : val}`);
  }
  return parts.join(" · ");
}

type AuditRow = {
  id: string;
  action: string;
  referenceType: string | null;
  amountCoins: string | null;
  balanceBefore: string | null;
  balanceAfter: string | null;
  metadata: unknown;
  createdAt: string;
  actor: Brief | null;
  target: Brief | null;
};

export function UserAudit({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useApi<Paged<AuditRow>>(`/api/admin/users/${userId}/history?kind=audit&page=${page}`);
  return (
    <Card title="İşlem kayıtları" subtitle="Bu kullanıcıya yapılan ve (yetkiliyse) onun yaptığı tüm kayıtlı işlemler">
      {loading && !data && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && data.items.length === 0 && <Empty title="Kayıt yok" />}
      {data && data.items.length > 0 && <AuditTable rows={data.items} />}
      {data && <Pager page={data.page} hasMore={data.hasMore} onPage={setPage} />}
    </Card>
  );
}

export function AuditTable({ rows }: { rows: AuditRow[] }) {
  return (
    <div className={tableWrap}>
      <table className={`${tableCls} min-w-[820px]`}>
        <thead>
          <tr>
            <th className={thCls}>Tarih</th>
            <th className={thCls}>İşlem</th>
            <th className={thCls}>Yapan</th>
            <th className={thCls}>Hedef</th>
            <th className={thCls}>Ayrıntı</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((x) => (
            <tr key={x.id}>
              <td className={`${tdCls} whitespace-nowrap text-xs text-gray-400`}>{fmtDate(x.createdAt)}</td>
              <td className={tdCls}>
                <span className="font-medium">{actionText[x.action] ?? x.action}</span>
                {x.amountCoins && x.amountCoins !== "0" && <span className="ml-2 text-xs">{signed(x.amountCoins)} Coin</span>}
              </td>
              <td className={tdCls}>{x.actor ? <UserLink user={x.actor} size={24} /> : <span className="text-xs text-gray-500">Sistem / kullanıcı</span>}</td>
              <td className={tdCls}>{x.target ? <UserLink user={x.target} size={24} /> : <span className="text-xs text-gray-500">{x.referenceType ?? "—"}</span>}</td>
              <td className={`${tdCls} max-w-[340px] text-xs text-gray-400`}>
                <span className="line-clamp-2 break-words">
                  {x.balanceBefore !== null && x.balanceAfter !== null ? `Bakiye ${fmtNumber(x.balanceBefore)} → ${fmtNumber(x.balanceAfter)} · ` : ""}
                  {metaSummary(x.metadata) || "—"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type Devices = {
  sessions: {
    id: string;
    deviceName: string | null;
    platform: string | null;
    appVersion: string | null;
    emulator: boolean | null;
    ip: string | null;
    createdAt: string;
    lastUsedAt: string;
    revokedAt: string | null;
    revokeReason: string | null;
  }[];
  online: boolean;
  linkedAccounts: { id: string; publicId: string | null; username: string; displayName: string; accountStatus: string; lastUsedAt: string }[];
};

export function UserDevices({ userId, self, onChanged }: { userId: string; self: { systemRole: string }; onChanged: () => void }) {
  const { data, error, loading, reload } = useApi<Devices>(`/api/admin/users/${userId}/devices`);
  const { busy, msg, run } = useAction();
  return (
    <div className="space-y-6">
      <Card
        title="Oturumlar ve cihazlar"
        subtitle="Son 30 oturum. IP adresi ve cihaz bilgisi güvenlik amacıyla tutulur."
        action={
          self.systemRole !== "admin" ? (
            <button
              type="button"
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/50 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10 disabled:opacity-50"
              onClick={() =>
                run("Tüm oturumlar kapatıldı.", async () => {
                  if (!window.confirm("Kullanıcının tüm oturumları kapatılsın mı?")) return false;
                  await api(`/api/admin/users/${userId}/sessions/revoke-all`, { method: "POST", body: {} });
                  reload();
                  onChanged();
                })
              }
            >
              <LogOut size={15} /> Tüm oturumları kapat
            </button>
          ) : undefined
        }
      >
        <ActionMsg msg={msg} />
        {loading && !data && <Loading />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {data && data.sessions.length === 0 && <Empty title="Oturum kaydı yok" />}
        {data && data.sessions.length > 0 && (
          <div className={`${tableWrap} mt-3`}>
            <table className={`${tableCls} min-w-[820px]`}>
              <thead>
                <tr>
                  <th className={thCls}>Cihaz</th>
                  <th className={thCls}>Sürüm</th>
                  <th className={thCls}>IP</th>
                  <th className={thCls}>İlk giriş</th>
                  <th className={thCls}>Son kullanım</th>
                  <th className={thCls}>Durum</th>
                </tr>
              </thead>
              <tbody>
                {data.sessions.map((x) => (
                  <tr key={x.id}>
                    <td className={tdCls}>
                      <span className="inline-flex items-center gap-2">
                        {x.platform === "web" ? <Monitor size={15} className="text-gray-500" /> : <Smartphone size={15} className="text-gray-500" />}
                        {x.deviceName || x.platform || "Bilinmiyor"}
                        {x.emulator && <Badge tone="red">Emülatör</Badge>}
                      </span>
                    </td>
                    <td className={`${tdCls} text-xs`}>{x.appVersion ?? "—"}</td>
                    <td className={`${tdCls} font-mono text-xs`}>{x.ip ?? "—"}</td>
                    <td className={`${tdCls} whitespace-nowrap text-xs text-gray-400`}>{fmtDate(x.createdAt)}</td>
                    <td className={`${tdCls} whitespace-nowrap text-xs text-gray-400`}>{fmtRel(x.lastUsedAt)}</td>
                    <td className={tdCls}>{x.revokedAt ? <Badge tone="gray">Kapalı{x.revokeReason ? ` · ${x.revokeReason}` : ""}</Badge> : <Badge tone="green">Açık</Badge>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Card title="Aynı cihazı kullanan diğer hesaplar" subtitle="Çoklu hesap / hile tespiti için">
        {data && data.linkedAccounts.length === 0 && <Empty title="Başka hesap yok" />}
        {data && data.linkedAccounts.length > 0 && (
          <ul className="grid gap-2 md:grid-cols-2">
            {data.linkedAccounts.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#262117] bg-[#141210] px-4 py-3">
                <UserLink user={a} size={30} />
                <span className="shrink-0 text-xs text-gray-400">
                  {a.accountStatus === "banned" ? <Badge tone="red">Banlı</Badge> : a.accountStatus === "deleted" ? <Badge tone="gray">Silinmiş</Badge> : fmtRel(a.lastUsedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

type SupportMsg = { id: string; fromStaff: boolean; category: string | null; text: string; createdAt: string };

export function SupportThread({ userId, onSent }: { userId: string; onSent?: () => void }) {
  const { data, error, loading, reload } = useApi<{ messages: SupportMsg[] }>(`/api/admin/support/${userId}`);
  const [textVal, setTextVal] = useState("");
  const { busy, msg, run } = useAction();
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [data]);

  const send = (e: FormEvent) => {
    e.preventDefault();
    void run("Yanıt gönderildi.", async () => {
      const t = textVal.trim();
      if (!t) throw new Error("Mesaj yazın.");
      await api(`/api/admin/support/${userId}/reply`, { method: "POST", body: { text: t } });
      setTextVal("");
      reload();
      onSent?.();
    });
  };

  return (
    <div>
      {loading && !data && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && (
        <div className="max-h-[460px] space-y-2 overflow-y-auto rounded-xl border border-[#262117] bg-[#0d0d0d] p-4">
          {data.messages.length === 0 && <p className="py-8 text-center text-sm text-gray-500">Henüz destek mesajı yok. Aşağıdan ilk mesajı gönderebilirsiniz.</p>}
          {data.messages.map((m) => (
            <div key={m.id} className={`flex ${m.fromStaff ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.fromStaff ? "bg-[#292114] text-[#f2e2b8]" : "bg-[#1b1b1b] text-gray-200"}`}>
                <p className="whitespace-pre-wrap break-words">{m.text}</p>
                <p className="mt-1 text-[11px] text-gray-500">
                  {m.fromStaff ? "Destek ekibi" : "Kullanıcı"}
                  {m.category ? ` · ${m.category}` : ""} · {fmtDate(m.createdAt)}
                </p>
              </div>
            </div>
          ))}
          <div ref={end} />
        </div>
      )}
      <form onSubmit={send} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <textarea value={textVal} onChange={(e) => setTextVal(e.target.value)} maxLength={1500} rows={2} placeholder="Yanıtınızı yazın (uygulamada Destek bölümünde görünür)" className={`${inputCls} flex-1`} />
        <button type="submit" disabled={busy} className="gold-button shrink-0 px-5 disabled:opacity-60 sm:self-stretch">
          <Send size={16} /> Gönder
        </button>
      </form>
      <div className="mt-2">
        <ActionMsg msg={msg} />
      </div>
    </div>
  );
}

export function UserSupport({ userId }: { userId: string }) {
  return (
    <Card title="Destek yazışması" subtitle="Kullanıcıyla uygulama içi Destek kanalından yazışın">
      <SupportThread userId={userId} />
    </Card>
  );
}
