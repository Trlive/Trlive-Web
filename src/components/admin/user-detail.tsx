"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Coins, Flag, Gem, Gift, Heart, Radio, ShieldAlert } from "lucide-react";
import { fmtDate, fmtNumber, absoluteUrl } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { Badge, Card, Empty, ErrorBox, Loading, StatCard } from "@/components/ui";
import { Avatar } from "./user-picker";
import {
  KV,
  StatusBadge,
  Tabs,
  fmtRel,
  genderText,
  hostStatusText,
  kycText,
  reportKindText,
  reportReasonText,
  roleText,
  roomHref,
  useQueryValue,
} from "./kit";
import UserActions from "./user-actions";
import { UserAudit, UserDevices, UserGifts, UserSupport, UserWallet } from "./user-history";

export type Detail = {
  viewer: { full: boolean };
  user: {
    id: string;
    publicId: string | null;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    coverUrl: string | null;
    bio: string | null;
    language: string | null;
    gender: string | null;
    country: string | null;
    city: string | null;
    systemRole: string;
    accountStatus: string;
    bannedUntil: string | null;
    banReason: string | null;
    bannedBy: string | null;
    chatRestrictedUntil: string | null;
    createdAt: string;
    updatedAt: string;
    lastSeenAt: string | null;
    online: boolean;
    coinLevel: number;
    giftLevel: number;
    xp: string | null;
    isHidden: boolean;
    showPresence: boolean;
    ghostMode: boolean;
    hideCountry: boolean;
    hideVisits: boolean;
    whoCanDm: string | null;
    termsVersion: string | null;
    termsAcceptedAt: string | null;
    cpPartner: { id: string; username: string; displayName: string } | null;
    wip: { level: number; startsAt: string; expiresAt: string } | null;
    specialId: { value: string; expiresAt: string } | null;
    hostBadge: { badge: string; expiresAt: string } | null;
    coins?: string;
    diamonds?: string;
    totalSentCoins?: string;
    totalReceivedDiamonds?: string;
    phone?: string | null;
    birthDate?: string | null;
    kycStatus?: string;
    hasPassword?: boolean;
  };
  stats: {
    followers: number;
    following: number;
    giftsSent: number;
    giftsReceived: number;
    roomsOpened: number;
    reportsAgainst: number;
    reportsOpen: number;
    reportsMade: number;
    strikes: number;
    supportMessages: number;
  };
  family: { id: string; name: string; publicId: string | null; level: number; role: string; joinedAt: string } | null;
  broadcaster: {
    status: string;
    appliedAt: string | null;
    approvedAt: string | null;
    joinedAgencyAt: string | null;
    contractTier: number | null;
    agency: { id: string; name: string } | null;
  } | null;
  agencyOwned: { id: string; name: string; status: string; agencyCode?: string | null; commissionBps?: number } | null;
  assistantOf: { id: string; name: string; status: string; shareBps?: number } | null;
  currentRooms: { id: string; name: string; roomType: string; role: string; microphone: boolean; seatIndex: number | null; joinedAt: string }[];
  ownedRooms: { id: string; name: string; roomType: string; roomNumber: string | null; isActive: boolean; createdAt: string; closedAt: string | null }[];
  reports: {
    id: string;
    kind: string;
    reason: string;
    details: string | null;
    status: string;
    createdAt: string;
    note: string | null;
    reporter: { id: string; username: string };
  }[];
  strikes: { id: string; kind: string; context: string; sample: string | null; createdAt: string }[];
  inventory: { id: string; itemType: string; itemKey: string; itemName: string; quantity: number; expiresAt: string | null; createdAt: string }[];
  identities: { provider: string; email: string | null; createdAt: string }[];
};

type TabKey = "general" | "actions" | "wallet" | "gifts" | "inventory" | "devices" | "reports" | "support" | "audit";

