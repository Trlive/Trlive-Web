"use client";

import { useState } from "react";
import { fmtNumber } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { Card, ErrorBox, Loading, tableCls, tableWrap, tdCls, thCls } from "@/components/ui";

type Day = { day: string; newUsers: number; gifts: number; giftCoins: string; rooms: number; reports: number };
type Metric = "newUsers" | "giftCoins" | "gifts" | "rooms" | "reports";

const METRICS: { key: Metric; label: string }[] = [
  { key: "newUsers", label: "Yeni üye" },
  { key: "giftCoins", label: "Hediye (Coin)" },
  { key: "gifts", label: "Hediye sayısı" },
  { key: "rooms", label: "Açılan oda" },
  { key: "reports", label: "Şikâyet" },
];

const dayLabel = (iso: string) => {
  const [, m, d] = iso.split("-");
  return `${d}.${m}`;
};

/** Son 14 günün tek ölçülü çubuk grafiği (Türkiye saatiyle günler). Üzerine gelince değer görünür. */
export default function DailyChart() {
  const [days, setDays] = useState(14);
  const [metric, setMetric] = useState<Metric>("newUsers");
  const [hover, setHover] = useState<number | null>(null);
  const [asTable, setAsTable] = useState(false);
  const { data, error, loading, reload } = useApi<{ days: Day[] }>(`/api/admin/stats/daily?days=${days}`);

  const vals = (data?.days ?? []).map((d) => Number(d[metric]) || 0);
  const max = Math.max(1, ...vals);
  const W = 720;
  const H = 220;
  const padL = 44;
  const padB = 26;
  const padT = 12;
  const plotW = W - padL - 8;
  const plotH = H - padB - padT;
  const n = Math.max(1, vals.length);
  const slot = plotW / n;
  const barW = Math.max(4, Math.min(28, slot - 2));
  const ticks = [0, 0.5, 1].map((t) => Math.round(max * t));
  const labelEvery = n > 20 ? 5 : n > 10 ? 2 : 1;
  const label = METRICS.find((m) => m.key === metric)?.label ?? "";
  const total = vals.reduce((a, b) => a + b, 0);

  return (
    <Card
      title={`${label} · son ${days} gün`}
      subtitle={data ? `Toplam ${fmtNumber(total)}` : undefined}
      action={
        <div className="flex flex-wrap gap-1.5">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={`rounded-lg border px-2.5 py-1 text-xs ${days === d ? "border-[#8c713d] bg-[#292114] text-[#e5c77e]" : "border-[#30291e] text-gray-400 hover:text-white"}`}
            >
              {d} gün
            </button>
          ))}
          <button type="button" onClick={() => setAsTable((v) => !v)} className="rounded-lg border border-[#30291e] px-2.5 py-1 text-xs text-gray-400 hover:text-white">
            {asTable ? "Grafik" : "Tablo"}
          </button>
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap gap-1.5" role="tablist" aria-label="Ölçü">
        {METRICS.map((m) => (
          <button
            key={m.key}
            type="button"
            role="tab"
            aria-selected={metric === m.key}
            onClick={() => setMetric(m.key)}
            className={`rounded-full border px-3 py-1 text-xs ${metric === m.key ? "border-[#8c713d] bg-[#292114] text-[#e5c77e]" : "border-[#2a241a] text-gray-400 hover:text-white"}`}
          >
            {m.label}
          </button>
        ))}
      </div>
      {loading && !data && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && asTable && (
        <div className={tableWrap}>
          <table className={tableCls}>
            <thead>
              <tr>
                <th className={thCls}>Gün</th>
                {METRICS.map((m) => (
                  <th key={m.key} className={`${thCls} text-right`}>
                    {m.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...data.days].reverse().map((d) => (
                <tr key={d.day}>
                  <td className={tdCls}>{dayLabel(d.day)}</td>
                  {METRICS.map((m) => (
                    <td key={m.key} className={`${tdCls} text-right`}>
                      {fmtNumber(d[m.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && !asTable && (
        <div className="relative">
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${label}, günlük`} onMouseLeave={() => setHover(null)}>
            {ticks.map((t, i) => {
              const y = padT + plotH - (t / max) * plotH;
              return (
                <g key={i}>
                  <line x1={padL} x2={W - 8} y1={y} y2={y} stroke="#2a241a" strokeWidth={1} />
                  <text x={padL - 8} y={y + 4} textAnchor="end" fontSize={11} fill="#7d776d">
                    {fmtNumber(t)}
                  </text>
                </g>
              );
            })}
            {data.days.map((d, i) => {
              const v = vals[i];
              const h = v > 0 ? Math.max(2, (v / max) * plotH) : 0;
              const x = padL + i * slot + (slot - barW) / 2;
              const y = padT + plotH - h;
              const r = Math.min(4, barW / 2, h);
              return (
                <g key={d.day} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} tabIndex={0}>
                  <rect x={padL + i * slot} y={padT} width={slot} height={plotH + padB} fill="transparent" />
                  {h > 0 && (
                    <path
                      d={`M${x},${y + h} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + barW - r},${y} Q${x + barW},${y} ${x + barW},${y + r} L${x + barW},${y + h} Z`}
                      fill={hover === i ? "#f2d28b" : "#d7b56d"}
                    />
                  )}
                  {i % labelEvery === 0 && (
                    <text x={x + barW / 2} y={H - 8} textAnchor="middle" fontSize={11} fill="#7d776d">
                      {dayLabel(d.day)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          {hover !== null && data.days[hover] && (
            <div
              className="pointer-events-none absolute top-0 rounded-lg border border-[#4b3c22] bg-[#15120c] px-3 py-2 text-xs shadow-lg"
              style={{ left: `${Math.min(80, Math.max(0, ((padL + hover * slot) / W) * 100))}%` }}
            >
              <p className="text-gray-400">{dayLabel(data.days[hover].day)}</p>
              <p className="font-semibold text-white">
                {fmtNumber(vals[hover])} {label.toLocaleLowerCase("tr-TR")}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
