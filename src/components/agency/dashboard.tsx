"use client";

import { Building2, Crown, Diamond, Radio, TrendingDown, TrendingUp, Trophy, Users, Wallet } from "lucide-react";
import { fmtMoney, fmtNumber } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { Card, ErrorBox, Loading, PageHeader, StatCard } from "@/components/ui";
import { currentAgency, periodText, type Period } from "./common";

type Home = {
  role: string;
  agency: { name: string; agencyCode?: string | null; status: string; broadcasterCount: number };
  period: Period;
  currency: string;
  earnings: { monthCents?: string; todayCents?: string; yesterdayCents?: string; assistantCents?: string; ownerCents?: string; myCents?: string; myHosts?: number; shareBps?: number };
  stats: {
    monthDiamonds: string; lastSameDiamonds: string; changePct: number | null; todayDiamonds: string; yesterdayDiamonds: string;
    broadcasters: number; activeToday: number; liveNow: number; newThisMonth: number; dropped: number; behindDays: number;
    salaryCents: string | null; qualified: number;
  };
  grade: { name: string | null; next: { name: string; remaining: string } | null };
  rank: { rank: number | null; total: number };
  tasks: { key: string; title: string; value: number; target: number }[];
  pendingTransfers: number;
  pendingInvites: number;
};

export default function AgencyDashboard() {
  const ag = currentAgency();
  const { data, error, loading, reload } = useApi<Home>(ag.id ? `/api/agency-center/${ag.id}/home` : null);
  const owner = data?.role !== "assistant";
  const cur = data?.currency ?? "USD";
  const change = data?.stats.changePct;
  return (
    <div>
      <PageHeader
        icon={<Building2 size={18} />}
        kicker={owner ? "Ajansım" : "Asistan paneli"}
        title={data?.agency.name ?? ag.name ?? "Ajans"}
        description={data ? `Bu dönem: ${periodText(data.period)}` : undefined}
        action={
          <button type="button" onClick={reload} className="rounded-xl border border-[#4b3c22] bg-[#17140e] px-4 py-2 text-sm text-[#d7b56d] hover:bg-[#211a0f]">
            Yenile
          </button>
        }
      />
      {!ag.id && <ErrorBox message="Ajans bilgisi bulunamadı. Lütfen çıkış yapıp yeniden giriş yapın." />}
      {loading && !data && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {owner ? (
              <StatCard label="Bu ay tahmini prim" value={fmtMoney(data.earnings.monthCents, cur)} note={`Bugün +${fmtMoney(data.earnings.todayCents, cur)} · Dün +${fmtMoney(data.earnings.yesterdayCents, cur)}`} icon={<Wallet size={20} />} tone="green" />
            ) : (
              <StatCard label="Bu ay tahmini payım" value={fmtMoney(data.earnings.myCents, cur)} note={`${data.earnings.myHosts ?? 0} yayıncı · pay %${((data.earnings.shareBps ?? 0) / 100).toFixed(0)}`} icon={<Wallet size={20} />} tone="green" />
            )}
            <StatCard
              label="Bu ay elmas"
              value={fmtNumber(data.stats.monthDiamonds)}
              note={change == null ? `Bugün +${fmtNumber(data.stats.todayDiamonds)}` : `Geçen ayın aynı dönemine göre %${change}`}
              icon={change != null && change < 0 ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
              tone={change != null && change < 0 ? "red" : "gold"}
            />
            <StatCard label="Yayıncılar" value={fmtNumber(data.stats.broadcasters)} note={`Bugün yayında: ${data.stats.activeToday} · Bu ay yeni: ${data.stats.newThisMonth}`} icon={<Users size={20} />} tone="blue" />
            <StatCard label="Şu an canlı" value={fmtNumber(data.stats.liveNow)} note={`Maaş seviyesine ulaşan: ${data.stats.qualified}`} icon={<Radio size={20} />} />
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <Card title="Ajans seviyesi">
              <div className="flex items-center gap-3">
                <Crown className="text-[#d7b56d]" size={30} />
                <div>
                  <p className="text-xl font-bold text-white">{data.grade.name ?? "—"}</p>
                  {data.grade.next && (
                    <p className="text-xs text-gray-500">
                      {data.grade.next.name} için {fmtNumber(data.grade.next.remaining)} elmas kaldı
                    </p>
                  )}
                </div>
              </div>
            </Card>
            <Card title="Aylık sıralama">
              <div className="flex items-center gap-3">
                <Trophy className="text-[#d7b56d]" size={30} />
                <p className="text-xl font-bold text-white">{data.rank.rank ? `${data.rank.rank} / ${data.rank.total}` : "Sıralamada değil"}</p>
              </div>
            </Card>
            <Card title="Dikkat">
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2"><TrendingDown size={15} className="text-red-300" /> Düşüşte: {data.stats.dropped}</li>
                <li className="flex items-center gap-2"><Diamond size={15} className="text-amber-300" /> Gün şartı riskinde: {data.stats.behindDays}</li>
                {owner && <li className="flex items-center gap-2"><Users size={15} className="text-sky-300" /> Bekleyen transfer: {data.pendingTransfers}</li>}
                <li className="flex items-center gap-2"><Users size={15} className="text-sky-300" /> Bekleyen davet: {data.pendingInvites}</li>
              </ul>
            </Card>
          </div>

          <Card title="Görevler">
            <div className="grid gap-4 md:grid-cols-3">
              {data.tasks.map((t) => {
                const pct = Math.min(100, Math.round((t.value / Math.max(1, t.target)) * 100));
                return (
                  <div key={t.key} className="rounded-xl border border-[#262117] bg-[#141210] p-4">
                    <p className="text-sm text-gray-300">{t.title}</p>
                    <p className="mt-2 text-lg font-bold text-white">
                      {t.value} / {t.target}
                    </p>
                    <div className="mt-3 h-2 rounded-full bg-[#2a2418]">
                      <div className="h-2 rounded-full bg-[#d7b56d]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
