"use client";

import { useEffect, useState } from "react";
import { Save, Settings } from "lucide-react";
import { api, API_BASE, fmtMoney, fmtNumber, getSession } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { Card, ErrorBox, Loading, PageHeader, inputCls, tableCls, tableWrap, tdCls, thCls } from "@/components/ui";
import { ActionMsg, Field, Tabs, btnSmall, selectCls, useAction } from "./kit";

type Config = Record<string, string | number | boolean>;

type FieldDef = { key: string; label: string; hint?: string; kind: "text" | "multiline" | "int" | "bool" };
const GROUPS: { title: string; note?: string; fields: FieldDef[] }[] = [
  {
    title: "Uygulama sürümü ve güncelleme",
    fields: [
      { key: "latestAppVersion", label: "Son uygulama sürümü", hint: "ör. 2.70.0 — 'yeni sürüm var' bilgisi için.", kind: "text" },
      { key: "minAppVersion", label: "En düşük uygulama sürümü", hint: "Bunun altındaki uygulamalar güncelleme ekranına düşer. 0.0.0 = kapalı. Telefonunuzdaki sürümden yüksek yazmayın!", kind: "text" },
      { key: "updateUrl", label: "Güncelleme adresi", hint: "Google Play bağlantısı (https://...)", kind: "text" },
      { key: "updateMessage", label: "Güncelleme mesajı", kind: "multiline" },
    ],
  },
  {
    title: "Odalar",
    fields: [
      { key: "roomNotice", label: "Oda giriş duyurusu", hint: "Odaya girince sohbetin başında görünen kurallar yazısı (boş = gösterilmez).", kind: "multiline" },
      { key: "flyTextCoins", label: "Uçan yazı ücreti (Coin)", hint: "0 = ücretsiz", kind: "int" },
    ],
  },
  {
    title: "Otomatik moderasyon",
    fields: [
      { key: "blockLinks", label: "Bağlantı paylaşımını engelle", kind: "bool" },
      { key: "blockPhones", label: "Telefon numarası paylaşımını engelle", kind: "bool" },
      { key: "strikeLimit", label: "Otomatik kısıt için ihlal sayısı", hint: "1-20", kind: "int" },
      { key: "strikeWindowMin", label: "İhlal penceresi (dakika)", hint: "1-1440", kind: "int" },
      { key: "muteMinutes", label: "İlk kısıt süresi (dakika)", hint: "24 saat içinde tekrarlarsa ikiye katlanır.", kind: "int" },
      { key: "maxMuteMinutes", label: "En uzun kısıt (dakika)", hint: "1-10080", kind: "int" },
    ],
  },
  {
    title: "Şanslı hediye",
    note: "Geri dönüş (RTP) + alıcı payı en fazla %95 olabilir. Baz puan: 7000 = %70.",
    fields: [
      { key: "luckyEnabled", label: "Şanslı hediye açık", kind: "bool" },
      { key: "luckyRtpBps", label: "Gönderene ortalama geri dönüş (baz puan)", hint: "0-9000", kind: "int" },
      { key: "luckyReceiverBps", label: "Alıcıya geçen Elmas payı (baz puan)", hint: "0-5000", kind: "int" },
      { key: "luckyMaxWin", label: "Tek gönderimde en fazla kazanç (Coin)", kind: "int" },
      { key: "luckyAnnounceMultiplier", label: "Herkese duyurulan en düşük çarpan", hint: "10-500", kind: "int" },
    ],
  },
];

type TabKey = "app" | "agency" | "events";

export default function AdminSettings() {
  const isAdmin = getSession("admin")?.user.systemRole === "admin";
  const [tab, setTab] = useState<TabKey>("app");
  return (
    <div>
      <PageHeader icon={<Settings size={18} />} kicker="Güvenli yapılandırma" title="Ayarlar" description="Uygulama, moderasyon, şanslı hediye, ajans ve haftalık etkinlik ayarları. Tüm değişiklikler işlem kaydına yazılır." />
      {!isAdmin ? (
        <ErrorBox message="Ayarlar yalnızca yöneticiye açıktır." />
      ) : (
        <>
          <Tabs
            tabs={[
              { key: "app", label: "Uygulama" },
              { key: "agency", label: "Ajans ve maaş" },
              { key: "events", label: "Haftalık etkinlikler" },
            ]}
            value={tab}
            onChange={setTab}
          />
          {tab === "app" && <AppConfig />}
          {tab === "agency" && <AgencyConfig />}
          {tab === "events" && <WeeklyEvents />}
        </>
      )}
    </div>
  );
}

