"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Mic, Radio, Search, Trash2, UserMinus, Users, XCircle } from "lucide-react";
import { api, fmtDate, fmtNumber } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { Badge, Card, Empty, ErrorBox, Loading, PageHeader, StatCard, inputCls, tableCls, tableWrap, tdCls, thCls } from "@/components/ui";
import { ActionMsg, Pager, Tabs, UserLink, btnDanger, btnSmall, fmtRel, reportReasonText, roomHref, useAction, useQueryValue, type Brief } from "./kit";

type RoomRow = {
  id: string;
  name: string;
  roomType: string;
  seatCount: number;
  isActive: boolean;
  isHidden: boolean;
  locked: boolean;
  roomNumber: string | null;
  createdAt: string;
  closedAt: string | null;
  tags: string[];
  members: number;
  onMic: number;
  owner: Brief | null;
};

export default function AdminRooms() {
  const router = useRouter();
  const [status, setStatus] = useState<"active" | "closed" | "all">("active");
  const [type, setType] = useState("");
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState("");
  const [page, setPage] = useState(1);
  const path = useMemo(() => {
    const p = new URLSearchParams({ status, page: String(page) });
    if (q) p.set("q", q);
    if (type) p.set("type", type);
    return `/api/admin/rooms?${p.toString()}`;
  }, [status, type, q, page]);
  const { data, error, loading, reload } = useApi<{ page: number; pages: number; total: number; rooms: RoomRow[] }>(path);

  const search = (e: FormEvent) => {
    e.preventDefault();
    setQ(draft.trim().toLowerCase());
    setPage(1);
  };

  return (
    <div>
      <PageHeader
        icon={<Radio size={18} />}
        kicker="Canlı yayın"
        title="Odalar"
        description="Açık ve kapanmış odalar. Odaya tıklayınca içindekiler, sohbet, hediyeler ve şikâyetler görünür; oda kapatılabilir."
        action={
          <button type="button" onClick={reload} className="rounded-xl border border-[#4b3c22] bg-[#17140e] px-4 py-2 text-sm text-[#d7b56d] hover:bg-[#211a0f]">
            Yenile
          </button>
        }
      />
      <Tabs
        tabs={[
          { key: "active", label: "Açık odalar" },
          { key: "closed", label: "Kapanmış" },
          { key: "all", label: "Tümü" },
        ]}
        value={status}
        onChange={(k) => {
          setStatus(k);
          setPage(1);
        }}
      />
      <Card>
        <form onSubmit={search} className="mb-4 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Oda adı, oda numarası, sahibin kullanıcı adı veya ID'si" className={`${inputCls} pl-10`} aria-label="Oda ara" />
          </div>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-[#30291e] bg-[#171717] px-3 py-2.5 text-sm text-white"
            aria-label="Oda türü"
          >
            <option value="">Tüm türler</option>
            <option value="audio">Sesli</option>
            <option value="video">Görüntülü</option>
          </select>
          <button type="submit" className="gold-button shrink-0 px-6">
            Ara
          </button>
        </form>
        {loading && !data && <Loading />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {data && data.rooms.length === 0 && <Empty title="Oda yok" />}
        {data && data.rooms.length > 0 && (
          <div className={`${tableWrap} ${loading ? "opacity-60" : ""}`}>
            <table className={`${tableCls} min-w-[820px]`}>
              <thead>
                <tr>
                  <th className={thCls}>Oda</th>
                  <th className={thCls}>Sahibi</th>
                  <th className={thCls}>İçeride</th>
                  <th className={thCls}>Durum</th>
                  <th className={thCls}>Açılış</th>
                </tr>
              </thead>
              <tbody>
                {data.rooms.map((r) => (
                  <tr key={r.id} className="cursor-pointer hover:bg-[#15120c]" onClick={() => router.push(roomHref(r.id))}>
                    <td className={tdCls}>
                      <Link href={roomHref(r.id)} onClick={(e) => e.stopPropagation()} className="font-medium text-white hover:text-[#e5c77e]">
                        {r.name}
                      </Link>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
                        {r.roomType === "video" ? "Görüntülü" : "Sesli"} · {r.seatCount} koltuk{r.roomNumber ? ` · No ${r.roomNumber}` : ""}
                        {r.locked && <Lock size={12} />}
                      </p>
                    </td>
                    <td className={tdCls} onClick={(e) => e.stopPropagation()}>
                      <UserLink user={r.owner} size={28} />
                    </td>
                    <td className={tdCls}>
                      <span className="inline-flex items-center gap-3 text-sm">
                        <span className="inline-flex items-center gap-1">
                          <Users size={14} className="text-gray-500" />
                          {r.members}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Mic size={14} className="text-gray-500" />
                          {r.onMic}
                        </span>
                      </span>
                    </td>
                    <td className={tdCls}>
                      <div className="flex flex-wrap gap-1">
                        {r.isActive ? <Badge tone="green">Açık</Badge> : <Badge tone="gray">Kapandı {fmtRel(r.closedAt)}</Badge>}
                        {r.isHidden && <Badge tone="gray">Gizli</Badge>}
                      </div>
                    </td>
                    <td className={`${tdCls} whitespace-nowrap text-xs text-gray-400`}>{fmtDate(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && <Pager page={data.page} pages={data.pages} total={data.total} onPage={setPage} />}
      </Card>
    </div>
  );
}

type RoomDetail = {
  room: {
    id: string;
    name: string;
    roomType: string;
    seatCount: number;
    isActive: boolean;
    isHidden: boolean;
    locked: boolean;
    roomNumber: string | null;
    createdAt: string;
    closedAt: string | null;
    tags: string[];
    announcement: string | null;
    chatEnabled: boolean;
    owner: Brief | null;
  };
  members: { role: string; microphone: boolean; seatIndex: number | null; joinedAt: string; ghost: boolean; chatMutedUntil: string | null; systemRole: string; user: Brief | null }[];
  messages: { id: string; text: string; deleted: boolean; createdAt: string; user: Brief | null }[];
  gifts: { count: number; coins: string; topSenders: { coins: string; user: Brief | null }[] };
  reports: { id: string; kind: string; reason: string; details: string | null; status: string; createdAt: string; reporter: string }[];
};

const memberRole: Record<string, string> = { owner: "Sahibi", cohost: "Yardımcı sahip", moderator: "Moderatör", user: "Dinleyici" };

export function AdminRoomDetail() {
  const id = useQueryValue("id");
  if (!id) return <ErrorBox message="Oda seçilmedi. Odalar listesinden birini açın." />;
  return <RoomDetailView key={id} id={id} />;
}

function RoomDetailView({ id }: { id: string }) {
  const { data, error, loading, reload } = useApi<RoomDetail>(`/api/admin/rooms/${encodeURIComponent(id)}/detail`);
  const { busy, msg, run } = useAction();
  const [reason, setReason] = useState("");

  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorBox message={error} onRetry={reload} />;
  if (!data) return null;
  const r = data.room;

  const close = () =>
    run("Oda kapatıldı.", async () => {
      if (!window.confirm(`"${r.name}" odası kapatılsın mı? İçerideki herkes çıkarılır.`)) return false;
      await api(`/api/admin/rooms/${r.id}/close`, { method: "POST", body: { reason: reason.trim() || null } });
      reload();
    });
  const kick = (u: Brief, role: string) =>
    run(`${u.displayName || u.username} odadan çıkarıldı.`, async () => {
      // Oda, içeride son yönetici (sahip / yardımcı sahip / moderatör) kalmayınca kapanır.
      const staffLeft = data.members.filter((m) => m.user?.id !== u.id && ["owner", "cohost", "moderator"].includes(m.role)).length;
      const warn = role !== "user" && staffLeft === 0 ? "\n\nOdada başka yönetici kalmadığı için ODA KAPANACAK." : "";
      if (!window.confirm(`${u.displayName || u.username} odadan çıkarılsın mı?${warn}`)) return false;
      await api(`/api/admin/rooms/${r.id}/members/${u.id}/kick`, { method: "POST", body: {} });
      reload();
    });
  const delMsg = (m: { id: string }) =>
    run("Mesaj silindi.", async () => {
      await api(`/api/admin/rooms/${r.id}/messages/${m.id}/delete`, { method: "POST", body: {} });
      reload();
    });

  return (
    <div>
      <Link href="/admin/rooms" className="mb-4 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
        <ArrowLeft size={16} /> Odalar
      </Link>
      <PageHeader
        icon={<Radio size={18} />}
        kicker={`${r.roomType === "video" ? "Görüntülü" : "Sesli"} oda · ${r.seatCount} koltuk${r.roomNumber ? ` · No ${r.roomNumber}` : ""}`}
        title={r.name}
        description={r.isActive ? `Açık · ${fmtRel(r.createdAt)} açıldı` : `Kapandı · ${fmtDate(r.closedAt)}`}
        action={
          <button type="button" onClick={reload} className="rounded-xl border border-[#4b3c22] bg-[#17140e] px-4 py-2 text-sm text-[#d7b56d] hover:bg-[#211a0f]">
            Yenile
          </button>
        }
      />
      <ActionMsg msg={msg} />
      <div className="my-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="İçeride" value={data.members.length} icon={<Users size={18} />} note={`Mikrofonda: ${data.members.filter((m) => m.microphone).length}`} />
        <StatCard label="Bu oturumda hediye" value={fmtNumber(data.gifts.count)} note={`${fmtNumber(data.gifts.coins)} Coin`} tone="green" />
        <StatCard label="Şikâyet" value={data.reports.length} tone={data.reports.some((x) => x.status === "open") ? "red" : "gold"} note={`Açık: ${data.reports.filter((x) => x.status === "open").length}`} />
        <StatCard label="Sahibi" value={<UserLink user={r.owner} size={30} />} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card title="İçerideki kişiler" subtitle="Gizli (SWIP) dinleyiciler de listelenir">
            {data.members.length === 0 ? (
              <Empty title="Oda boş" />
            ) : (
              <ul className="space-y-2">
                {data.members.map((m) => (
                  <li key={m.user?.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#262117] bg-[#141210] px-3 py-2">
                    <UserLink
                      user={m.user}
                      size={30}
                      sub={
                        <>
                          {memberRole[m.role] ?? m.role}
                          {m.microphone ? ` · mikrofon ${m.seatIndex !== null ? m.seatIndex + 1 : ""}` : ""}
                          {m.ghost ? " · gizli" : ""} · {fmtRel(m.joinedAt)}
                        </>
                      }
                    />
                    {r.isActive && m.user && m.systemRole !== "admin" && m.role !== "owner" && (
                      <button type="button" disabled={busy} onClick={() => kick(m.user!, m.role)} className={btnSmall}>
                        <UserMinus size={13} /> Çıkar
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="Oda sohbeti" subtitle="Son 100 mesaj, en yeni üstte">
            {r.announcement && <p className="mb-3 rounded-xl border border-[#262117] bg-[#141210] p-3 text-sm text-gray-300">Duyuru: {r.announcement}</p>}
            {data.messages.length === 0 ? (
              <Empty title="Mesaj yok" />
            ) : (
              <ul className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
                {data.messages.map((m) => (
                  <li key={m.id} className={`rounded-xl border border-[#262117] px-3 py-2 ${m.deleted ? "opacity-50" : "bg-[#141210]"}`}>
                    <div className="flex items-center justify-between gap-2">
                      <UserLink user={m.user} size={22} sub={fmtDate(m.createdAt)} />
                      {!m.deleted ? (
                        <button type="button" disabled={busy} onClick={() => delMsg(m)} className={btnSmall} aria-label="Mesajı sil">
                          <Trash2 size={13} />
                        </button>
                      ) : (
                        <Badge tone="gray">Silindi</Badge>
                      )}
                    </div>
                    <p className="mt-1.5 whitespace-pre-wrap break-words text-sm text-gray-200">{m.text}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {r.isActive && (
            <Card title="Odayı kapat">
              <div className="space-y-3">
                <input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} placeholder="Neden (kayda geçer)" className={inputCls} aria-label="Kapatma nedeni" />
                <button type="button" disabled={busy} onClick={close} className={`${btnDanger} w-full`}>
                  <XCircle size={16} /> Odayı kapat
                </button>
                <p className="text-xs text-gray-500">İçerideki herkes çıkarılır, sahibi yeniden açabilir. Kalıcı engel için sahibini banlayın.</p>
              </div>
            </Card>
          )}
          <Card title="En çok hediye gönderenler" subtitle="Bu oda oturumunda">
            {data.gifts.topSenders.length === 0 ? (
              <Empty title="Hediye yok" />
            ) : (
              <ol className="space-y-2">
                {data.gifts.topSenders.map((t, i) => (
                  <li key={t.user?.id ?? i} className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="w-5 text-right text-xs text-gray-500">{i + 1}</span>
                      <UserLink user={t.user} size={28} />
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-[#e5c77e]">{fmtNumber(t.coins)}</span>
                  </li>
                ))}
              </ol>
            )}
          </Card>
          <Card title="Oda hakkındaki şikâyetler">
            {data.reports.length === 0 ? (
              <Empty title="Şikâyet yok" />
            ) : (
              <ul className="space-y-2">
                {data.reports.map((x) => (
                  <li key={x.id} className="rounded-xl border border-[#262117] bg-[#141210] p-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={x.status === "open" ? "red" : "gray"}>{x.status === "open" ? "Açık" : "Kapandı"}</Badge>
                      <span className="text-white">{reportReasonText[x.reason] ?? x.reason}</span>
                    </div>
                    {x.details && <p className="mt-1 text-gray-300">{x.details}</p>}
                    <p className="mt-1 text-xs text-gray-500">
                      @{x.reporter} · {fmtDate(x.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
