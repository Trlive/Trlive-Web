"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Banknote, CheckCheck } from "lucide-react";
import { api, fmtDate, fmtDuration, fmtMoney, fmtNumber } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { Badge, Card, Empty, ErrorBox, Loading, PageHeader, StatCard, inputCls, tableCls, tableWrap, tdCls, thCls } from "@/components/ui";
import { ActionMsg, Tabs, UserLink, btnDangerOutline, btnGhost, btnSmall, kycText, useAction, useQueryValue } from "./kit";

type Period = {
  id: string;
  periodKey: string;
  cycle: string;
  startsAt: string;
  endsAt: string;
  closedAt: string;
  hosts: number;
  pendingHosts: number;
  totalSalaryCents: string;
  paidSalaryCents: string;
  agencies: number;
  pendingAgencies: number;
  totalOwnerCents: string;
  assistants: number;
  pendingAssistants: number;
  totalAssistantCents: string;
  referrals: number;
  pendingReferrals: number;
  totalReferralCents: string;
};

export const payoutHref = (id: string) => `/admin/payout/?id=${encodeURIComponent(id)}`;

export default function AdminPayouts() {
  const router = useRouter();
  const { data, error, loading, reload } = useApi<{ periods: Period[] }>("/api/admin/payouts");
  const { busy, msg, run } = useAction();
  const [key, setKey] = useState("");
  const [force, setForce] = useState(false);
  return (
    <div>
      <PageHeader icon={<Banknote size={18} />} kicker="Ödemeler" title="Maaş dönemleri" description="Dönem kapatın; yayıncı maaşlarını, ajans primlerini, asistan paylarını ve davet primlerini ödendi olarak işaretleyin." />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card title="Dönemler" subtitle="Bir döneme tıklayınca kişi kişi özetler açılır">
          {loading && !data && <Loading />}
          {error && <ErrorBox message={error} onRetry={reload} />}
          {data && data.periods.length === 0 && <Empty title="Henüz kapatılmış dönem yok" />}
          {data && data.periods.length > 0 && (
            <div className={tableWrap}>
              <table className={`${tableCls} min-w-[760px]`}>
                <thead>
                  <tr>
                    <th className={thCls}>Dönem</th>
                    <th className={thCls}>Yayıncı maaşı</th>
                    <th className={thCls}>Ajans primi</th>
                    <th className={thCls}>Asistan / davet</th>
                    <th className={thCls}>Bekleyen</th>
                  </tr>
                </thead>
                <tbody>
                  {data.periods.map((p) => {
                    const waiting = p.pendingHosts + p.pendingAgencies + p.pendingAssistants + p.pendingReferrals;
                    return (
                      <tr key={p.id} className="cursor-pointer hover:bg-[#15120c]" onClick={() => router.push(payoutHref(p.id))}>
                        <td className={tdCls}>
                          <Link href={payoutHref(p.id)} onClick={(e) => e.stopPropagation()} className="font-medium text-white hover:text-[#e5c77e]">
                            {p.periodKey}
                          </Link>
                          <p className="text-xs text-gray-500">
                            {fmtDate(p.startsAt, false)} – {fmtDate(p.endsAt, false)}
                          </p>
                        </td>
                        <td className={tdCls}>
                          {fmtMoney(p.totalSalaryCents)}
                          <p className="text-xs text-gray-500">
                            {p.hosts} yayıncı · ödenen {fmtMoney(p.paidSalaryCents)}
                          </p>
                        </td>
                        <td className={tdCls}>
                          {fmtMoney(p.totalOwnerCents)}
                          <p className="text-xs text-gray-500">{p.agencies} ajans</p>
                        </td>
                        <td className={tdCls}>
                          {fmtMoney(p.totalAssistantCents)} / {fmtMoney(p.totalReferralCents)}
                        </td>
                        <td className={tdCls}>{waiting > 0 ? <Badge tone="gold">{waiting} bekliyor</Badge> : <Badge tone="green">Tamam</Badge>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        <Card title="Dönem kapat">
          <div className="space-y-3">
            <input value={key} onChange={(e) => setKey(e.target.value.trim())} placeholder="Boş = önceki dönem (ör. 2026-10)" className={inputCls} aria-label="Dönem" />
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} className="accent-[#d7b56d]" />
              Bitmemiş dönemi zorla kapat
            </label>
            <button
              type="button"
              disabled={busy}
              className="gold-button w-full disabled:opacity-60"
              onClick={() =>
                run("Dönem kapatıldı, özetler oluşturuldu.", async () => {
                  if (!window.confirm(`${key || "Önceki"} dönemi kapatılsın mı? Maaşlar ve primler hesaplanır, yayıncılara bildirim gider.`)) return false;
                  await api("/api/admin/payouts/close", { method: "POST", body: { period: key || undefined, force } });
                  reload();
                })
              }
            >
              Dönemi kapat
            </button>
            <ActionMsg msg={msg} />
            <p className="text-xs leading-5 text-gray-500">Aylık dönem: YYYY-AA (2026-10). Haftalık: WYYYY-AA-GG (pazartesi). Ödemeler platform dışında (havale) yapılır; burada yalnızca kayıt tutulur.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

type HostSt = {
  id: string;
  userId: string;
  username: string;
  displayName?: string;
  publicId?: string | null;
  kycStatus?: string;
  agencyName?: string;
  seconds: number;
  diamonds: string;
  validDays: number;
  tier: number | null;
  salaryCents: string;
  method: number | null;
  status: string;
  paidAt: string | null;
  payNote: string | null;
};
type AgencySt = { id: string; agencyId: string; agencyName: string; ownerUsername: string; ownerKyc: string; teamDiamonds: string; hostCount: number; commissionBps: number; ownerCents: string; assistantCents: string; status: string; payNote: string | null };
type AssistantSt = { id: string; userId: string; username?: string; displayName?: string; agencyName?: string; shareBps: number; amountCents: string; status: string; kycStatus?: string; payNote: string | null };
type ReferralSt = { id: string; agencyName?: string; invitedAgencyName?: string; bps: number; baseCents: string; amountCents: string; status: string; payNote: string | null };

type PeriodDetail = {
  period: { id: string; periodKey: string; cycle: string; startsAt: string; endsAt: string; closedAt: string; currency: string | null };
  hostStatements: HostSt[];
  agencyStatements: AgencySt[];
  assistantStatements: AssistantSt[];
  referralStatements: ReferralSt[];
};

type Kind = "host" | "agency" | "assistant" | "referral";

const stBadge = (s: string) => <Badge tone={s === "paid" ? "green" : s === "void" ? "gray" : "gold"}>{s === "paid" ? "Ödendi" : s === "void" ? "İptal" : "Bekliyor"}</Badge>;

export function AdminPayoutDetail() {
  const id = useQueryValue("id");
  if (!id) return <ErrorBox message="Dönem seçilmedi." />;
  return <PayoutDetailView key={id} id={id} />;
}

function PayoutDetailView({ id }: { id: string }) {
  const { data, error, loading, reload } = useApi<PeriodDetail>(`/api/admin/payouts/${encodeURIComponent(id)}`);
  const [kind, setKind] = useState<Kind>("host");
  const bulk = useAction();
  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorBox message={error} onRetry={reload} />;
  if (!data) return null;
  const cur = data.period.currency ?? "USD";
  const money = (c: string) => fmtMoney(c, cur);
  // İptal edilenler hariç toplam (kuruş).
  const sum = (arr: { s: string; c: string }[]) => arr.filter((x) => x.s !== "void").reduce((t, x) => t + BigInt(x.c || "0"), BigInt(0)).toString();
  const pendingCount = {
    host: data.hostStatements.filter((x) => x.status === "pending" && x.salaryCents !== "0").length,
    agency: data.agencyStatements.filter((x) => x.status === "pending").length,
    assistant: data.assistantStatements.filter((x) => x.status === "pending").length,
    referral: data.referralStatements.filter((x) => x.status === "pending").length,
  };

  const payAll = () =>
    bulk.run("Toplu ödeme işlendi.", async () => {
      if (!window.confirm("Bu türdeki tüm bekleyen özetler 'ödendi' olarak işaretlensin mi? (Kimlik onayı olmayan yayıncılar atlanır.)")) return false;
      const note = window.prompt("Ödeme notu (dekont no vb., isteğe bağlı)");
      if (note === null) return false;
      const r = await api<{ paid: number; skipped: number }>(`/api/admin/payouts/${data.period.id}/pay-all`, { method: "POST", body: { kind, note: note.trim() || null } });
      reload();
      bulk.setMsg({ tone: "ok", text: r.skipped ? `${r.paid} özet ödendi; ${r.skipped} özet kimlik onayı olmadığı için atlandı.` : `${r.paid} özet ödendi olarak işaretlendi.` });
      return false;
    });

  return (
    <div>
      <Link href="/admin/payouts" className="mb-4 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
        <ArrowLeft size={16} /> Maaş dönemleri
      </Link>
      <PageHeader
        icon={<Banknote size={18} />}
        kicker={`${data.period.cycle === "weekly" ? "Haftalık" : "Aylık"} dönem · kapanış ${fmtDate(data.period.closedAt)}`}
        title={data.period.periodKey}
        description={`${fmtDate(data.period.startsAt, false)} – ${fmtDate(data.period.endsAt, false)} · Para birimi ${cur}`}
      />
      <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Yayıncı maaşları" value={money(sum(data.hostStatements.map((x) => ({ s: x.status, c: x.salaryCents }))))} note={`${data.hostStatements.length} yayıncı`} />
        <StatCard label="Ajans primleri" value={money(sum(data.agencyStatements.map((x) => ({ s: x.status, c: x.ownerCents }))))} note={`${data.agencyStatements.length} ajans`} tone="blue" />
        <StatCard label="Asistan payları" value={money(sum(data.assistantStatements.map((x) => ({ s: x.status, c: x.amountCents }))))} note={`${data.assistantStatements.length} asistan`} tone="green" />
        <StatCard label="Davet primleri" value={money(sum(data.referralStatements.map((x) => ({ s: x.status, c: x.amountCents }))))} note={`${data.referralStatements.length} kayıt`} />
      </div>
      <Tabs
        tabs={[
          { key: "host", label: "Yayıncılar", count: pendingCount.host },
          { key: "agency", label: "Ajanslar", count: pendingCount.agency },
          { key: "assistant", label: "Asistanlar", count: pendingCount.assistant },
          { key: "referral", label: "Davet primleri", count: pendingCount.referral },
        ]}
        value={kind}
        onChange={setKind}
      />
      <Card
        action={
          pendingCount[kind] > 0 ? (
            <button type="button" disabled={bulk.busy} onClick={payAll} className={btnGhost}>
              <CheckCheck size={15} /> Tümünü ödendi işaretle
            </button>
          ) : undefined
        }
        title={{ host: "Yayıncı maaş özetleri", agency: "Ajans prim özetleri", assistant: "Asistan payları", referral: "Davet primleri" }[kind]}
      >
        <ActionMsg msg={bulk.msg} />
        {kind === "host" && <HostTable rows={data.hostStatements} money={money} onChanged={reload} />}
        {kind === "agency" && <SimpleTable kind="agency" rows={data.agencyStatements.map((a) => ({ id: a.id, status: a.status, payNote: a.payNote, cents: a.ownerCents, title: a.agencyName, sub: `Sahibi @${a.ownerUsername} · kimlik ${kycText[a.ownerKyc] ?? a.ownerKyc} · ${a.hostCount} yayıncı · ekip ${fmtNumber(a.teamDiamonds)} elmas · %${a.commissionBps / 100}` }))} money={money} onChanged={reload} />}
        {kind === "assistant" && <SimpleTable kind="assistant" rows={data.assistantStatements.map((a) => ({ id: a.id, status: a.status, payNote: a.payNote, cents: a.amountCents, title: a.displayName || a.username || "Asistan", sub: `${a.agencyName ?? ""} · pay %${a.shareBps / 100}${a.kycStatus ? ` · kimlik ${kycText[a.kycStatus] ?? a.kycStatus}` : ""}`, userId: a.userId }))} money={money} onChanged={reload} />}
        {kind === "referral" && <SimpleTable kind="referral" rows={data.referralStatements.map((a) => ({ id: a.id, status: a.status, payNote: a.payNote, cents: a.amountCents, title: a.agencyName ?? "Ajans", sub: `Davet ettiği: ${a.invitedAgencyName ?? "—"} · taban ${money(a.baseCents)} · %${a.bps / 100}` }))} money={money} onChanged={reload} />}
      </Card>
    </div>
  );
}

function useStatementActions(kind: Kind, onChanged: () => void) {
  const a = useAction();
  const pay = (id: string) =>
    a.run("Ödendi olarak işaretlendi.", async () => {
      const note = window.prompt("Ödeme notu (dekont no vb., isteğe bağlı)");
      if (note === null) return false;
      await api(`/api/admin/statements/${kind}/${id}/pay`, { method: "POST", body: { note: note.trim() || null } });
      onChanged();
    });
  const voidIt = (id: string) =>
    a.run("Özet iptal edildi.", async () => {
      const note = window.prompt("İptal nedeni (kayda geçer)");
      if (note === null) return false;
      const r = await api<{ refundedDiamonds?: string }>(`/api/admin/statements/${kind}/${id}/void`, { method: "POST", body: { note: note.trim() || null } });
      onChanged();
      if (r.refundedDiamonds && r.refundedDiamonds !== "0") {
        a.setMsg({ tone: "ok", text: `Özet iptal edildi; ${fmtNumber(r.refundedDiamonds)} elmas yayıncıya iade edildi.` });
        return false;
      }
    });
  return { ...a, pay, voidIt };
}

function HostTable({ rows, money, onChanged }: { rows: HostSt[]; money: (c: string) => string; onChanged: () => void }) {
  const { busy, msg, pay, voidIt } = useStatementActions("host", onChanged);
  if (rows.length === 0) return <Empty title="Özet yok" />;
  return (
    <>
      <ActionMsg msg={msg} />
      <div className={`${tableWrap} mt-2`}>
        <table className={`${tableCls} min-w-[920px]`}>
          <thead>
            <tr>
              <th className={thCls}>Yayıncı</th>
              <th className={thCls}>Yayın</th>
              <th className={thCls}>Elmas</th>
              <th className={thCls}>Seviye / yöntem</th>
              <th className={`${thCls} text-right`}>Maaş</th>
              <th className={thCls}>Durum</th>
              <th className={thCls} />
            </tr>
          </thead>
          <tbody>
            {rows.map((h) => (
              <tr key={h.id}>
                <td className={tdCls}>
                  <UserLink user={{ id: h.userId, username: h.username, displayName: h.displayName, publicId: h.publicId }} size={26} sub={`${h.agencyName ?? "ajanssız"} · kimlik ${kycText[h.kycStatus ?? "none"] ?? h.kycStatus}`} />
                </td>
                <td className={`${tdCls} text-xs`}>
                  {fmtDuration(h.seconds)}
                  <span className="block text-gray-500">{h.validDays} geçerli gün</span>
                </td>
                <td className={tdCls}>{fmtNumber(h.diamonds)}</td>
                <td className={`${tdCls} text-xs`}>
                  {h.tier ? `Seviye ${h.tier}` : "—"}
                  {h.method ? ` · Yöntem ${h.method}` : ""}
                </td>
                <td className={`${tdCls} text-right font-semibold`}>{money(h.salaryCents)}</td>
                <td className={tdCls}>
                  {stBadge(h.status)}
                  {h.payNote && <span className="mt-1 block text-xs text-gray-500">{h.payNote}</span>}
                </td>
                <td className={tdCls}>
                  {h.status === "pending" && (
                    <div className="flex justify-end gap-1.5">
                      {h.salaryCents !== "0" && (
                        <button type="button" disabled={busy} className={btnSmall} onClick={() => pay(h.id)}>
                          Ödendi
                        </button>
                      )}
                      <button type="button" disabled={busy} className={btnSmall} onClick={() => voidIt(h.id)}>
                        İptal
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

type Simple = { id: string; status: string; payNote: string | null; cents: string; title: string; sub: string; userId?: string };

function SimpleTable({ kind, rows, money, onChanged }: { kind: Kind; rows: Simple[]; money: (c: string) => string; onChanged: () => void }) {
  const { busy, msg, pay, voidIt } = useStatementActions(kind, onChanged);
  if (rows.length === 0) return <Empty title="Özet yok" />;
  return (
    <>
      <ActionMsg msg={msg} />
      <ul className="mt-2 space-y-2">
        {rows.map((r) => (
          <li key={r.id} className="flex flex-col gap-3 rounded-xl border border-[#262117] bg-[#141210] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              {r.userId ? <UserLink user={{ id: r.userId, displayName: r.title }} size={26} sub={r.sub} /> : (
                <>
                  <p className="font-medium text-white">{r.title}</p>
                  <p className="text-xs text-gray-500">{r.sub}</p>
                </>
              )}
              {r.payNote && <p className="mt-1 text-xs text-gray-500">Not: {r.payNote}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="font-semibold text-white">{money(r.cents)}</span>
              {stBadge(r.status)}
              {r.status === "pending" && (
                <>
                  <button type="button" disabled={busy} className={btnSmall} onClick={() => pay(r.id)}>
                    Ödendi
                  </button>
                  <button type="button" disabled={busy} className={`${btnDangerOutline} px-2.5 py-1 text-xs`} onClick={() => voidIt(r.id)}>
                    İptal
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