function AppConfig() {
  const { data, error, loading, reload } = useApi<{ config: Config; defaults: Config }>("/api/admin/app-config");
  const [form, setForm] = useState<Config>({});
  const { busy, msg, run } = useAction();

  useEffect(() => {
    if (data) setForm({ ...data.config });
  }, [data]);

  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  if (!data) return null;

  const save = () =>
    run("Ayarlar kaydedildi.", async () => {
      const patch: Config = {};
      for (const g of GROUPS)
        for (const f of g.fields) {
          const before = data.config[f.key];
          let v = form[f.key];
          if (f.kind === "int") {
            const n = Number(v);
            if (!Number.isInteger(n)) throw new Error(`${f.label}: tam sayı olmalı.`);
            v = n;
          } else if (f.kind === "text" || f.kind === "multiline") v = String(v ?? "").trim();
          if (v !== before) patch[f.key] = v;
        }
      if (!Object.keys(patch).length) throw new Error("Değişiklik yok.");
      if (typeof patch.minAppVersion === "string" && patch.minAppVersion !== "0.0.0" && !window.confirm(`En düşük sürüm ${patch.minAppVersion} yapılacak. Bu sürümün altındaki TÜM uygulamalar güncelleme ekranına düşer. Emin misiniz?`)) return false;
      await api("/api/admin/app-config", { method: "PUT", body: patch });
      reload();
    });

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        {GROUPS.map((g) => (
          <Card key={g.title} title={g.title} subtitle={g.note}>
            <div className="space-y-4">
              {g.fields.map((f) =>
                f.kind === "bool" ? (
                  <label key={f.key} className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#262117] bg-[#141210] px-4 py-3">
                    <span className="text-sm text-gray-200">{f.label}</span>
                    <input type="checkbox" checked={Boolean(form[f.key])} onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })} className="h-4 w-4 accent-[#d7b56d]" />
                  </label>
                ) : (
                  <Field key={f.key} label={f.label} hint={f.hint}>
                    {f.kind === "multiline" ? (
                      <textarea value={String(form[f.key] ?? "")} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} rows={3} className={inputCls} />
                    ) : (
                      <input
                        value={String(form[f.key] ?? "")}
                        onChange={(e) => setForm({ ...form, [f.key]: f.kind === "int" ? e.target.value.replace(/[^\d]/g, "") : e.target.value })}
                        inputMode={f.kind === "int" ? "numeric" : undefined}
                        className={inputCls}
                      />
                    )}
                  </Field>
                )
              )}
            </div>
          </Card>
        ))}
      </div>
      <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-2xl border border-[#4b3c22] bg-[#15120c]/95 p-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <ActionMsg msg={msg} />
          {!msg && <p className="text-xs text-gray-400">Sunucu: <span className="break-all font-mono">{API_BASE}</span></p>}
        </div>
        <button type="button" disabled={busy} onClick={save} className="gold-button shrink-0 px-8 disabled:opacity-60 sm:w-auto">
          <Save size={16} /> {busy ? "Kaydediliyor..." : "Tümünü kaydet"}
        </button>
      </div>
    </div>
  );
}

type AgencyCfg = {
  settings: Record<string, string | number | boolean>;
  payLevels: { level: number; days: number; hours: number; gameHours: number; diamonds: string; salary1Cents: string; salary2Cents: string; agencyCents: string; vipLevel: number | null; vipDays: number | null; badge: string | null }[];
  agencyGrades: { name: string; min: string }[];
};

const AGENCY_FIELDS: FieldDef[] = [
  { key: "validDayMinutes", label: "Geçerli gün için en az yayın (dakika)", kind: "int" },
  { key: "penaltyBps", label: "Etkinlik şartı ceza oranı (baz puan)", kind: "int" },
  { key: "minEventCount", label: "Zorunlu resmi etkinlik sayısı", kind: "int" },
  { key: "maxAssistants", label: "Ajans başına en fazla asistan", kind: "int" },
  { key: "maxAssistantBps", label: "Asistan payı üst sınırı (baz puan)", kind: "int" },
  { key: "referralBps", label: "Davet primi (baz puan)", kind: "int" },
  { key: "transferWaitHours", label: "Transfer bekleme süresi (saat)", kind: "int" },
  { key: "requireOfficialEvents", label: "Resmi etkinlik şartı", kind: "bool" },
  { key: "requireGameHours", label: "Oyun saati şartı", kind: "bool" },
  { key: "allowBalanceMethod", label: "Yöntem 2 (bakiyeden maaş) açık", kind: "bool" },
];

