"use client";

import { Coins, History } from "lucide-react";
import { fmtDate, fmtNumber } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { Badge, Card, Empty, ErrorBox, Loading, PageHeader, tableCls, tableWrap, tdCls, thCls } from "@/components/ui";

type Log = {
  id: string;
  admin_id: string | null;
  user_id: string | null;
  action: string;
  reference_type?: string | null;
  amount_coins?: string | null;
  balance_before?: string | null;
  balance_after?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
};

const actionText: Record<string, string> = {
  admin_coin_adjustment: "Coin düzenleme",
  admin_wip_grant: "WIP verildi",
  admin_wip_revoke: "WIP alındı",
  admin_inventory_grant: "Öğe verildi",
  account_ban: "Ban",
  account_unban: "Ban kaldırıldı",
  app_config_update: "Ayar değişikliği",
};

// Hedef ES2017: BigInt sabitleri (0n) yerine BigInt(0).
const ZERO = BigInt(0);

const short = (id: string | null | undefined) => (id ? `${id.slice(0, 8)}…` : "—");

export default function AdminCoins() {
  const { data, error, loading, reload } = useApi<{ logs: Log[] }>("/api/admin/finance/audit?limit=200");
  const logs = data?.logs ?? [];
  const coinLogs = logs.filter((l) => l.amount_coins != null);
  const added = coinLogs.reduce((t, l) => (BigInt(l.amount_coins ?? "0") > ZERO ? t + BigInt(l.amount_coins ?? "0") : t), ZERO);
  const removed = coinLogs.reduce((t, l) => (BigInt(l.amount_coins ?? "0") < ZERO ? t + BigInt(l.amount_coins ?? "0") : t), ZERO);
  return (
    <div>
      <PageHeader icon={<Coins size={18} />} kicker="Mali denetim" title="Coin İşlemleri" description="Yönetimin yaptığı Coin, WIP, öğe ve hesap işlemlerinin denetim kaydı (son 200)." />
      {loading && !data && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#30291e] bg-[#111111] p-5">
              <p className="text-sm text-gray-400">Kayıt sayısı</p>
              <p className="mt-4 text-2xl font-bold">{fmtNumber(logs.length)}</p>
            </div>
            <div className="rounded-2xl border border-[#30291e] bg-[#111111] p-5">
              <p className="text-sm text-gray-400">Eklenen Coin</p>
              <p className="mt-4 text-2xl font-bold text-emerald-300">+{fmtNumber(added.toString())}</p>
            </div>
            <div className="rounded-2xl border border-[#30291e] bg-[#111111] p-5">
              <p className="text-sm text-gray-400">Düşülen Coin</p>
              <p className="mt-4 text-2xl font-bold text-red-300">{fmtNumber(removed.toString())}</p>
            </div>
          </div>
          <Card title="İşlem geçmişi" subtitle="Coin eklemek/düşmek için Kullanıcılar sayfasını kullanın." action={<History size={18} className="text-[#d7b56d]" />}>
            {logs.length === 0 ? (
              <Empty title="Henüz kayıt yok." />
            ) : (
              <div className={tableWrap}>
                <table className={tableCls}>
                  <thead>
                    <tr>
                      <th className={thCls}>Tarih</th>
                      <th className={thCls}>İşlem</th>
                      <th className={thCls}>Kullanıcı</th>
                      <th className={thCls}>Coin</th>
                      <th className={thCls}>Bakiye</th>
                      <th className={thCls}>Açıklama</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((l) => {
                      const amt = l.amount_coins != null ? BigInt(l.amount_coins) : null;
                      const reason = typeof l.metadata?.reason === "string" ? l.metadata.reason : "";
                      return (
                        <tr key={l.id}>
                          <td className={tdCls}>{fmtDate(l.created_at)}</td>
                          <td className={tdCls}>
                            <Badge tone={l.action.includes("ban") ? "red" : "gold"}>{actionText[l.action] ?? l.action}</Badge>
                          </td>
                          <td className={`${tdCls} font-mono text-xs text-gray-400`} title={l.user_id ?? ""}>
                            {short(l.user_id)}
                          </td>
                          <td className={`${tdCls} font-semibold ${amt == null ? "" : amt >= ZERO ? "text-emerald-300" : "text-red-300"}`}>
                            {amt == null ? "—" : `${amt > ZERO ? "+" : ""}${fmtNumber(amt.toString())}`}
                          </td>
                          <td className={`${tdCls} text-xs text-gray-400`}>
                            {l.balance_before != null ? `${fmtNumber(l.balance_before)} → ${fmtNumber(l.balance_after)}` : "—"}
                          </td>
                          <td className={`${tdCls} max-w-[260px] truncate text-gray-400`} title={reason}>
                            {reason || "—"}
                          </td>
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
