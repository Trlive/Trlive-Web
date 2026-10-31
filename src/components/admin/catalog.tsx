"use client";

import { useMemo, useState } from "react";
import { Gift, Pencil, Search } from "lucide-react";
import { api, fmtNumber } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { Badge, Card, Empty, ErrorBox, Loading, PageHeader, inputCls } from "@/components/ui";
import { ActionMsg, Tabs, btnSmall, selectCls, useAction } from "./kit";
import { GiftIcon } from "./user-history";

type GiftItem = { id: string; name: string; coinPrice: string; iconUrl: string | null; category: string; playMode: string; isActive: boolean };
type Frame = { id: string; name: string; imageUrl: string | null; isActive: boolean };
type StoreItem = { id: string; category: string; name: string; imageUrl: string | null; priceCoins: string; durationDays: number | null; isActive: boolean; forSale: boolean };

const giftTabText: Record<string, string> = { event: "Etkinlik", popular: "Popüler", private: "Özel", vip: "VIP", lucky: "Şanslı", cp: "CP" };
const storeCatText: Record<string, string> = {
  frame: "Çerçeve",
  chat_bubble: "Sohbet balonu",
  entrance_effect: "Giriş efekti",
  mini_card: "Mini kart",
  mic_wave: "Mikrofon dalgası",
  vehicle: "Araç",
  badge: "Madalya",
  room_card: "Oda kartı",
};

type TabKey = "gifts" | "store" | "frames";

export default function AdminCatalog() {
  const [tab, setTab] = useState<TabKey>("gifts");
  const catalog = useApi<{ gifts: GiftItem[]; frames: Frame[] }>("/api/admin/catalog");
  const store = useApi<{ items: StoreItem[] }>(tab === "store" ? "/api/admin/store/items" : null);
  const [q, setQ] = useState("");
  return (
    <div>
      <PageHeader icon={<Gift size={18} />} kicker="Ekonomi" title="Katalog" description="Hediyeler, mağaza ürünleri ve çerçeveler: fiyat, ad, sekme ve satış durumu. Yeni görsel yükleme uygulamadaki yönetim panelinden yapılır." />
      <Tabs
        tabs={[
          { key: "gifts", label: `Hediyeler${catalog.data ? ` (${catalog.data.gifts.length})` : ""}` },
          { key: "store", label: "Mağaza ürünleri" },
          { key: "frames", label: `Çerçeveler${catalog.data ? ` (${catalog.data.frames.length})` : ""}` },
        ]}
        value={tab}
        onChange={setTab}
      />
      <div className="relative mb-4 max-w-md">
        <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ada göre süz" className={`${inputCls} pl-10`} aria-label="Süz" />
      </div>
      {tab !== "store" && catalog.loading && !catalog.data && <Loading />}
      {tab !== "store" && catalog.error && <ErrorBox message={catalog.error} onRetry={catalog.reload} />}
      {tab === "gifts" && catalog.data && <Gifts items={catalog.data.gifts} q={q} onChanged={catalog.reload} />}
      {tab === "frames" && catalog.data && <Frames items={catalog.data.frames} q={q} onChanged={catalog.reload} />}
      {tab === "store" && (
        <>
          {store.loading && !store.data && <Loading />}
          {store.error && <ErrorBox message={store.error} onRetry={store.reload} />}
          {store.data && <Store items={store.data.items} q={q} onChanged={store.reload} />}
        </>
      )}
    </div>
  );
}

const match = (name: string, q: string) => !q || name.toLocaleLowerCase("tr-TR").includes(q.toLocaleLowerCase("tr-TR"));

function Gifts({ items, q, onChanged }: { items: GiftItem[]; q: string; onChanged: () => void }) {
  const list = useMemo(() => items.filter((g) => match(g.name, q)), [items, q]);
  if (list.length === 0) return <Card><Empty title="Hediye yok" /></Card>;
  return (
    <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
      {list.map((g) => (
        <GiftRow key={g.id} g={g} onChanged={onChanged} />
      ))}
    </div>
  );
}