const wipName = (l: number) => (l >= 11 ? "SWIP" : `WIP ${l}`);
const yesNo = (b: boolean) => (b ? "Açık" : "Kapalı");
const dmText: Record<string, string> = { everyone: "Herkes", following: "Takip ettikleri", nobody: "Kimse" };
const familyRoleText: Record<string, string> = { owner: "Aile reisi", admin: "Yönetici", elder: "Kıdemli", member: "Üye" };
export const strikeKindText: Record<string, string> = { link: "Bağlantı paylaşımı", phone: "Telefon paylaşımı", profanity: "Küfür / hakaret", flood: "Spam", auto_mute: "Otomatik susturma" };
const itemTypeText: Record<string, string> = {
  frame: "Çerçeve",
  entrance_effect: "Giriş efekti",
  badge: "Rozet",
  profile_effect: "Profil efekti",
  chat_bubble: "Sohbet balonu",
  mini_card: "Mini kart",
  mic_wave: "Mikrofon dalgası",
  vehicle: "Araç",
  room_card: "Oda kartı",
  colored_id: "Renkli ID",
};

function age(iso?: string | null): string {
  if (!iso) return "—";
  const b = new Date(iso);
  if (Number.isNaN(b.getTime())) return "—";
  const n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a -= 1;
  return `${fmtDate(iso, false)} (${a} yaş)`;
}

export default function AdminUserDetail() {
  const id = useQueryValue("id");
  if (!id) return <ErrorBox message="Kullanıcı seçilmedi. Kullanıcılar listesinden birini açın." />;
  // key: başka bir kullanıcıya geçince (aynı sayfa, farklı ?id=) sekme, sayfa ve form durumları sıfırlanır.
  return <UserDetailView key={id} id={id} />;
}

