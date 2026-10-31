"use client";

import { useState } from "react";
import { BellRing, ImagePlus, Megaphone, Send, Trash2 } from "lucide-react";
import { absoluteUrl, api, apiUpload, fmtDate } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { Badge, Card, Empty, ErrorBox, Loading, PageHeader, inputCls } from "@/components/ui";
import { ActionMsg, Field, Tabs, btnGhost, btnSmall, selectCls, useAction } from "./kit";

type TabKey = "push" | "announcements" | "banners";

export default function AdminAnnouncements() {
  const [tab, setTab] = useState<TabKey>("push");
  return (
    <div>
      <PageHeader icon={<Megaphone size={18} />} kicker="İletişim" title="Duyuru ve bildirimler" description="Herkese telefon bildirimi gönderin, Mesajlar ekranındaki duyuru kartlarını ve ana sayfa bannerlarını yönetin." />
      <Tabs
        tabs={[
          { key: "push", label: "Telefon bildirimi" },
          { key: "announcements", label: "Duyuru kartları" },
          { key: "banners", label: "Bannerlar" },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === "push" && <Push />}
      {tab === "announcements" && <Announcements />}
      {tab === "banners" && <Banners />}
    </div>
  );
}

function Push() {
  const { data, error, loading, reload } = useApi<{ messages: { id: string; title: string; body: string; createdAt: string }[] }>("/api/admin/push");
  const { busy, msg, run } = useAction();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">
      <Card title="Herkese bildirim gönder">
        <div className="space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder="Başlık" className={inputCls} aria-label="Başlık" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={300} rows={4} placeholder="Mesaj (en fazla 300 karakter)" className={inputCls} aria-label="Mesaj" />
          <p className="text-right text-xs text-gray-500">{body.length}/300</p>
          <button
            type="button"
            disabled={busy}
            className="gold-button w-full disabled:opacity-60"
            onClick={() =>
              run("Bildirim gönderildi.", async () => {
                if (title.trim().length < 2 || body.trim().length < 2) throw new Error("Başlık ve mesaj yazın.");
                if (!window.confirm("Bu bildirim uygulaması yüklü HERKESE gidecek. Gönderilsin mi?")) return false;
                await api("/api/admin/push", { method: "POST", body: { title: title.trim(), body: body.trim() } });
                setTitle("");
                setBody("");
                reload();
              })
            }
          >
            <Send size={16} /> Gönder
          </button>
          <ActionMsg msg={msg} />
          <p className="text-xs text-gray-500">Açık uygulamalara anında; kapalı olanlara uygulama açılınca düşer. Saatte en fazla 20 bildirim.</p>
        </div>
      </Card>
      <Card title="Gönderilenler" subtitle="Son 30">
        {loading && !data && <Loading />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {data && data.messages.length === 0 && <Empty title="Henüz bildirim yok" />}
        {data && data.messages.length > 0 && (
          <ul className="space-y-2">
            {data.messages.map((m) => (
              <li key={m.id} className="rounded-xl border border-[#262117] bg-[#141210] px-4 py-3">
                <p className="flex items-center gap-2 font-medium text-white">
                  <BellRing size={14} className="text-[#d7b56d]" />
                  {m.title}
                </p>
                <p className="mt-1 text-sm text-gray-300">{m.body}</p>
                <p className="mt-1 text-xs text-gray-500">{fmtDate(m.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

const kindText: Record<string, string> = { team: "Ekip", event: "Etkinlik", reward: "Ödül" };

function ImagePick({ endpoint, value, onChange }: { endpoint: string; value: string; onChange: (url: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const src = absoluteUrl(value);
  return (
    <div className="space-y-2">
      <label className={`${btnGhost} cursor-pointer`}>
        <ImagePlus size={15} /> {busy ? "Yükleniyor..." : value ? "Görseli değiştir" : "Görsel yükle"}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          disabled={busy}
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            setBusy(true);
            setErr("");
            try {
              const r = await apiUpload(endpoint, f);
              onChange(r.url);
            } catch (x) {
              setErr(x instanceof Error ? x.message : "Yüklenemedi.");
            } finally {
              setBusy(false);
            }
          }}
        />
      </label>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src && <img src={src} alt="" className="max-h-40 rounded-xl border border-[#30291e] object-contain" />}
      {err && <p className="text-xs text-red-300">{err}</p>}
    </div>
  );
}

function Announcements() {
  const { data, error, loading, reload } = useApi<{ announcements: { id: string; kind: string; title: string; text: string; imageUrl: string | null; linkUrl: string | null; createdAt: string }[] }>(
    "/api/announcements"
  );
  const { busy, msg, run } = useAction();
  const [kind, setKind] = useState("team");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [img, setImg] = useState("");
  const [link, setLink] = useState("");
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <Card title="Yeni duyuru kartı" subtitle="Uygulamada Mesajlar → Ekip / Etkinlik / Ödül">
        <div className="space-y-3">
          <select value={kind} onChange={(e) => setKind(e.target.value)} className={`${selectCls} w-full`} aria-label="Tür">
            <option value="team">Ekip duyurusu</option>
            <option value="event">Etkinlik</option>
            <option value="reward">Ödül</option>
          </select>
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder="Başlık" className={inputCls} aria-label="Başlık" />
          <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} rows={5} placeholder="Metin" className={inputCls} aria-label="Metin" />
          <ImagePick endpoint="/api/admin/announcements/image" value={img} onChange={setImg} />
          <Field label="Bağlantı (isteğe bağlı, https://)">
            <input value={link} onChange={(e) => setLink(e.target.value.trim())} className={inputCls} />
          </Field>
          <button
            type="button"
            disabled={busy}
            className="gold-button w-full disabled:opacity-60"
            onClick={() =>
              run("Duyuru yayınlandı.", async () => {
                if (title.trim().length < 2 || !text.trim()) throw new Error("Başlık ve metin yazın.");
                await api("/api/admin/announcements", { method: "POST", body: { kind, title: title.trim(), text: text.trim(), imageUrl: img || undefined, linkUrl: link || undefined } });
                setTitle("");
                setText("");
                setImg("");
                setLink("");
                reload();
              })
            }
          >
            Yayınla
          </button>
          <ActionMsg msg={msg} />
        </div>
      </Card>
      <Card title="Yayındaki duyurular" subtitle="Son 50">
        {loading && !data && <Loading />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {data && data.announcements.length === 0 && <Empty title="Duyuru yok" />}
        {data && data.announcements.length > 0 && (
          <ul className="space-y-2">
            {data.announcements.map((a) => (
              <li key={a.id} className="flex gap-3 rounded-xl border border-[#262117] bg-[#141210] p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {a.imageUrl && <img src={absoluteUrl(a.imageUrl) ?? ""} alt="" className="h-16 w-24 shrink-0 rounded-lg object-cover" />}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{kindText[a.kind] ?? a.kind}</Badge>
                    <span className="font-medium text-white">{a.title}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-300">{a.text}</p>
                  <p className="mt-1 text-xs text-gray-500">{fmtDate(a.createdAt)}</p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  className={`${btnSmall} self-start`}
                  aria-label="Duyuruyu sil"
                  onClick={() =>
                    run("Duyuru silindi.", async () => {
                      if (!window.confirm(`"${a.title}" duyurusu silinsin mi?`)) return false;
                      await api(`/api/admin/announcements/${a.id}`, { method: "DELETE" });
                      reload();
                    })
                  }
                >
                  <Trash2 size={13} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Banners() {
  const { data, error, loading, reload } = useApi<{ banners: { id: string; imageUrl: string; title: string | null; linkUrl: string | null; sortOrder: number; active: boolean }[] }>("/api/admin/banners");
  const { busy, msg, run } = useAction();
  const [img, setImg] = useState("");
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [order, setOrder] = useState("0");
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">
      <Card title="Yeni banner" subtitle="Ana sayfadaki kayan görseller">
        <div className="space-y-3">
          <ImagePick endpoint="/api/admin/banners/image" value={img} onChange={setImg} />
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder="Başlık (isteğe bağlı)" className={inputCls} aria-label="Başlık" />
          <input value={link} onChange={(e) => setLink(e.target.value.trim())} placeholder="Bağlantı (isteğe bağlı, https://)" className={inputCls} aria-label="Bağlantı" />
          <Field label="Sıra (küçük olan önce)">
            <input value={order} onChange={(e) => setOrder(e.target.value.replace(/[^\d-]/g, ""))} inputMode="numeric" className={inputCls} />
          </Field>
          <button
            type="button"
            disabled={busy}
            className="gold-button w-full disabled:opacity-60"
            onClick={() =>
              run("Banner eklendi.", async () => {
                if (!img) throw new Error("Önce bir görsel yükleyin.");
                await api("/api/admin/banners", { method: "POST", body: { imageUrl: img, title: title.trim() || null, linkUrl: link || null, sortOrder: Number(order) || 0 } });
                setImg("");
                setTitle("");
                setLink("");
                reload();
              })
            }
          >
            Ekle
          </button>
          <ActionMsg msg={msg} />
        </div>
      </Card>
      <Card title="Bannerlar">
        {loading && !data && <Loading />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {data && data.banners.length === 0 && <Empty title="Banner yok" />}
        {data && data.banners.length > 0 && (
          <ul className="grid gap-3 md:grid-cols-2">
            {data.banners.map((b) => (
              <li key={b.id} className="overflow-hidden rounded-xl border border-[#262117] bg-[#141210]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={absoluteUrl(b.imageUrl) ?? ""} alt="" className={`aspect-[3/1] w-full object-cover ${b.active ? "" : "opacity-40"}`} />
                <div className="flex items-center justify-between gap-2 p-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-white">{b.title || "Başlıksız"}</span>
                    <span className="block truncate text-xs text-gray-500">
                      Sıra {b.sortOrder}
                      {b.linkUrl ? ` · ${b.linkUrl}` : ""}
                    </span>
                  </span>
                  <span className="flex shrink-0 gap-1.5">
                    <button
                      type="button"
                      disabled={busy}
                      className={btnSmall}
                      onClick={() =>
                        run(b.active ? "Banner gizlendi." : "Banner yayında.", async () => {
                          await api(`/api/admin/banners/${b.id}`, { method: "PATCH", body: { active: !b.active } });
                          reload();
                        })
                      }
                    >
                      {b.active ? "Gizle" : "Yayınla"}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      className={btnSmall}
                      aria-label="Banner sil"
                      onClick={() =>
                        run("Banner silindi.", async () => {
                          if (!window.confirm("Banner silinsin mi?")) return false;
                          await api(`/api/admin/banners/${b.id}`, { method: "DELETE" });
                          reload();
                        })
                      }
                    >
                      <Trash2 size={13} />
                    </button>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