function GiftRow({ g, onChanged }: { g: GiftItem; onChanged: () => void }) {
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(g.name);
  const [price, setPrice] = useState(g.coinPrice);
  const [cat, setCat] = useState(g.category);
  const [mode, setMode] = useState(g.playMode);
  const { busy, msg, run } = useAction();
  return (
    <div className={`rounded-xl border border-[#262117] bg-[#141210] p-4 ${g.isActive ? "" : "opacity-60"}`}>
      <div className="flex items-center gap-3">
        <GiftIcon url={g.iconUrl} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-white">{g.name}</p>
          <p className="text-xs text-gray-500">
            {fmtNumber(g.coinPrice)} Coin · {giftTabText[g.category] ?? g.category} · {g.playMode === "seat" ? "koltukta" : "tam ekran"}
          </p>
        </div>
        <Badge tone={g.isActive ? "green" : "gray"}>{g.isActive ? "Aktif" : "Kapalı"}</Badge>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <button type="button" className={btnSmall} onClick={() => setEdit((v) => !v)}>
          <Pencil size={12} /> Düzenle
        </button>
        <button
          type="button"
          disabled={busy}
          className={btnSmall}
          onClick={() =>
            run(g.isActive ? "Hediye kapatıldı." : "Hediye açıldı.", async () => {
              await api(`/api/admin/catalog/gifts/${g.id}/active`, { method: "POST", body: { isActive: !g.isActive } });
              onChanged();
            })
          }
        >
          {g.isActive ? "Kapat" : "Aç"}
        </button>
      </div>
      {edit && (
        <div className="mt-3 space-y-2">
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className={inputCls} aria-label="Ad" />
          <div className="grid grid-cols-3 gap-2">
            <input value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} inputMode="numeric" className={inputCls} aria-label="Fiyat" />
            <select value={cat} onChange={(e) => setCat(e.target.value)} className={selectCls} aria-label="Sekme">
              {Object.entries(giftTabText).map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </select>
            <select value={mode} onChange={(e) => setMode(e.target.value)} className={selectCls} aria-label="Oynatma">
              <option value="full">Tam ekran</option>
              <option value="seat">Koltukta</option>
            </select>
          </div>
          <button
            type="button"
            disabled={busy}
            className="gold-button disabled:opacity-60"
            onClick={() =>
              run("Hediye güncellendi.", async () => {
                if (!price || price === "0") throw new Error("Fiyat 0'dan büyük olmalı.");
                await api(`/api/admin/gifts/${g.id}/edit`, { method: "POST", body: { name: name.trim(), coinPrice: price, category: cat, playMode: mode } });
                setEdit(false);
                onChanged();
              })
            }
          >
            Kaydet
          </button>
        </div>
      )}
      <div className="mt-2">
        <ActionMsg msg={msg} />
      </div>
    </div>
  );
}

