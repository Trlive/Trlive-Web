"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Save, Settings } from "lucide-react";
import { api, API_BASE, getSession } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { Card, ErrorBox, Loading, Notice, PageHeader, inputCls } from "@/components/ui";

type Config = Record<string, unknown>;

const FIELDS: { key: string; label: string; hint: string; multiline?: boolean }[] = [
  { key: "latestAppVersion", label: "Son uygulama sürümü", hint: "ör. 2.69.0 — kullanıcılara 'yeni sürüm var' bilgisi için." },
  { key: "minAppVersion", label: "En düşük uygulama sürümü", hint: "Bunun altındaki uygulamalar güncelleme ekranına düşer. 0.0.0 = kapalı. Kendi uygulamanızın sürümünden yüksek yazmayın!" },
  { key: "updateUrl", label: "Güncelleme adresi", hint: "Google Play bağlantısı (https://...)" },
  { key: "updateMessage", label: "Güncelleme mesajı", hint: "Güncelleme ekranında görünen yazı.", multiline: true },
  { key: "roomNotice", label: "Oda giriş duyurusu", hint: "Odaya girince sohbetin başında görünen kurallar yazısı.", multiline: true },
];

export default function AdminSettings() {
  const isAdmin = getSession("admin")?.user.systemRole === "admin";
  const { data, error, loading, reload } = useApi<{ config: Config }>(isAdmin ? "/api/admin/app-config" : null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!data) return;
    const next: Record<string, string> = {};
    for (const f of FIELDS) next[f.key] = String(data.config[f.key] ?? "");
    setForm(next);
  }, [data]);

  async function save() {
    if (!data || busy) return;
    const patch: Record<string, string> = {};
    for (const f of FIELDS) {
      const before = String(data.config[f.key] ?? "");
      // Boş güncelleme adresi "" olarak gönderilir (sunucu metin bekler; uygulamadaki yönetim ekranı da böyle yapar).
      if (form[f.key] !== before) patch[f.key] = form[f.key].trim();
    }
    if (Object.keys(patch).length === 0) {
      setMsg({ tone: "ok", text: "Değişiklik yok." });
      return;
    }
    if (patch.minAppVersion && patch.minAppVersion !== "0.0.0" && !window.confirm(`En düşük sürüm ${patch.minAppVersion} yapılacak. Bu sürümün altındaki tüm uygulamalar güncelleme ekranına düşer. Emin misiniz?`)) return;
    setBusy(true);
    setMsg(null);
    try {
      await api("/api/admin/app-config", { method: "PUT", body: patch });
      setMsg({ tone: "ok", text: "Ayarlar kaydedildi." });
      reload();
    } catch (e) {
      setMsg({ tone: "error", text: e instanceof Error ? e.message : "Kaydedilemedi." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader icon={<Settings size={18} />} kicker="Güvenli yapılandırma" title="Yönetim Ayarları" description="Uygulama sürümü, güncelleme ve oda duyurusu ayarları." />
      {!isAdmin && <ErrorBox message="Ayarlar yalnızca yöneticiye açıktır." />}
      {loading && !data && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && (
        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <Card title="Uygulama ayarları">
            <div className="space-y-5">
              {FIELDS.map((f) => (
                <label key={f.key} className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-300">{f.label}</span>
                  {f.multiline ? (
                    <textarea
                      value={form[f.key] ?? ""}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      rows={3}
                      className={inputCls}
                    />
                  ) : (
                    <input value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className={inputCls} />
                  )}
                  <span className="mt-1 block text-xs text-gray-500">{f.hint}</span>
                </label>
              ))}
              {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
              <button type="button" disabled={busy} onClick={save} className="gold-button w-full disabled:opacity-60">
                <Save size={16} />
                {busy ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </Card>
          <Card title="Bilgi">
            <div className="space-y-4 text-sm text-gray-400">
              <p>
                Sunucu: <span className="break-all font-mono text-xs text-gray-300">{API_BASE}</span>
              </p>
              <p className="flex gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-amber-200">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                Hediye fiyatları, maaş tablosu, şanslı hediye oranları gibi diğer ayarlar uygulamadaki yönetim panelinden yapılır.
              </p>
              <p>Tüm değişiklikler denetim kaydına yazılır (Coin İşlemleri sayfası).</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
