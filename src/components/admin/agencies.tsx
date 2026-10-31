"use client";

import { useState } from "react";
import { Building2, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { api, fmtDate } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { Badge, Card, Empty, ErrorBox, Loading, PageHeader, inputCls, tableCls, tableWrap, tdCls, thCls } from "@/components/ui";
import { UserPicker, type AdminUser } from "./user-picker";
import { ActionMsg, Field, Tabs, UserLink, agencyStatusText, btnDangerOutline, btnGhost, btnOk, btnSmall, fmtRel, hostStatusText, selectCls, useAction } from "./kit";

type Agency = {
  id: string;
  name: string;
  ownerId: string;
  ownerUsername: string;
  status: string;
  commissionBps: number;
  overrideBps: number | null;
  agencyCode: string | null;
  broadcasterCount: number;
  assistantCount: number;
  createdAt: string;
  referrer: { id: string; name: string; agencyCode: string | null } | null;
};

const pct = (bps: number | null | undefined) => (bps === null || bps === undefined ? "—" : `%${(bps / 100).toLocaleString("tr-TR", { maximumFractionDigits: 2 })}`);

type TabKey = "agencies" | "hosts" | "applications" | "transfers";

export default function AdminAgencies() {
  const pending = useApi<{ transfers?: number; applications?: number; broadcasters?: number }>("/api/admin/overview/pending");
  const [tab, setTab] = useState<TabKey>("agencies");
  return (
    <div>
      <PageHeader icon={<Building2 size={18} />} kicker="Ajans sistemi" title="Ajanslar ve yayıncılar" description="Ajans açın, durum ve komisyonu yönetin; yayıncı başvurularını, ajans önerilerini ve transferleri karara bağlayın." />
      <Tabs
        tabs={[
          { key: "agencies", label: "Ajanslar" },
          { key: "hosts", label: "Yayıncılar", count: pending.data?.broadcasters },
          { key: "applications", label: "Ajans başvuruları", count: pending.data?.applications },
          { key: "transfers", label: "Transferler", count: pending.data?.transfers },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === "agencies" && <AgencyList />}
      {tab === "hosts" && <Hosts onChanged={pending.reload} />}
      {tab === "applications" && <Applications onChanged={pending.reload} />}
      {tab === "transfers" && <Transfers onChanged={pending.reload} />}
    </div>
  );
}

function AgencyList() {
  const [status, setStatus] = useState("");
  const { data, error, loading, reload } = useApi<{ agencies: Agency[] }>(`/api/admin/agencies${status ? `?status=${status}` : ""}`);
  const [open, setOpen] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  return (
    <div className="space-y-6">
      <Card
        title="Ajanslar"
        subtitle={data ? `${data.agencies.length} ajans` : undefined}
        action={
          <div className="flex flex-wrap gap-2">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls} aria-label="Durum">
              <option value="">Tüm durumlar</option>
              <option value="active">Aktif</option>
              <option value="suspended">Askıda</option>
              <option value="pending">Bekliyor</option>
              <option value="rejected">Reddedildi</option>
            </select>
            <button type="button" onClick={() => setCreating((v) => !v)} className={btnGhost}>
              <Plus size={15} /> Ajans aç
            </button>
          </div>
        }
      >
        {creating && (
          <CreateAgency
            onDone={() => {
              setCreating(false);
              reload();
            }}
          />
        )}
        {loading && !data && <Loading />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {data && data.agencies.length === 0 && <Empty title="Ajans yok" />}
        {data && data.agencies.length > 0 && (
          <div className={tableWrap}>
            <table className={`${tableCls} min-w-[880px]`}>
              <thead>
                <tr>
                  <th className={thCls}>Ajans</th>
                  <th className={thCls}>Sahibi</th>
                  <th className={thCls}>Yayıncı / asistan</th>
                  <th className={thCls}>Komisyon</th>
                  <th className={thCls}>Durum</th>
                  <th className={thCls} />
                </tr>
              </thead>
              <tbody>
                {data.agencies.map((a) => (
                  <AgencyRow key={a.id} a={a} open={open === a.id} onToggle={() => setOpen(open === a.id ? null : a.id)} onChanged={reload} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function AgencyRow({ a, open, onToggle, onChanged }: { a: Agency; open: boolean; onToggle: () => void; onChanged: () => void }) {
  const [status, setStatus] = useState(a.status);
  const [bps, setBps] = useState(String(a.commissionBps));
  const [override, setOverride] = useState(a.overrideBps === null ? "" : String(a.overrideBps));
  const [ref, setRef] = useState(a.referrer?.agencyCode ?? "");
  const { busy, msg, run } = useAction();
  return (
    <>
      <tr className="cursor-pointer hover:bg-[#15120c]" onClick={onToggle}>
        <td className={tdCls}>
          <p className="font-medium text-white">{a.name}</p>
          <p className="text-xs text-gray-500">
            {a.agencyCode ? `Kod ${a.agencyCode} · ` : ""}
            {fmtDate(a.createdAt, false)}
            {a.referrer ? ` · Davet: ${a.referrer.name}` : ""}
          </p>
        </td>
        <td className={tdCls} onClick={(e) => e.stopPropagation()}>
          <UserLink user={{ id: a.ownerId, username: a.ownerUsername }} size={26} />
        </td>
        <td className={tdCls}>
          {a.broadcasterCount} / {a.assistantCount}
        </td>
        <td className={tdCls}>
          {pct(a.commissionBps)}
          {a.overrideBps !== null && <span className="ml-1 text-xs text-[#e5c77e]">(özel {pct(a.overrideBps)})</span>}
        </td>
        <td className={tdCls}>
          <Badge tone={a.status === "active" ? "green" : a.status === "suspended" ? "red" : "gray"}>{agencyStatusText[a.status] ?? a.status}</Badge>
        </td>
        <td className={`${tdCls} text-right text-gray-500`}>{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</td>
      </tr>
      {open && (
        <tr>
          <td colSpan={6} className="border-b border-[#1f1b14] bg-[#0f0d0a] px-4 py-5">
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="space-y-2">
                <Field label="Durum ve taban komisyon (baz puan: 1000 = %10)">
                  <div className="flex gap-2">
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls} aria-label="Durum">
                      {a.status === "pending" && (
                        <option value="pending" disabled>
                          Bekliyor
                        </option>
                      )}
                      <option value="active">Aktif</option>
                      <option value="suspended">Askıda</option>
                      <option value="rejected">Reddedildi</option>
                    </select>
                    <input value={bps} onChange={(e) => setBps(e.target.value.replace(/\D/g, "").slice(0, 5))} inputMode="numeric" className={inputCls} aria-label="Komisyon" />
                  </div>
                </Field>
                <button
                  type="button"
                  disabled={busy}
                  className={btnGhost}
                  onClick={() =>
                    run("Ajans güncellendi.", async () => {
                      if (status === "pending") throw new Error("Önce durumu seçin (Aktif, Askıda ya da Reddedildi).");
                      if (!/^\d{1,5}$/.test(bps) || Number(bps) > 10000) throw new Error("Komisyon 0-10000 baz puan arasında olmalı (1000 = %10).");
                      if (status !== a.status && !window.confirm(`"${a.name}" ajansı "${agencyStatusText[status]}" yapılsın mı?`)) return false;
                      if (Number(bps) !== a.commissionBps && !window.confirm(`Taban komisyon ${pct(a.commissionBps)} → ${pct(Number(bps))} olacak. Onaylıyor musunuz?`)) return false;
                      await api(`/api/admin/agencies/${a.id}/status`, { method: "POST", body: { status, commissionBps: Number(bps) } });
                      onChanged();
                    })
                  }
                >
                  Kaydet
                </button>
              </div>
              <div className="space-y-2">
                <Field label="Özel komisyon (baz puan, boş = kademe tablosu)">
                  <input value={override} onChange={(e) => setOverride(e.target.value.replace(/\D/g, "").slice(0, 5))} inputMode="numeric" className={inputCls} placeholder="ör. 1500" />
                </Field>
                <button
                  type="button"
                  disabled={busy}
                  className={btnGhost}
                  onClick={() =>
                    run("Özel komisyon kaydedildi.", async () => {
                      await api(`/api/admin/agencies/${a.id}/commission-override`, { method: "POST", body: { bps: override === "" ? null : Number(override) } });
                      onChanged();
                    })
                  }
                >
                  Kaydet
                </button>
              </div>
              <div className="space-y-2">
                <Field label="Davet eden ajans kodu (8 hane, boş = kaldır)">
                  <input value={ref} onChange={(e) => setRef(e.target.value.replace(/\D/g, "").slice(0, 8))} inputMode="numeric" className={inputCls} />
                </Field>
                <button
                  type="button"
                  disabled={busy}
                  className={btnGhost}
                  onClick={() =>
                    run("Davet eden ajans güncellendi.", async () => {
                      await api(`/api/admin/agencies/${a.id}/referrer`, { method: "POST", body: { code: ref || null } });
                      onChanged();
                    })
                  }
                >
                  Kaydet
                </button>
              </div>
            </div>
            <div className="mt-3">
              <ActionMsg msg={msg} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function CreateAgency({ onDone }: { onDone: () => void }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [name, setName] = useState("");
  const [ref, setRef] = useState("");
  const { busy, msg, run } = useAction();
  return (
    <div className="mb-6 space-y-3 rounded-xl border border-[#4b3c22] bg-[#15120c] p-4">
      <p className="text-sm font-semibold text-[#d7b56d]">Yeni ajans</p>
      {!user ? (
        <UserPicker onPick={setUser} placeholder="Ajans sahibi olacak kişiyi arayın" />
      ) : (
        <div className="flex items-center justify-between gap-3">
          <UserLink user={user} />
          <button type="button" onClick={() => setUser(null)} className={btnSmall}>
            Değiştir
          </button>
        </div>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Ajans adı" className={inputCls} aria-label="Ajans adı" />
        <input value={ref} onChange={(e) => setRef(e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="Davet eden ajans kodu (isteğe bağlı)" className={inputCls} aria-label="Davet kodu" />
      </div>
      <button
        type="button"
        disabled={busy || !user}
        className="gold-button disabled:opacity-60 sm:w-auto"
        onClick={() =>
          run("Ajans açıldı.", async () => {
            if (name.trim().length < 3) throw new Error("Ajans adı en az 3 karakter olmalı.");
            await api("/api/admin/agencies", { method: "POST", body: { userId: user!.id, name: name.trim(), referrerCode: ref || undefined } });
            onDone();
          })
        }
      >
        Ajansı aç
      </button>
      <ActionMsg msg={msg} />
    </div>
  );
}

type Host = { userId: string; username: string; displayName: string; status: string; appliedAt: string; agencyId: string | null; agencyName: string | null };

function Hosts({ onChanged }: { onChanged: () => void }) {
  const [status, setStatus] = useState("pending");
  const { data, error, loading, reload } = useApi<{ broadcasters: Host[] }>(`/api/admin/broadcasters${status ? `?status=${status}` : ""}`);
  const { busy, msg, run } = useAction();
  const set = (h: Host, st: string) =>
    run("Yayıncı durumu güncellendi.", async () => {
      if (st !== "approved" && !window.confirm(`${h.displayName || h.username} için yayıncılık "${hostStatusText[st]}" yapılsın mı?`)) return false;
      await api(`/api/admin/broadcasters/${h.userId}/status`, { method: "POST", body: { status: st } });
      reload();
      onChanged();
    });
  return (
    <Card
      title="Yayıncılar"
      action={
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls} aria-label="Durum">
          <option value="pending">Başvuru bekleyen</option>
          <option value="approved">Onaylı</option>
          <option value="suspended">Askıda</option>
          <option value="rejected">Reddedilen</option>
          <option value="">Tümü</option>
        </select>
      }
    >
      <ActionMsg msg={msg} />
      {loading && !data && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && data.broadcasters.length === 0 && <Empty title="Kayıt yok" />}
      {data && data.broadcasters.length > 0 && (
        <div className={`${tableWrap} mt-2`}>
          <table className={tableCls}>
            <thead>
              <tr>
                <th className={thCls}>Yayıncı</th>
                <th className={thCls}>Ajans</th>
                <th className={thCls}>Durum</th>
                <th className={thCls}>Başvuru</th>
                <th className={thCls} />
              </tr>
            </thead>
            <tbody>
              {data.broadcasters.map((h) => (
                <tr key={h.userId}>
                  <td className={tdCls}>
                    <UserLink user={{ id: h.userId, username: h.username, displayName: h.displayName }} size={28} />
                  </td>
                  <td className={tdCls}>{h.agencyName ?? <span className="text-gray-500">—</span>}</td>
                  <td className={tdCls}>
                    <Badge tone={h.status === "approved" ? "green" : h.status === "pending" ? "gold" : "red"}>{hostStatusText[h.status] ?? h.status}</Badge>
                  </td>
                  <td className={`${tdCls} text-xs text-gray-400`}>{fmtRel(h.appliedAt)}</td>
                  <td className={tdCls}>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {h.status !== "approved" && (
                        <button type="button" disabled={busy} className={btnSmall} onClick={() => set(h, "approved")}>
                          Onayla
                        </button>
                      )}
                      {h.status === "pending" && (
                        <button type="button" disabled={busy} className={btnSmall} onClick={() => set(h, "rejected")}>
                          Reddet
                        </button>
                      )}
                      {h.status === "approved" && (
                        <button type="button" disabled={busy} className={btnSmall} onClick={() => set(h, "suspended")}>
                          Askıya al
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

type Application = {
  id: string;
  name: string;
  note: string | null;
  status: string;
  createdAt: string;
  decidedAt: string | null;
  user: { id: string; username: string; displayName: string; publicId: string | null };
  referrer: { id: string; name: string } | null;
  createdBy: string | null;
};

function Applications({ onChanged }: { onChanged: () => void }) {
  const [status, setStatus] = useState("pending");
  const { data, error, loading, reload } = useApi<{ applications: Application[] }>(`/api/admin/agency-applications?status=${status}`);
  return (
    <Card
      title="Ajans başvuruları"
      subtitle="Davet Merkezi'nden gelen ajans önerileri"
      action={
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls} aria-label="Durum">
          <option value="pending">Bekleyen</option>
          <option value="approved">Onaylanan</option>
          <option value="rejected">Reddedilen</option>
          <option value="all">Tümü</option>
        </select>
      }
    >
      {loading && !data && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && data.applications.length === 0 && <Empty title="Başvuru yok" />}
      {data && data.applications.length > 0 && (
        <div className="grid gap-3 lg:grid-cols-2">
          {data.applications.map((x) => (
            <ApplicationCard
              key={x.id}
              x={x}
              onDone={() => {
                reload();
                onChanged();
              }}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

function ApplicationCard({ x, onDone }: { x: Application; onDone: () => void }) {
  const [name, setName] = useState(x.name);
  const { busy, msg, run } = useAction();
  const decide = (approve: boolean) =>
    run(approve ? "Ajans açıldı." : "Başvuru reddedildi.", async () => {
      await api(`/api/admin/agency-applications/${x.id}/decide`, { method: "POST", body: { approve, name: approve && name.trim() !== x.name ? name.trim() : undefined } });
      onDone();
    });
  return (
    <div className="rounded-xl border border-[#262117] bg-[#141210] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold text-white">{x.name}</p>
        <Badge tone={x.status === "pending" ? "gold" : x.status === "approved" ? "green" : "red"}>{x.status === "pending" ? "Bekliyor" : x.status === "approved" ? "Onaylandı" : "Reddedildi"}</Badge>
      </div>
      <div className="mt-3">
        <UserLink user={x.user} size={28} />
      </div>
      <p className="mt-2 text-xs text-gray-500">
        {x.referrer ? `Öneren ajans: ${x.referrer.name} · ` : ""}
        {x.createdBy ? `Oluşturan: @${x.createdBy} · ` : ""}
        {fmtDate(x.createdAt)}
      </p>
      {x.note && <p className="mt-2 text-sm text-gray-300">{x.note}</p>}
      {x.status === "pending" && (
        <div className="mt-3 space-y-2">
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className={inputCls} aria-label="Ajans adı" />
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy} onClick={() => decide(true)} className={btnOk}>
              Onayla ve ajansı aç
            </button>
            <button type="button" disabled={busy} onClick={() => decide(false)} className={btnDangerOutline}>
              Reddet
            </button>
          </div>
          <ActionMsg msg={msg} />
        </div>
      )}
    </div>
  );
}

type Transfer = {
  id: string;
  kind: string;
  status: string;
  createdAt: string;
  autoAt: string | null;
  decidedAt: string | null;
  note: string | null;
  from: { id: string; name: string | null } | null;
  to: { id: string; name: string | null } | null;
  user?: { id: string; username: string; displayName: string; avatarUrl: string | null; publicId: string | null };
  invitedBy: { id: string; displayName: string | null } | null;
};

const transferStatus: Record<string, string> = {
  pending_source: "Eski ajans onayı bekliyor",
  pending_platform: "Platform onayı bekliyor",
  approved: "Onaylandı",
  rejected: "Reddedildi",
  cancelled: "İptal",
};
const transferKind: Record<string, string> = { join: "Ajansa katılma", leave: "Ajanstan ayrılma", transfer: "Ajans değişikliği", admin: "Platform işlemi" };

function Transfers({ onChanged }: { onChanged: () => void }) {
  const [status, setStatus] = useState("pending");
  const { data, error, loading, reload } = useApi<{ transfers: Transfer[] }>(`/api/admin/agency-transfers?status=${status}`);
  return (
    <Card
      title="Ajans transferleri"
      subtitle="Yayıncının ajans değiştirme / ayrılma istekleri"
      action={
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls} aria-label="Durum">
          <option value="pending">Bekleyen</option>
          <option value="approved">Onaylanan</option>
          <option value="rejected">Reddedilen</option>
          <option value="cancelled">İptal</option>
          <option value="all">Tümü</option>
        </select>
      }
    >
      {loading && !data && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && data.transfers.length === 0 && <Empty title="Transfer yok" />}
      {data && data.transfers.length > 0 && (
        <div className="grid gap-3 lg:grid-cols-2">
          {data.transfers.map((t) => (
            <TransferCard
              key={t.id}
              t={t}
              onDone={() => {
                reload();
                onChanged();
              }}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

function TransferCard({ t, onDone }: { t: Transfer; onDone: () => void }) {
  const [note, setNote] = useState("");
  const { busy, msg, run } = useAction();
  const pending = t.status === "pending_platform" || t.status === "pending_source";
  const decide = (approve: boolean) =>
    run(approve ? "Transfer onaylandı." : "Transfer reddedildi.", async () => {
      const r = await api<{ applied: boolean; note: string | null }>(`/api/admin/agency-transfers/${t.id}/decide`, { method: "POST", body: { approve, note: note.trim() || null } });
      if (approve && !r.applied) throw new Error(r.note || "Transfer uygulanamadı.");
      onDone();
    });
  return (
    <div className="rounded-xl border border-[#262117] bg-[#141210] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <UserLink user={t.user ?? null} size={28} />
        <Badge tone={pending ? "gold" : t.status === "approved" ? "green" : "gray"}>{transferStatus[t.status] ?? t.status}</Badge>
      </div>
      <p className="mt-3 text-sm text-gray-200">
        {t.from?.name ?? "Ajanssız"} → {t.to?.name ?? "Ajanssız"}
      </p>
      <p className="mt-1 text-xs text-gray-500">
        {transferKind[t.kind] ?? t.kind} · {fmtDate(t.createdAt)}
        {t.autoAt && pending ? ` · otomatik: ${fmtDate(t.autoAt)}` : ""}
        {t.invitedBy?.displayName ? ` · davet eden: ${t.invitedBy.displayName}` : ""}
      </p>
      {t.note && <p className="mt-2 text-sm text-gray-400">Not: {t.note}</p>}
      {pending && (
        <div className="mt-3 space-y-2">
          <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} placeholder="Not (isteğe bağlı)" className={inputCls} aria-label="Not" />
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy} onClick={() => decide(true)} className={btnOk}>
              Onayla
            </button>
            <button type="button" disabled={busy} onClick={() => decide(false)} className={btnDangerOutline}>
              Reddet
            </button>
          </div>
          <ActionMsg msg={msg} />
        </div>
      )}
    </div>
  );
}
