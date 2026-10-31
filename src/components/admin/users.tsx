"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, X } from "lucide-react";
import { fmtDate, fmtNumber } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { Badge, Card, Empty, ErrorBox, Loading, PageHeader, inputCls, tableCls, tableWrap, tdCls, thCls } from "@/components/ui";
import { Pager, StatusBadge, UserLink, fmtRel, isFullAdmin, roleText, selectCls, userHref } from "./kit";

export type ListUser = {
  id: string;
  publicId: string | null;
  specialId: string | null;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  systemRole: string;
  accountStatus: string;
  bannedUntil: string | null;
  chatRestrictedUntil: string | null;
  createdAt: string;
  lastSeenAt: string | null;
  online: boolean;
  country: string | null;
  gender: string | null;
  coinLevel: number;
  giftLevel: number;
  wipLevel: number | null;
  broadcasterStatus: string | null;
  agencyName: string | null;
  coins?: string;
  diamonds?: string;
  totalSentCoins?: string;
  totalReceivedDiamonds?: string;
  kycStatus?: string;
};

type ListResp = {
  page: number;
  pages: number;
  total: number;
  counts: { all: number; active: number; banned: number; deleted: number; staff: number; recent: number; new24h: number };
  users: ListUser[];
};

const wipName = (l: number) => (l >= 11 ? "SWIP" : `WIP ${l}`);

type Filters = { q: string; status: string; role: string; sort: string; gender: string; wip: boolean; broadcaster: boolean; recent: boolean; restricted: boolean; joined: boolean };
const EMPTY: Filters = { q: "", status: "", role: "", sort: "new", gender: "", wip: false, broadcaster: false, recent: false, restricted: false, joined: false };