function AgencyConfig() {
  const { data, error, loading, reload } = useApi<{ config: AgencyCfg }>("/api/admin/agency-config");
  const [form, setForm] = useState<Record<string, string | number | boolean>>({});
  const { busy, msg, run } = useAction();
  useEffect(() => {
    if (data) setForm({ ...data.config.settings });
  }, [data]);
  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  if (!data) return null;
  const cur = String(data.config.settings.currency ?? "USD");
  const save = () =>
    run("Ajans ayarları kaydedildi.", async () => {
      const s: Record<string, string | number | boolean> = {};
      for (const f of AGENCY_FIELDS) {
        let v = form[f.key];
        if (f.kind === "int") {
          const n = Number(v);
          if (!Number.isInteger(n)) throw new Error(`${f.label}: tam sayı olmalı.`);
          v = n;
        }
        if (v !== data.config.settings[f.key]) s[f.key] = v;
      }
      if (form.cycle !== data.config.settings.cycle) s.cycle = String(form.cycle);
      if (form.currency !== data.config.settings.currency) s.currency = String(form.currency).toUpperCase();
      if (!Object.keys(s).length) throw new Error("Değişiklik yok.");
      if (s.cycle && !window.confirm("Dönem türü değişecek. Açık dönemin hesapları etkilenebilir. Emin misiniz?")) return false;
      await api("/api/admin/agency-config", { method: "PUT", body: { settings: s } });
      reload();
    });
  return (
    <div className="space-y-6">
      <Card title="Genel ajans ayarları">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Dönem türü">
            <select value={String(form.cycle ?? "monthly")} onChange={(e) => setForm({ ...form, cycle: e.target.value })} className={`${selectCls} w-full`}>
              <option value="monthly">Aylık</option>
              <option value="weekly">Haftalık</option>
            </select>
          </Field>
          <Field label="Para birimi" hint="3 harf (USD, TRY, EUR)">
            <input value={String(form.currency ?? "")} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase().slice(0, 3) })} className={inputCls} />
          </Field>
          {AGENCY_FIELDS.map((f) =>
            f.kind === "bool" ? (
              <label key={f.key} className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#262117] bg-[#141210] px-4 py-3">
                <span className="text-sm text-gray-200">{f.label}</span>
                <input type="checkbox" checked={Boolean(form[f.key])} onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })} className="h-4 w-4 accent-[#d7b56d]" />
              </label>
            ) : (
              <Field key={f.key} label={f.label}>
                <input value={String(form[f.key] ?? "")} onChange={(e) => setForm({ ...form, [f.key]: e.target.value.replace(/[^\d]/g, "") })} inputMode="numeric" className={inputCls} />
              </Field>
            )
          )}
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button type="button" disabled={busy} onClick={save} className="gold-button disabled:opacity-60 sm:w-auto sm:px-8">
            <Save size={16} /> Kaydet
          </button>
          <ActionMsg msg={msg} />
        </div>
      </Card>
      <Card title="Yayıncı maaş tablosu" subtitle="Tabloyu düzenlemek için uygulamadaki yönetim panelini kullanın">
        <div className={tableWrap}>
          <table className={`${tableCls} min-w-[760px]`}>
            <thead>
              <tr>
                <th className={thCls}>Seviye</th>
                <th className={thCls}>Gün / saat</th>
                <th className={thCls}>Elmas</th>
                <th className={thCls}>Maaş 1</th>
                <th className={thCls}>Maaş 2</th>
                <th className={thCls}>Ajans</th>
                <th className={thCls}>Ödül</th>
              </tr>
            </thead>
            <tbody>
              {data.config.payLevels.map((l) => (
                <tr key={l.level}>
                  <td className={tdCls}>{l.level}</td>
                  <td className={tdCls}>
                    {l.days} gün · {l.hours} sa{l.gameHours ? ` · oyun ${l.gameHours} sa` : ""}
                  </td>
                  <td className={tdCls}>{fmtNumber(l.diamonds)}</td>
                  <td className={tdCls}>{fmtMoney(l.salary1Cents, cur)}</td>
                  <td className={tdCls}>{fmtMoney(l.salary2Cents, cur)}</td>
                  <td className={tdCls}>{fmtMoney(l.agencyCents, cur)}</td>
                  <td className={`${tdCls} text-xs text-gray-400`}>
                    {[l.vipLevel ? `WIP ${l.vipLevel} · ${l.vipDays} gün` : "", l.badge ?? ""].filter(Boolean).join(" · ") || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.config.agencyGrades.length > 0 && (
          <p className="mt-4 text-xs text-gray-500">Ajans dereceleri: {data.config.agencyGrades.map((g) => `${g.name} (${fmtNumber(g.min)}+)`).join(" · ")}</p>
        )}
      </Card>
    </div>
  );
}

type WeeklyEvent = { kind: string; title: string; enabled: boolean; isStar: boolean; gift: { id: string; name: string } | null; rules: string };

function WeeklyEvents() {
  const { data, error, loading, reload } = useApi<{ events: WeeklyEvent[] }>("/api/admin/weekly-events");
  const { busy, msg, run } = useAction();
  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  if (!data) return null;
  return (
    <Card title="Haftalık etkinlikler" subtitle="Ödül ve kuralları uygulamadaki yönetim panelinden düzenleyin">
      <ActionMsg msg={msg} />
      <ul className="mt-2 grid gap-2 md:grid-cols-2">
        {data.events.map((e) => (
          <li key={e.kind} className="flex items-center justify-between gap-3 rounded-xl border border-[#262117] bg-[#141210] px-4 py-3">
            <span className="min-w-0">
              <span className="block font-medium text-white">{e.title}</span>
              <span className="block text-xs text-gray-500">{e.isStar ? `Yıldız hediyesi: ${e.gift?.name ?? "seçilmedi"}` : e.kind}</span>
            </span>
            <button
              type="button"
              disabled={busy}
              className={btnSmall}
              onClick={() =>
                run(e.enabled ? `${e.title} kapatıldı.` : `${e.title} açıldı.`, async () => {
                  await api(`/api/admin/weekly-events/${e.kind}`, { method: "PUT", body: { enabled: !e.enabled } });
                  reload();
                })
              }
            >
              {e.enabled ? "Açık · kapat" : "Kapalı · aç"}
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