function Frames({ items, q, onChanged }: { items: Frame[]; q: string; onChanged: () => void }) {
  const list = useMemo(() => items.filter((f) => match(f.name, q)), [items, q]);
  const { busy, msg, run } = useAction();
  if (list.length === 0) return <Card><Empty title="Çerçeve yok" /></Card>;
  return (
    <Card>
      <ActionMsg msg={msg} />
      <ul className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {list.map((f) => (
          <li key={f.id} className={`flex items-center gap-3 rounded-xl border border-[#262117] bg-[#141210] px-3 py-2 ${f.isActive ? "" : "opacity-60"}`}>
            <GiftIcon url={f.imageUrl} />
            <span className="min-w-0 flex-1 truncate text-sm text-white">{f.name}</span>
            <button
              type="button"
              disabled={busy}
              className={btnSmall}
              onClick={() =>
                run("Çerçeve adı güncellendi.", async () => {
                  const n = window.prompt("Yeni ad", f.name);
                  if (n === null || !n.trim() || n.trim() === f.name) return false;
                  await api(`/api/admin/frames/${f.id}/edit`, { method: "POST", body: { name: n.trim() } });
                  onChanged();
                })
              }
            >
              <Pencil size={12} />
            </button>
            <button
              type="button"
              disabled={busy}
              className={btnSmall}
              onClick={() =>
                run(f.isActive ? "Çerçeve kapatıldı." : "Çerçeve açıldı.", async () => {
                  await api(`/api/admin/catalog/frames/${f.id}/active`, { method: "POST", body: { isActive: !f.isActive } });
                  onChanged();
                })
              }
            >
              {f.isActive ? "Kapat" : "Aç"}
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Store({ items, q, onChanged }: { items: StoreItem[]; q: string; onChanged: () => void }) {
  const [cat, setCat] = useState("");
  const list = useMemo(() => items.filter((s) => match(s.name, q) && (!cat || s.category === cat)), [items, q, cat]);
  return (
    <div>
      <select value={cat} onChange={(e) => setCat(e.target.value)} className={`${selectCls} mb-4`} aria-label="Kategori">
        <option value="">Tüm kategoriler</option>
        {Object.entries(storeCatText).map(([k, l]) => (
          <option key={k} value={k}>
            {l}
          </option>
        ))}
      </select>
      {list.length === 0 ? (
        <Card>
          <Empty title="Ürün yok" />
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {list.map((s) => (
            <StoreRow key={s.id} s={s} onChanged={onChanged} />
          ))}
        </div>
      )}
    </div>
  );
}

function StoreRow({ s, onChanged }: { s: StoreItem; onChanged: () => void }) {
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(s.name);
  const [price, setPrice] = useState(s.priceCoins);
  const [days, setDays] = useState(String(s.durationDays ?? 30));
  const [forSale, setForSale] = useState(s.forSale);
  const { busy, msg, run } = useAction();
  return (
    <div className={`rounded-xl border border-[#262117] bg-[#141210] p-4 ${s.isActive ? "" : "opacity-60"}`}>
      <div className="flex items-center gap-3">
        <GiftIcon url={s.imageUrl} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-white">{s.name}</p>
          <p className="text-xs text-gray-500">
            {storeCatText[s.category] ?? s.category} · {fmtNumber(s.priceCoins)} Coin · {s.durationDays ? `${s.durationDays} gün` : "süresiz"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge tone={s.isActive ? "green" : "gray"}>{s.isActive ? "Aktif" : "Kapalı"}</Badge>
          {s.isActive && !s.forSale && <Badge tone="gray">Satışta değil</Badge>}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <button type="button" className={btnSmall} onClick={() => setEdit((v) => !v)}>
          <Pencil size={12} /> Düzenle
        </button>
        <button
          type="button"
          disabled={busy}
          className={btnSmall}
          onClick={() =>
            run(s.isActive ? "Ürün kapatıldı." : "Ürün açıldı.", async () => {
              await api(`/api/admin/store/items/${s.id}/active`, { method: "POST", body: { isActive: !s.isActive } });
              onChanged();
            })
          }
        >
          {s.isActive ? "Kapat" : "Aç"}
        </button>
      </div>
      {edit && (
        <div className="mt-3 space-y-2">
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} className={inputCls} aria-label="Ad" />
          <div className="grid grid-cols-2 gap-2">
            <input value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} inputMode="numeric" className={inputCls} aria-label="Fiyat (Coin)" placeholder="Fiyat" />
            <input value={days} onChange={(e) => setDays(e.target.value.replace(/\D/g, ""))} inputMode="numeric" className={inputCls} aria-label="Süre (gün)" placeholder="Gün" />
          </div>
          {s.category !== "badge" && (
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={forSale} onChange={(e) => setForSale(e.target.checked)} className="accent-[#d7b56d]" />
              Mağazada satışta
            </label>
          )}
          <button
            type="button"
            disabled={busy}
            className="gold-button disabled:opacity-60"
            onClick={() =>
              run("Ürün güncellendi.", async () => {
                if (!days || days === "0") throw new Error("Süre en az 1 gün olmalı.");
                await api(`/api/admin/store/items/${s.id}/edit`, {
                  method: "POST",
                  body: { name: name.trim(), priceCoins: price || "0", durationDays: Number(days), ...(s.category !== "badge" ? { forSale } : {}) },
                });
                setEdit(false);
                onChanged();
              })
            }
          >
            Kaydet
          </button>
        </div>
      )}
      <div className="mt-2">
        <ActionMsg msg={msg} />
      </div>
    </div>
  );
}