function UserDetailView({ id }: { id: string }) {
  const { data, error, loading, reload } = useApi<Detail>(`/api/admin/users/${encodeURIComponent(id)}/detail`);
  const [tab, setTab] = useState<TabKey>("general");

  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorBox message={error} onRetry={reload} />;
  if (!data) return null;

  const { user: u, stats: s, viewer } = data;
  const full = viewer.full;
  const name = u.displayName || u.username;
  const tabs: { key: TabKey; label: string; count?: number | null }[] = [
    { key: "general", label: "Genel" },
    { key: "actions", label: "İşlemler" },
    ...(full
      ? ([
          { key: "wallet", label: "Cüzdan" },
          { key: "gifts", label: "Hediyeler" },
          { key: "inventory", label: "Envanter ve ayrıcalıklar" },
          { key: "devices", label: "Cihazlar ve oturumlar" },
        ] as const)
      : []),
    { key: "reports", label: "Şikâyet ve ihlaller", count: s.reportsOpen },
    { key: "support", label: "Destek" },
    ...(full ? ([{ key: "audit", label: "Kayıtlar" }] as const) : []),
  ];
  const cover = absoluteUrl(u.coverUrl);

  return (
    <div>
      <Link href="/admin/users" className="mb-4 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
        <ArrowLeft size={16} /> Kullanıcılar
      </Link>

      <section className="mb-6 overflow-hidden rounded-2xl border border-[#30291e] bg-[#111111]">
        <div
          className="h-24 bg-gradient-to-r from-[#2a2010] via-[#1a150d] to-[#111]"
          style={cover ? { backgroundImage: `url(${cover})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        />
        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-end md:p-6">
          <div className="-mt-14 rounded-full border-4 border-[#111] bg-[#111]">
            <Avatar url={u.avatarUrl} name={name} size={88} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-2xl font-bold text-white">{name}</h2>
            <p className="mt-1 break-all text-sm text-gray-400">
              @{u.username}
              {u.publicId ? ` · ID ${u.publicId}` : ""}
              {u.specialId ? ` · Özel ID ${u.specialId.value}` : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge status={u.accountStatus} bannedUntil={u.bannedUntil} />
              <Badge tone="gray">{roleText[u.systemRole] ?? u.systemRole}</Badge>
              {u.online ? <Badge tone="green">Çevrimiçi</Badge> : <Badge tone="gray">Son görülme: {fmtRel(u.lastSeenAt)}</Badge>}
              {u.wip && <Badge>{wipName(u.wip.level)}</Badge>}
              {data.broadcaster && <Badge tone={data.broadcaster.status === "approved" ? "green" : "gray"}>Yayıncı: {hostStatusText[data.broadcaster.status] ?? data.broadcaster.status}</Badge>}
              {data.agencyOwned && <Badge tone="blue">Ajans sahibi</Badge>}
              {u.chatRestrictedUntil && <Badge tone="red">Sohbet kısıtlı · {fmtRel(u.chatRestrictedUntil)}</Badge>}
              {full && u.kycStatus && u.kycStatus !== "none" && <Badge tone={u.kycStatus === "approved" ? "green" : "gray"}>Kimlik: {kycText[u.kycStatus] ?? u.kycStatus}</Badge>}
            </div>
            {u.accountStatus === "banned" && (
              <p className="mt-3 text-sm text-red-300">
                Ban nedeni: {u.banReason || "—"}
                {u.bannedBy ? ` · Banlayan: @${u.bannedBy}` : ""}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
        {full && <StatCard label="Coin" value={fmtNumber(u.coins)} icon={<Coins size={18} />} note={`Harcanan: ${fmtNumber(u.totalSentCoins)}`} />}
        {full && <StatCard label="Elmas" value={fmtNumber(u.diamonds)} icon={<Gem size={18} />} tone="blue" note={`Toplam kazanılan: ${fmtNumber(u.totalReceivedDiamonds)}`} />}
        <StatCard label="Takipçi" value={fmtNumber(s.followers)} icon={<Heart size={18} />} tone="red" note={`Takip ettiği: ${fmtNumber(s.following)}`} />
        <StatCard label="Hediye" value={fmtNumber(s.giftsSent)} icon={<Gift size={18} />} note={`Gönderdi · Aldı: ${fmtNumber(s.giftsReceived)}`} />
        <StatCard label="Açtığı oda" value={fmtNumber(s.roomsOpened)} icon={<Radio size={18} />} tone="green" note={`Seviye: ${u.coinLevel} · Hediye sv: ${u.giftLevel}`} />
        <StatCard
          label="Şikâyet"
          value={fmtNumber(s.reportsAgainst)}
          icon={<Flag size={18} />}
          tone={s.reportsOpen > 0 ? "red" : "gold"}
          note={`Açık: ${s.reportsOpen} · İhlal: ${s.strikes}`}
        />
      </div>

      <Tabs tabs={tabs} value={tab} onChange={setTab} />

      {tab === "general" && <General data={data} />}
      {tab === "actions" && <UserActions data={data} onChanged={reload} />}
      {tab === "wallet" && full && <UserWallet userId={u.id} />}
      {tab === "gifts" && full && <UserGifts userId={u.id} />}
      {tab === "inventory" && full && <Inventory data={data} />}
      {tab === "devices" && full && <UserDevices userId={u.id} self={u} onChanged={reload} />}
      {tab === "reports" && <Reports data={data} />}
      {tab === "support" && <UserSupport userId={u.id} />}
      {tab === "audit" && full && <UserAudit userId={u.id} />}
    </div>
  );
}

function General({ data }: { data: Detail }) {
  const u = data.user;
  const full = data.viewer.full;
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card title="Profil">
        <KV
          items={[
            ["Görünen ad", u.displayName],
            ["Kullanıcı adı", `@${u.username}`],
            ["Uygulama ID", u.publicId ?? "—"],
            ["Sistem kimliği", <span key="id" className="font-mono text-xs">{u.id}</span>],
            ["Cinsiyet", u.gender ? genderText[u.gender] ?? u.gender : "—"],
            ...(full ? ([["Doğum tarihi", age(u.birthDate)]] as [string, string][]) : []),
            ["Ülke / şehir", [u.country, u.city].filter(Boolean).join(" · ") || "—"],
            ["Dil", u.language ?? "—"],
            ["Kayıt tarihi", fmtDate(u.createdAt)],
            ["Son görülme", u.online ? "Şu an çevrimiçi" : fmtDate(u.lastSeenAt)],
            ["Seviye", `Coin Lv ${u.coinLevel} · Hediye Lv ${u.giftLevel}${u.xp ? ` · XP ${fmtNumber(u.xp)}` : ""}`],
            ["Sözleşme onayı", u.termsVersion ? `${u.termsVersion} · ${fmtDate(u.termsAcceptedAt)}` : "Henüz onaylamadı"],
          ]}
        />
        {u.bio && <p className="mt-4 whitespace-pre-wrap rounded-xl border border-[#262117] bg-[#141210] p-4 text-sm text-gray-300">{u.bio}</p>}
      </Card>

      <div className="space-y-6">
        {full && (
          <Card title="Hesap ve giriş">
            <KV
              items={[
                ["Telefon", u.phone || "—"],
                ["Şifre", u.hasPassword ? "Tanımlı" : "Yok (sosyal giriş)"],
                ["Bağlı hesaplar", data.identities.length ? data.identities.map((i) => `${i.provider === "google" ? "Google" : i.provider === "facebook" ? "Facebook" : i.provider}${i.email ? ` (${i.email})` : ""}`).join(", ") : "—"],
                ["Kimlik doğrulama (KYC)", kycText[u.kycStatus ?? "none"] ?? u.kycStatus],
              ]}
            />
          </Card>
        )}
        <Card title="Gizlilik ayarları">
          <KV
            cols={3}
            items={[
              ["Gizli kullanıcı", yesNo(u.isHidden)],
              ["Çevrimiçi görünme", yesNo(u.showPresence)],
              ["Hayalet mod", yesNo(u.ghostMode)],
              ["Ülkeyi gizle", yesNo(u.hideCountry)],
              ["Ziyaretleri gizle", yesNo(u.hideVisits)],
              ["Mesaj izni", u.whoCanDm ? dmText[u.whoCanDm] ?? u.whoCanDm : "—"],
            ]}
          />
        </Card>
      </div>

      <Card title="Aile, ajans ve ilişkiler">
        <KV
          items={[
            ["Aile", data.family ? `${data.family.name} · ${familyRoleText[data.family.role] ?? data.family.role} · Lv ${data.family.level}` : "—"],
            ["CP eşi", u.cpPartner ? <Link key="cp" className="text-[#e5c77e] hover:underline" href={`/admin/user/?id=${u.cpPartner.id}`}>{u.cpPartner.displayName || u.cpPartner.username}</Link> : "—"],
            [
              "Yayıncılık",
              data.broadcaster
                ? `${hostStatusText[data.broadcaster.status] ?? data.broadcaster.status}${data.broadcaster.agency ? ` · ${data.broadcaster.agency.name}` : " · ajanssız"}`
                : "Yayıncı değil",
            ],
            ["Yayıncı başvurusu", data.broadcaster?.appliedAt ? fmtDate(data.broadcaster.appliedAt) : "—"],
            [
              "Sahibi olduğu ajans",
              data.agencyOwned ? `${data.agencyOwned.name}${data.agencyOwned.agencyCode ? ` · Kod ${data.agencyOwned.agencyCode}` : ""} · ${data.agencyOwned.status}` : "—",
            ],
            ["Asistanlık", data.assistantOf ? `${data.assistantOf.name} · ${data.assistantOf.status === "active" ? "aktif" : "bekliyor"}` : "—"],
            ["WIP", u.wip ? `${wipName(u.wip.level)} · bitiş ${fmtDate(u.wip.expiresAt, false)}` : "—"],
            ["Yayıncı rozeti", u.hostBadge ? `${u.hostBadge.badge} · bitiş ${fmtDate(u.hostBadge.expiresAt, false)}` : "—"],
          ]}
        />
      </Card>

      <Card title="Odalar">
        <p className="mb-2 text-xs font-medium text-gray-500">Şu an bulunduğu oda</p>
        {data.currentRooms.length === 0 ? (
          <p className="mb-4 text-sm text-gray-500">Bir odada değil.</p>
        ) : (
          <ul className="mb-4 space-y-2">
            {data.currentRooms.map((r) => (
              <li key={r.id}>
                <Link href={roomHref(r.id)} className="flex items-center justify-between gap-3 rounded-xl border border-[#262117] bg-[#141210] px-4 py-3 text-sm hover:border-[#4b3c22]">
                  <span className="truncate text-white">{r.name}</span>
                  <span className="shrink-0 text-xs text-gray-400">
                    {r.role === "owner" ? "Sahibi" : r.role} {r.microphone ? "· mikrofonda" : ""} · {fmtRel(r.joinedAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="mb-2 text-xs font-medium text-gray-500">Açtığı son odalar</p>
        {data.ownedRooms.length === 0 ? (
          <p className="text-sm text-gray-500">Oda açmamış.</p>
        ) : (
          <ul className="space-y-2">
            {data.ownedRooms.map((r) => (
              <li key={r.id}>
                <Link href={roomHref(r.id)} className="flex items-center justify-between gap-3 rounded-xl border border-[#262117] bg-[#141210] px-4 py-3 text-sm hover:border-[#4b3c22]">
                  <span className="truncate text-white">
                    {r.name} <span className="text-xs text-gray-500">{r.roomType === "video" ? "· Görüntülü" : "· Sesli"}</span>
                  </span>
                  <span className="shrink-0 text-xs">{r.isActive ? <span className="text-emerald-300">Açık</span> : <span className="text-gray-500">Kapandı {fmtRel(r.closedAt)}</span>}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Inventory({ data }: { data: Detail }) {
  const u = data.user;
  return (
    <div className="space-y-6">
      <Card title="Ayrıcalıklar">
        <KV
          cols={3}
          items={[
            ["WIP", u.wip ? `${wipName(u.wip.level)} · ${fmtDate(u.wip.startsAt, false)} → ${fmtDate(u.wip.expiresAt, false)}` : "Yok"],
            ["Özel ID", u.specialId ? `${u.specialId.value} · bitiş ${fmtDate(u.specialId.expiresAt, false)}` : "Yok"],
            ["Yayıncı rozeti", u.hostBadge ? `${u.hostBadge.badge} · bitiş ${fmtDate(u.hostBadge.expiresAt, false)}` : "Yok"],
          ]}
        />
        <p className="mt-3 text-xs text-gray-500">Vermek / kaldırmak için İşlemler sekmesini kullanın.</p>
      </Card>
      <Card title="Envanter" subtitle={`${data.inventory.length} aktif öğe`}>
        {data.inventory.length === 0 ? (
          <Empty title="Envanter boş" />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {data.inventory.map((i) => (
              <div key={i.id} className="rounded-xl border border-[#262117] bg-[#141210] px-4 py-3">
                <p className="truncate text-sm font-medium text-white">{i.itemName}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {itemTypeText[i.itemType] ?? i.itemType}
                  {i.quantity > 1 ? ` · ${i.quantity} adet` : ""} · {i.expiresAt ? `bitiş ${fmtDate(i.expiresAt, false)}` : "süresiz"}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function Reports({ data }: { data: Detail }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card title="Hakkındaki şikâyetler" subtitle={`Toplam ${data.stats.reportsAgainst} · yaptığı şikâyet ${data.stats.reportsMade}`}>
        {data.reports.length === 0 ? (
          <Empty title="Şikâyet yok" />
        ) : (
          <ul className="space-y-2">
            {data.reports.map((r) => (
              <li key={r.id} className="rounded-xl border border-[#262117] bg-[#141210] p-4 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={r.status === "open" ? "red" : "gray"}>{r.status === "open" ? "Açık" : r.status === "resolved" ? "Çözüldü" : "Reddedildi"}</Badge>
                  <span className="font-medium text-white">{reportReasonText[r.reason] ?? r.reason}</span>
                  <span className="text-xs text-gray-500">{reportKindText[r.kind] ?? r.kind}</span>
                </div>
                {r.details && <p className="mt-2 text-gray-300">{r.details}</p>}
                <p className="mt-2 text-xs text-gray-500">
                  Şikâyet eden:{" "}
                  <Link className="text-[#e5c77e] hover:underline" href={`/admin/user/?id=${r.reporter.id}`}>
                    @{r.reporter.username}
                  </Link>{" "}
                  · {fmtDate(r.createdAt)}
                  {r.note ? ` · Not: ${r.note}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
        {data.viewer.full && (
          <Link href="/admin/reports" className="mt-4 inline-flex text-sm text-[#d7b56d] hover:underline">
            Şikâyetler sayfasında karara bağla →
          </Link>
        )}
      </Card>
      <Card title="Otomatik moderasyon ihlalleri" subtitle={`Toplam ${data.stats.strikes}`}>
        {data.strikes.length === 0 ? (
          <Empty title="İhlal yok" />
        ) : (
          <ul className="space-y-2">
            {data.strikes.map((x) => (
              <li key={x.id} className="rounded-xl border border-[#262117] bg-[#141210] p-4 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <ShieldAlert size={15} className="text-red-300" />
                  <span className="font-medium text-white">{strikeKindText[x.kind] ?? x.kind}</span>
                  <span className="text-xs text-gray-500">{x.context}</span>
                </div>
                {x.sample && <p className="mt-2 break-words text-gray-300">“{x.sample}”</p>}
                <p className="mt-1 text-xs text-gray-500">{fmtDate(x.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

