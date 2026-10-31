"use client";

import { Activity, AlertTriangle, Gift, Mic, Radio, Server, ShieldCheck, UserPlus, Users } from "lucide-react";
import { fmtNumber } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { Card, ErrorBox, Loading, PageHeader, StatCard } from "@/components/ui";

type Dash = {
  time: string;
  server: { version: string; uptimeSec: number; cpuPercent: number; cores: number; memory: { rssMb: number }; host: { totalMb: number; freeMb: number } };
  db: { latencyMs: number; sizeMb: number; mediaMb: number };
  livekit?: { ok?: boolean; latencyMs?: number } | null;
  realtime?: { sockets?: number; onlineUsers?: number; inRooms?: number } | null;
  live: { activeRooms: number; videoRooms: number; audioRooms: number; roomMembers: number; onMic: number; sessions: number };
  today: { newUsers: number; activeUsers: number; gifts: number; giftCoins: string | number; roomMessages: number; directMessages: number; strikes: number; autoMutes: number };
  totals: { users: number };
  alerts: { openReports: number; errors24h: number };
};

function uptime(sec: number) {
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  return d > 0 ? `${d} gün ${h} sa` : `${h} sa ${Math.floor((sec % 3600) / 60)} dk`;
}

export default function AdminDashboard() {
  const { data, error, loading, reload } = useApi<Dash>("/api/admin/dashboard");
  return (
    <div>
      <PageHeader
        icon={<ShieldCheck size={18} />}
        kicker="Hoş geldiniz"
        title="Platform Genel Bakış"
        description="Bugünün özeti ve sunucunun anlık durumu."
        action={
          <button type="button" onClick={reload} className="rounded-xl border border-[#4b3c22] bg-[#17140e] px-4 py-2 text-sm text-[#d7b56d] hover:bg-[#211a0f]">
            Yenile
          </button>
        }
      />
      {loading && !data && <Loading />}
      {error && <ErrorBox message={error.includes("yalnızca yöneticiye") ? "Genel bakış yalnızca yöneticiye açıktır. Kullanıcılar sayfasını kullanabilirsiniz." : error} onRetry={reload} />}
      {data && (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Toplam kullanıcı" value={fmtNumber(data.totals.users)} icon={<Users size={20} />} />
            <StatCard label="Bugün yeni üye" value={fmtNumber(data.today.newUsers)} note={`Bugün aktif: ${fmtNumber(data.today.activeUsers)}`} icon={<UserPlus size={20} />} tone="green" />
            <StatCard label="Açık oda" value={fmtNumber(data.live.activeRooms)} note={`Sesli ${data.live.audioRooms} · Görüntülü ${data.live.videoRooms}`} icon={<Radio size={20} />} tone="blue" />
            <StatCard label="Odadaki kişi" value={fmtNumber(data.live.roomMembers)} note={`Mikrofonda: ${fmtNumber(data.live.onMic)}`} icon={<Mic size={20} />} />
            <StatCard label="Bugün hediye" value={fmtNumber(data.today.gifts)} note={`${fmtNumber(data.today.giftCoins)} Coin`} icon={<Gift size={20} />} />
            <StatCard label="Bugün mesaj" value={fmtNumber(data.today.roomMessages)} note={`Özel mesaj: ${fmtNumber(data.today.directMessages)}`} icon={<Activity size={20} />} tone="blue" />
            <StatCard
              label="Açık şikâyet"
              value={fmtNumber(data.alerts.openReports)}
              note={`Bugün ihlal: ${data.today.strikes} · otomatik susturma: ${data.today.autoMutes}`}
              icon={<AlertTriangle size={20} />}
              tone={data.alerts.openReports > 0 ? "red" : "green"}
            />
            <StatCard label="Uygulama hatası (24 sa)" value={fmtNumber(data.alerts.errors24h)} icon={<AlertTriangle size={20} />} tone={data.alerts.errors24h > 0 ? "red" : "green"} />
          </div>

          <Card title="Sunucu durumu" subtitle={`Son güncelleme: ${new Date(data.time).toLocaleTimeString("tr-TR")}`}>
            <div className="grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Sunucu sürümü", data.server.version],
                ["Çalışma süresi", uptime(data.server.uptimeSec)],
                ["İşlemci", `%${data.server.cpuPercent} · ${data.server.cores} çekirdek`],
                ["Bellek", `${data.server.memory.rssMb} MB · boş ${data.server.host.freeMb}/${data.server.host.totalMb} MB`],
                ["Veritabanı", `${data.db.latencyMs} ms · ${data.db.sizeMb} MB (medya ${data.db.mediaMb} MB)`],
                ["Ses/görüntü sunucusu", data.livekit?.ok === false ? "Erişilemiyor" : data.livekit?.ok ? `Çalışıyor${data.livekit.latencyMs != null ? ` · ${data.livekit.latencyMs} ms` : ""}` : "—"],
                ["Açık oturum", fmtNumber(data.live.sessions)],
                ["Çevrimiçi kullanıcı", fmtNumber(data.realtime?.onlineUsers ?? "—")],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-[#262117] bg-[#141210] p-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Server size={14} />
                    {k}
                  </div>
                  <p className="mt-2 font-semibold text-white">{v}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
