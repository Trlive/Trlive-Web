"use client";

import { Coins, Receipt } from "lucide-react";
import { fmtDate, fmtMoney, fmtNumber } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { Badge, Card, Empty, ErrorBox, Loading, PageHeader, StatCard, tableCls, tableWrap, tdCls, thCls } from "@/components/ui";
import { currentAgency, periodText, type Period } from "./common";

type Earnings = {
  role: string;
  period: Period;
  currency: string;
  days: { day: string; diamonds: string; primCents: string }[];
  hosts: { id: string; displayName?: string; publicId?: string; agencyDiamonds: string; level: number | null; agencyCents: string; inAgency: boolean }[];
  totals: { commissionCents?: string; assistantCents?: string; ownerCents?: string; teamDiamonds?: string; baseCents?: string; myCents?: string; shareBps?: number };
  assistants: { id: string; displayName?: string; shareBps: number; hosts: number; amountCents: string }[];
  statements: { id: string; periodKey: string; status: string; commissionCents?: string; ownerCents?: string; amountCents?: string; paidAt?: string | null }[];
};

const statusText: Record<string, [string, "green" | "gold" | "gray"]> = {
  paid: ["Ödendi", "green"],
  pending: ["Bekliyor", "gold"],
  void: ["İptal", "gray"],
};

export default function AgencyEarnings() {
  const ag = currentAgency();
  const { data, error, loading, reload } = useApi<Earnings>(ag.id ? `/api/agency-center/${ag.id}/earnings` : null);
  const cur = data?.currency ?? "USD";
  const owner = data?.role !== "assistant";
  const maxD = Math.max(1, ...(data?.days ?? []).map((d) => Number(d.diamonds) || 0));
  return (
    <div>
      <PageHeader icon={<Coins size={18} />} kicker="Finans" title="Kazançlar" description={data ? `Bu dönem: ${periodText(data.period)}` : undefined} />
      {loading && !data && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {owner ? (
              <>
                <StatCard label="Toplam ajans primi" value={fmtMoney(data.totals.commissionCents, cur)} note={`Takım elması: ${fmtNumber(data.totals.teamDiamonds)}`} tone="gold" />
                <StatCard label="Asistan payları" value={fmtMoney(data.totals.assistantCents, cur)} tone="blue" />
                <StatCard label="Size kalan (tahmini)" value={fmtMoney(data.totals.ownerCents, cur)} tone="green" />
              </>
            ) : (
              <>
                <StatCard label="Yayıncılarımın primi" value={fmtMoney(data.totals.baseCents, cur)} tone="gold" />
                <StatCard label="Pay oranım" value={`%${((data.totals.shareBps ?? 0) / 100).toFixed(0)}`} tone="blue" />
                <StatCard label="Tahmini payım" value={fmtMoney(data.totals.myCents, cur)} tone="green" />
              </>
            )}
          </div>

          <Card title="Günlük elmas" subtitle="Bu dönemdeki günlük toplam">
            {data.days.length === 0 ? (
              <Empty title="Bu dönemde henüz veri yok." />
            ) : (
              <div className="flex h-44 items-end gap-1 overflow-x-auto">
                {data.days.map((d) => (
                  <div key={d.day} className="flex min-w-[14px] flex-1 flex-col items-center justify-end" title={`${d.day}: ${fmtNumber(d.diamonds)} elmas`}>
                    <div
                      className="w-full rounded-t"
                      style={{
                        height: `${Math.max(2, Math.round(((Number(d.diamonds) || 0) / maxD) * 160))}px`,
                        background: "linear-gradient(to top, #8c6a2a, #f2d28b)",
                      }}
                    />
                    <span className="mt-1 text-[9px] text-gray-600">{d.day.slice(-2)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Yayıncı bazında prim">
            {data.hosts.length === 0 ? (
              <Empty title="Kayıt yok." />
            ) : (
              <div className={tableWrap}>
                <table className={tableCls}>
                  <thead>
                    <tr>
                      <th className={thCls}>Yayıncı</th>
                      <th className={thCls}>Ajanstaki elmas</th>
                      <th className={thCls}>Prim seviyesi</th>
                      <th className={thCls}>Prim</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.hosts.map((h) => (
                      <tr key={h.id}>
                        <td className={tdCls}>
                          {h.displayName ?? "—"} <span className="text-xs text-gray-500">ID {h.publicId ?? "—"}</span>
                          {!h.inAgency && <span className="ml-2 text-xs text-gray-500">(ayrıldı)</span>}
                        </td>
                        <td className={tdCls}>{fmtNumber(h.agencyDiamonds)}</td>
                        <td className={tdCls}>{h.level ? `Seviye ${h.level}` : "—"}</td>
                        <td className={tdCls}>{fmtMoney(h.agencyCents, cur)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {owner && data.assistants.length > 0 && (
            <Card title="Asistanlar">
              <div className={tableWrap}>
                <table className={tableCls}>
                  <thead>
                    <tr>
                      <th className={thCls}>Asistan</th>
                      <th className={thCls}>Pay</th>
                      <th className={thCls}>Yayıncı</th>
                      <th className={thCls}>Tahmini pay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.assistants.map((a) => (
                      <tr key={a.id}>
                        <td className={tdCls}>{a.displayName ?? "—"}</td>
                        <td className={tdCls}>%{(a.shareBps / 100).toFixed(0)}</td>
                        <td className={tdCls}>{a.hosts}</td>
                        <td className={tdCls}>{fmtMoney(a.amountCents, cur)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          <Card title="Geçmiş dönem hesap özetleri" action={<Receipt size={18} className="text-[#d7b56d]" />}>
            {data.statements.length === 0 ? (
              <Empty title="Henüz kapanmış dönem yok." />
            ) : (
              <div className={tableWrap}>
                <table className={tableCls}>
                  <thead>
                    <tr>
                      <th className={thCls}>Dönem</th>
                      <th className={thCls}>Tutar</th>
                      <th className={thCls}>Durum</th>
                      <th className={thCls}>Ödeme tarihi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.statements.map((s) => {
                      const st = statusText[s.status] ?? [s.status, "gray"];
                      return (
                        <tr key={s.id}>
                          <td className={tdCls}>{s.periodKey}</td>
                          <td className={tdCls}>{fmtMoney(owner ? s.ownerCents ?? s.commissionCents : s.amountCents, cur)}</td>
                          <td className={tdCls}>
                            <Badge tone={st[1]}>{st[0]}</Badge>
                          </td>
                          <td className={tdCls}>{s.paidAt ? fmtDate(s.paidAt, false) : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