export default function AdminUsers() {
  const router = useRouter();
  const full = isFullAdmin();
  const [f, setF] = useState<Filters>(EMPTY);
  const [draft, setDraft] = useState("");
  const [page, setPage] = useState(1);

  const path = useMemo(() => {
    const p = new URLSearchParams({ page: String(page), sort: f.sort });
    if (f.q) p.set("q", f.q);
    if (f.status) p.set("status", f.status);
    if (f.role) p.set("role", f.role);
    if (f.gender) p.set("gender", f.gender);
    if (f.wip) p.set("wip", "1");
    if (f.broadcaster) p.set("broadcaster", "1");
    if (f.recent) p.set("recent", "1");
    if (f.restricted) p.set("restricted", "1");
    if (f.joined) p.set("joined", "1");
    return `/api/admin/users/list?${p.toString()}`;
  }, [f, page]);
  const { data, error, loading, reload } = useApi<ListResp>(path);

  // Filtre değişince ilk sayfaya dönülür.
  const set = (patch: Partial<Filters>) => {
    setF((x) => ({ ...x, ...patch }));
    setPage(1);
  };
  const search = (e: FormEvent) => {
    e.preventDefault();
    set({ q: draft.trim() });
  };
  const filtered = JSON.stringify(f) !== JSON.stringify(EMPTY);
  const c = data?.counts;

  const chip = (label: string, value: number | undefined, active: boolean, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-2 text-left transition ${active ? "border-[#8c713d] bg-[#292114]" : "border-[#2a241a] bg-[#111] hover:border-[#4b3c22]"}`}
    >
      <span className="block text-[11px] text-gray-500">{label}</span>
      <span className="block text-base font-bold text-white">{value === undefined ? "—" : fmtNumber(value)}</span>
    </button>
  );

  return (
    <div>
      <PageHeader
        icon={<Users size={18} />}
        kicker="Kullanıcı yönetimi"
        title="Kullanıcılar"
        description={
          full
            ? "Tüm üyeler. Bir kullanıcıya tıklayınca profil, bakiye, hediye, cihaz, şikâyet ve tüm işlemler açılır."
            : "Tüm üyeler. Bir kullanıcıya tıklayınca profil, şikâyetler ve yetkinizdeki işlemler (ban, sohbet kısıtı, ad / fotoğraf) açılır."
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
        {chip("Toplam", c?.all, !f.status && !f.role && !f.recent && !f.joined, () => set({ status: "", role: "", recent: false, joined: false }))}
        {chip("Aktif", c?.active, f.status === "active", () => set({ status: "active", role: "" }))}
        {chip("Banlı", c?.banned, f.status === "banned", () => set({ status: "banned", role: "" }))}
        {chip("Silinmiş", c?.deleted, f.status === "deleted", () => set({ status: "deleted", role: "" }))}
        {chip("Yetkili", c?.staff, f.role === "staff", () => set({ role: "staff", status: "" }))}
        {chip("Son 24 sa aktif", c?.recent, f.recent, () => set({ recent: !f.recent }))}
        {chip("Son 24 sa yeni üye", c?.new24h, f.joined, () => set({ joined: !f.joined }))}
      </div>

      <Card>
        <div className="space-y-3">
          <form onSubmit={search} className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={full ? "Kullanıcı adı, görünen ad, ID, özel ID veya telefon" : "Kullanıcı adı, görünen ad veya ID"}
                aria-label="Kullanıcı ara"
                className={`${inputCls} pl-10`}
              />
            </div>
            <button type="submit" className="gold-button shrink-0 px-6">
              Ara
            </button>
          </form>
          <div className="flex flex-wrap items-center gap-2">
            <select value={f.status} onChange={(e) => set({ status: e.target.value })} className={selectCls} aria-label="Durum">
              <option value="">Tüm durumlar</option>
              <option value="active">Aktif</option>
              <option value="banned">Banlı</option>
              <option value="deleted">Silinmiş</option>
            </select>
            <select value={f.role} onChange={(e) => set({ role: e.target.value })} className={selectCls} aria-label="Rol">
              <option value="">Tüm roller</option>
              <option value="user">Kullanıcı</option>
              <option value="support">Yardımcı admin</option>
              <option value="admin">Yönetici</option>
              <option value="staff">Tüm yetkililer</option>
            </select>
            <select value={f.gender} onChange={(e) => set({ gender: e.target.value })} className={selectCls} aria-label="Cinsiyet">
              <option value="">Tüm cinsiyetler</option>
              <option value="female">Kadın</option>
              <option value="male">Erkek</option>
            </select>
            <select value={f.sort} onChange={(e) => set({ sort: e.target.value })} className={selectCls} aria-label="Sıralama">
              <option value="new">En yeni üye</option>
              <option value="old">En eski üye</option>
              <option value="seen">Son görülen</option>
              {full && <option value="coins">En çok Coin</option>}
              {full && <option value="diamonds">En çok Elmas</option>}
              {full && <option value="spent">En çok harcayan</option>}
              {full && <option value="received">En çok kazanan</option>}
              <option value="name">Kullanıcı adı (A-Z)</option>
            </select>
            {(
              [
                ["wip", "WIP üyeleri"],
                ["broadcaster", "Yayıncılar"],
                ["restricted", "Sohbeti kısıtlı"],
              ] as const
            ).map(([k, label]) => (
              <label key={k} className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#30291e] px-3 py-2 text-sm text-gray-300">
                <input type="checkbox" checked={f[k]} onChange={(e) => set({ [k]: e.target.checked } as Partial<Filters>)} className="accent-[#d7b56d]" />
                {label}
              </label>
            ))}
            {filtered && (
              <button
                type="button"
                onClick={() => {
                  setF(EMPTY);
                  setPage(1);
                  setDraft("");
                }}
                className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm text-gray-400 hover:text-white"
              >
                <X size={15} /> Filtreleri temizle
              </button>
            )}
          </div>
        </div>
      </Card>

      <div className="mt-5">
        <Card>
          {loading && !data && <Loading />}
          {error && <ErrorBox message={error} onRetry={reload} />}
          {data && data.users.length === 0 && <Empty title="Kullanıcı bulunamadı" note={filtered ? "Filtreleri değiştirmeyi deneyin." : undefined} />}
          {data && data.users.length > 0 && (
            <div className={`${tableWrap} ${loading ? "opacity-60" : ""}`}>
              <table className={`${tableCls} min-w-[900px]`}>
                <thead>
                  <tr>
                    <th className={thCls}>Kullanıcı</th>
                    <th className={thCls}>Durum</th>
                    <th className={thCls}>Seviye</th>
                    {full && <th className={`${thCls} text-right`}>Coin</th>}
                    {full && <th className={`${thCls} text-right`}>Elmas</th>}
                    <th className={thCls}>Üyelik</th>
                    <th className={thCls}>Son görülme</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((u) => (
                    <tr key={u.id} onClick={() => router.push(userHref(u.id))} className="cursor-pointer hover:bg-[#15120c]">
                      <td className={tdCls}>
                        <div onClick={(e) => e.stopPropagation()}>
                          <UserLink
                            user={u}
                            sub={
                              <>
                                @{u.username}
                                {u.publicId ? ` · ID ${u.publicId}` : ""}
                                {u.specialId ? ` · Özel ${u.specialId}` : ""}
                              </>
                            }
                          />
                        </div>
                      </td>
                      <td className={tdCls}>
                        <div className="flex flex-wrap gap-1">
                          <StatusBadge status={u.accountStatus} bannedUntil={u.bannedUntil} />
                          {u.systemRole !== "user" && <Badge tone="blue">{roleText[u.systemRole] ?? u.systemRole}</Badge>}
                          {u.chatRestrictedUntil && <Badge tone="red">Sohbet kısıtlı</Badge>}
                        </div>
                      </td>
                      <td className={tdCls}>
                        <div className="flex flex-wrap gap-1">
                          <Badge tone="gray">Lv {u.coinLevel ?? 0}</Badge>
                          {u.wipLevel ? <Badge>{wipName(u.wipLevel)}</Badge> : null}
                          {u.broadcasterStatus === "approved" && <Badge tone="green">Yayıncı{u.agencyName ? ` · ${u.agencyName}` : ""}</Badge>}
                        </div>
                      </td>
                      {full && <td className={`${tdCls} text-right font-medium`}>{fmtNumber(u.coins)}</td>}
                      {full && <td className={`${tdCls} text-right font-medium`}>{fmtNumber(u.diamonds)}</td>}
                      <td className={`${tdCls} whitespace-nowrap text-xs text-gray-400`}>{fmtDate(u.createdAt, false)}</td>
                      <td className={`${tdCls} whitespace-nowrap text-xs`}>
                        {u.online ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-300">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Çevrimiçi
                          </span>
                        ) : (
                          <span className="text-gray-400">{fmtRel(u.lastSeenAt)}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {data && <Pager page={data.page} pages={data.pages} total={data.total} onPage={setPage} />}
        </Card>
      </div>
    </div>
  );
}
