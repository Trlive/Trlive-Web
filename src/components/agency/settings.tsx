"use client";

import { useEffect, useState } from "react";
import { Building2, Megaphone, Settings } from "lucide-react";
import { api, fmtDate } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { Badge, Card, ErrorBox, Loading, Notice, PageHeader, inputCls } from "@/components/ui";
import { currentAgency } from "./common";

type Home = {
  role: string;
  agency: {
    id: string;
    name: string;
    agencyCode?: string | null;
    status: string;
    createdAt: string;
    announcement?: string | null;
    announcementAt?: string | null;
    assistantsCanAnnounce: boolean;
    broadcasterCount: number;
    owner?: { displayName?: string; publicId?: string } | null;
  };
  assistantCount: number;
};

const statusText: Record<string, [string, "green" | "gold" | "red" | "gray"]> = {
  active: ["Aktif", "green"],
  pending: ["Onay bekliyor", "gold"],
  suspended: ["Askıda", "red"],
};

export default function AgencySettings() {
  const ag = currentAgency();
  const { data, error, loading, reload } = useApi<Home>(ag.id ? `/api/agency-center/${ag.id}/home` : null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const owner = data?.role !== "assistant";
  const canAnnounce = owner || data?.agency.assistantsCanAnnounce === true;

  useEffect(() => {
    if (data) setText(data.agency.announcement ?? "");
  }, [data]);

  async function run(fn: () => Promise<unknown>, ok: string) {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    try {
      await fn();
      setMsg({ tone: "ok", text: ok });
      reload();
    } catch (e) {
      setMsg({ tone: "error", text: e instanceof Error ? e.message : "İşlem başarısız." });
    } finally {
      setBusy(false);
    }
  }

  const st = data ? statusText[data.agency.status] ?? [data.agency.status, "gray"] : null;
  return (
    <div>
      <PageHeader icon={<Settings size={18} />} kicker="Ajans" title="Ajans Bilgileri" description="Ajans bilgileri, duyuru ve asistan yetkileri." />
      {loading && !data && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && st && (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card title="Ajans" action={<Building2 size={18} className="text-[#d7b56d]" />}>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {[
                ["Ajans adı", data.agency.name],
                ["Ajans kodu", data.agency.agencyCode ?? "—"],
                ["Sahibi", `${data.agency.owner?.displayName ?? "—"}${data.agency.owner?.publicId ? ` (ID ${data.agency.owner.publicId})` : ""}`],
                ["Kuruluş", fmtDate(data.agency.createdAt, false)],
                ["Yayıncı", String(data.agency.broadcasterCount)],
                ["Asistan", String(data.assistantCount)],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-gray-500">{k}</dt>
                  <dd className="mt-1 font-semibold text-white">{v}</dd>
                </div>
              ))}
              <div>
                <dt className="text-xs text-gray-500">Durum</dt>
                <dd className="mt-1">
                  <Badge tone={st[1]}>{st[0]}</Badge>
                </dd>
              </div>
            </dl>
          </Card>

          <Card title="Ajans duyurusu" subtitle="Kaydedince ajansınızdaki tüm yayıncılara bildirim gider" action={<Megaphone size={18} className="text-[#d7b56d]" />}>
            <div className="space-y-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={200}
                rows={4}
                disabled={!canAnnounce}
                placeholder="Yayıncılarınıza duyuru (en fazla 200 karakter)"
                className={inputCls}
              />
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{text.length}/200</span>
                {data.agency.announcementAt && <span>Son değişiklik: {fmtDate(data.agency.announcementAt)}</span>}
              </div>
              {!canAnnounce && <p className="text-xs text-gray-500">Duyuruyu yalnızca ajans sahibi düzenleyebilir.</p>}
              <button
                type="button"
                disabled={busy || !canAnnounce}
                onClick={() => run(() => api(`/api/agency-center/${ag.id}/announcement`, { method: "POST", body: { text: text.trim() } }), "Duyuru kaydedildi.")}
                className="gold-button w-full disabled:opacity-60"
              >
                Duyuruyu kaydet
              </button>
            </div>
          </Card>

          {owner && (
            <Card title="Asistan yetkileri">
              <label className="flex items-center justify-between gap-4 text-sm text-gray-300">
                <span>Asistanlar ajans duyurusunu düzenleyebilsin</span>
                <input
                  type="checkbox"
                  checked={data.agency.assistantsCanAnnounce}
                  disabled={busy}
                  onChange={(e) =>
                    run(
                      () => api(`/api/agency-center/${ag.id}/settings`, { method: "POST", body: { assistantsCanAnnounce: e.target.checked } }),
                      "Ayar kaydedildi.",
                    )
                  }
                  className="h-5 w-5 accent-[#d7b56d]"
                />
              </label>
              <p className="mt-3 text-xs text-gray-500">Asistan davet etme, pay oranı ve ajans adı/logo değişiklikleri uygulamadaki Ajans Merkezi&apos;nden yapılır.</p>
            </Card>
          )}

          {msg && (
            <div className="xl:col-span-2">
              <Notice tone={msg.tone}>{msg.text}</Notice>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
