"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { fmtDuration, fmtMoney, fmtNumber } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { Badge, Card, Empty, ErrorBox, Loading, PageHeader, inputCls, tableCls, tableWrap, tdCls, thCls } from "@/components/ui";
import { Avatar } from "@/components/admin/user-picker";
import { currentAgency, periodText, type Period } from "./common";

type Host = {
  id: string;
  displayName?: string;
  username?: string;
  publicId?: string | null;
  avatarUrl?: string | null;
  liveNow: boolean;
  seconds: number;
  validDays: number;
  diamonds: string;
  changePct: number | null;
  level: number | null;
  salaryCents: string;
  agencyCents: string;
  dropped: boolean;
  behindDays: boolean;
  isNew: boolean;
  next: { level: number; remaining: string } | null;
};

export default function AgencyBroadcasters() {
  const ag = currentAgency();
  const { data, error, loading, reload } = useApi<{ period: Period; currency: string; hosts: Host[]; role: string }>(ag.id ? `/api/agency-center/${ag.id}/hosts` : null);
  const [q, setQ] = useState("");
  const cur = data?.currency ?? "USD";
  const hosts = (data?.hosts ?? []).filter((h) => {
    const t = q.trim().toLowerCase();
    return !t || `${h.displayName ?? ""} ${h.username ?? ""} ${h.publicId ?? ""}`.toLowerCase().includes(t);
  });
  return (
    <div>
      <PageHeader icon={<Users size={18} />} kicker="Yayıncı ekibi" title="Yayıncılarım" description={data ? `Bu dönem: ${periodText(data.period)}` : undefined} />
      {loading && !data && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && (
        <Card
          title="Yayıncı listesi"
          subtitle={`${data.hosts.length} yayıncı${data.role === "assistant" ? " (davet ettikleriniz)" : ""}`}
          action={<input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ad veya ID ara..." className={`${inputCls} md:w-64`} aria-label="Yayıncı ara" />}
        >
          {hosts.length === 0 ? (
            <Empty title="Yayıncı bulunamadı." note="Yeni yayıncıları Davet ve Transfer sayfasından davet edebilirsiniz." />
          ) : (
            <div className={tableWrap}>
              <table className={`${tableCls} min-w-[900px]`}>
                <thead>
                  <tr>
                    <th className={thCls}>Yayıncı</th>
                    <th className={thCls}>Elmas (dönem)</th>
                    <th className={thCls}>Yayın süresi</th>
                    <th className={thCls}>Geçerli gün</th>
                    <th className={thCls}>Seviye</th>
                    <th className={thCls}>Tahmini maaş</th>
                    <th className={thCls}>Ajans primi</th>
                    <th className={thCls}>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {hosts.map((h) => (
                    <tr key={h.id}>
                      <td className={tdCls}>
                        <div className="flex items-center gap-3">
                          <Avatar url={h.avatarUrl} name={h.displayName || h.username} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-white">{h.displayName || h.username}</p>
                            <p className="text-xs text-gray-500">ID {h.publicId ?? "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className={tdCls}>
                        <p className="font-semibold">{fmtNumber(h.diamonds)}</p>
                        {h.changePct != null && <p className={`text-xs ${h.changePct < 0 ? "text-red-300" : "text-emerald-300"}`}>%{h.changePct}</p>}
                      </td>
                      <td className={tdCls}>{fmtDuration(h.seconds)}</td>
                      <td className={tdCls}>{h.validDays}</td>
                      <td className={tdCls}>
                        {h.level ? `Seviye ${h.level}` : "—"}
                        {h.next && <p className="text-xs text-gray-500">Sonraki: {fmtNumber(h.next.remaining)} elmas</p>}
                      </td>
                      <td className={tdCls}>{fmtMoney(h.salaryCents, cur)}</td>
                      <td className={tdCls}>{fmtMoney(h.agencyCents, cur)}</td>
                      <td className={tdCls}>
                        <div className="flex flex-wrap gap-1">
                          {h.liveNow && <Badge tone="green">Canlı</Badge>}
                          {h.isNew && <Badge tone="blue">Yeni</Badge>}
                          {h.dropped && <Badge tone="red">Düşüşte</Badge>}
                          {h.behindDays && <Badge tone="red">Gün riski</Badge>}
                          {!h.liveNow && !h.isNew && !h.dropped && !h.behindDays && <Badge tone="gray">Normal</Badge>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
