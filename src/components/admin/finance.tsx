"use client";

import { useState } from "react";
import Link from "next/link";
import { Coins, Plus } from "lucide-react";
import { api, fmtDate, fmtNumber, fmtMoney } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { Badge, Card, Empty, ErrorBox, Loading, PageHeader, inputCls, tableCls, tableWrap, tdCls, thCls } from "@/components/ui";
import { ActionMsg, Pager, Tabs, UserLink, btnGhost, btnSmall, roomHref, selectCls, useAction, type Brief } from "./kit";
import { AuditTable, GiftIcon, txTypeText } from "./user-history";

type TabKey = "actions" | "wallet" | "gifts" | "packages";

export default function AdminFinance() {
  const [tab, setTab] = useState<TabKey>("actions");
  return (
    <div>
      <PageHeader icon={<Coins size={18} />} kicker="Ekonomi" title="Mali kayıtlar" description="Yetkili işlemleri, Coin / Elmas hareketleri, hediye akışı ve Coin paketleri." />
      <Tabs
        tabs={[
          { key: "actions", label: "İşlem kaydı" },
          { key: "wallet", label: "Cüzdan hareketleri" },
          { key: "gifts", label: "Hediye akışı" },
          { key: "packages", label: "Coin paketleri" },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === "actions" && <Actions />}
      {tab === "wallet" && <Wallet />}
      {tab === "gifts" && <Gifts />}
      {tab === "packages" && <Packages />}
    </div>
  );
}

function Actions() {
  const [scope, setScope] = useState("");
  const { data, error, loading, reload } = useApi<{ actions: Parameters<typeof AuditTable>[0]["rows"] }>(`/api/admin/actions?limit=300${scope ? `&scope=${scope}` : ""}`);
  return (
    <Card
      title="İşlem kaydı"
      subtitle="Kim, ne zaman, kime, ne yaptı — son 300 kayıt"
      action={
        <select value={scope} onChange={(e) => setScope(e.target.value)} className={selectCls} aria-label="Kapsam">
          <option value="">Tümü</option>
          <option value="staff">Yetkili işlemleri</option>
          <option value="user">Sistem / kullanıcı işlemleri</option>
        </select>
      }
    >
      {loading && !data && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && data.actions.length === 0 && <Empty title="Kayıt yok" />}
      {data && data.actions.length > 0 && <AuditTable rows={data.actions} />}
    </Card>
  );
}

type WalletRow = { id: string; type: string; coins: string | null; diamonds: string | null; description: string | null; createdAt: string; user: Brief | null };

const signed = (v: string | null) => {
  if (v === null || v === "0") return <span className="text-gray-600">—</span>;
  const neg = v.startsWith("-");
  return <span className={neg ? "text-red-300" : "text-emerald-300"}>{neg ? "" : "+"}{fmtNumber(v)}</span>;
};

function Wallet() {
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useApi<{ page: number; hasMore: boolean; types: string[]; items: WalletRow[] }>(
    `/api/admin/wallet-transactions?page=${page}${type ? `&type=${type}` : ""}`
  );
  return (
    <Card
      title="Cüzdan hareketleri"
      subtitle="Platformdaki tüm Coin / Elmas hareketleri, en yeni üstte"
      action={
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
          className={selectCls}
          aria-label="Tür"
        >
          <option value="">Tüm türler</option>
          {Object.entries(txTypeText).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </select>
      }
    >
      {loading && !data && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && data.items.length === 0 && <Empty title="Hareket yok" />}
      {data && data.items.length > 0 && (
        <div className={tableWrap}>
          <table className={`${tableCls} min-w-[820px]`}>
            <thead>
              <tr>
                <th className={thCls}>Tarih</th>
                <th className={thCls}>Kullanıcı</th>
                <th className={thCls}>İşlem</th>
                <th className={`${thCls} text-right`}>Coin</th>
                <th className={`${thCls} text-right`}>Elmas</th>
                <th className={thCls}>Açıklama</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((x) => (
                <tr key={x.id}>
                  <td className={`${tdCls} whitespace-nowrap text-xs text-gray-400`}>{fmtDate(x.createdAt)}</td>
                  <td className={tdCls}>
                    <UserLink user={x.user} size={24} />
                  </td>
                  <td className={tdCls}>{txTypeText[x.type] ?? x.type}</td>
                  <td className={`${tdCls} text-right`}>{signed(x.coins)}</td>
                  <td className={`${tdCls} text-right`}>{signed(x.diamonds)}</td>
                  <td className={`${tdCls} max-w-[260px] truncate text-xs text-gray-400`} title={x.description ?? ""}>
                    {x.description ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && <Pager page={data.page} hasMore={data.hasMore} onPage={setPage} />}
    </Card>
  );
}

type GiftRow = {
  id: string;
  giftName: string;
  iconUrl: string | null;
  quantity: string;
  coins: string;
  createdAt: string;
  room: { id: string; name: string } | null;
  sender: Brief | null;
  receiver: Brief | null;
};

function Gifts() {
  const [min, setMin] = useState("0");
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useApi<{ page: number; hasMore: boolean; items: GiftRow[] }>(`/api/admin/gift-transactions?page=${page}&minCoins=${min}`);
  return (
    <Card
      title="Hediye akışı"
      subtitle="Tüm odalarda gönderilen hediyeler"
      action={
        <select
          value={min}
          onChange={(e) => {
            setMin(e.target.value);
            setPage(1);
          }}
          className={selectCls}
          aria-label="En az Coin"
        >
          <option value="0">Tüm hediyeler</option>
          <option value="1000">1.000+ Coin</option>
          <option value="10000">10.000+ Coin</option>
          <option value="100000">100.000+ Coin</option>
          <option value="1000000">1.000.000+ Coin</option>
        </select>
      }
    >
      {loading && !data && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && data.items.length === 0 && <Empty title="Hediye yok" />}
      {data && data.items.length > 0 && (
        <div className={tableWrap}>
          <table className={`${tableCls} min-w-[880px]`}>
            <thead>
              <tr>
                <th className={thCls}>Hediye</th>
                <th className={thCls}>Gönderen</th>
                <th className={thCls}>Alan</th>
                <th className={`${thCls} text-right`}>Coin</th>
                <th className={thCls}>Oda</th>
                <th className={thCls}>Tarih</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((g) => (
                <tr key={g.id}>
                  <td className={tdCls}>
                    <span className="inline-flex items-center gap-2">
                      <GiftIcon url={g.iconUrl} />
                      {g.giftName}
                      {g.quantity !== "1" ? ` ×${g.quantity}` : ""}
                    </span>
                  </td>
                  <td className={tdCls}>
                    <UserLink user={g.sender} size={24} />
                  </td>
                  <td className={tdCls}>
                    <UserLink user={g.receiver} size={24} />
                  </td>
                  <td className={`${tdCls} text-right font-medium`}>{fmtNumber(g.coins)}</td>
                  <td className={`${tdCls} text-xs`}>
                    {g.room ? (
                      <Link href={roomHref(g.room.id)} className="text-[#e5c77e] hover:underline">
                        {g.room.name}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className={`${tdCls} whitespace-nowrap text-xs text-gray-400`}>{fmtDate(g.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && <Pager page={data.page} hasMore={data.hasMore} onPage={setPage} />}
    </Card>
  );
}

type Pkg = { id: string; coins: string; priceCents: string; currency: string; isActive: boolean };

function Packages() {
  const { data, error, loading, reload } = useApi<{ packages: Pkg[] }>("/api/admin/coin-packages");
  const { busy, msg, run } = useAction();
  const [coins, setCoins] = useState("");
  const [price, setPrice] = useState("");
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <Card title="Coin paketleri" subtitle="Uygulamadaki Coin satın alma ekranında görünen paketler">
        <ActionMsg msg={msg} />
        {loading && !data && <Loading />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {data && data.packages.length === 0 && <Empty title="Paket yok" />}
        {data && data.packages.length > 0 && (
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {data.packages.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#262117] bg-[#141210] px-4 py-3">
                <span>
                  <span className="block font-semibold text-white">{fmtNumber(p.coins)} Coin</span>
                  <span className="text-xs text-gray-400">{fmtMoney(p.priceCents, p.currency)}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Badge tone={p.isActive ? "green" : "gray"}>{p.isActive ? "Satışta" : "Kapalı"}</Badge>
                  <button
                    type="button"
                    disabled={busy}
                    className={btnSmall}
                    onClick={() =>
                      run(p.isActive ? "Paket kapatıldı." : "Paket satışa açıldı.", async () => {
                        await api(`/api/admin/coin-packages/${p.id}/active`, { method: "POST", body: { isActive: !p.isActive } });
                        reload();
                      })
                    }
                  >
                    {p.isActive ? "Kapat" : "Aç"}
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card title="Yeni paket">
        <div className="space-y-3">
          <input value={coins} onChange={(e) => setCoins(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="Coin (ör. 10000)" className={inputCls} aria-label="Coin" />
          <input value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="Fiyat, kuruş (ör. 9999 = 99,99)" className={inputCls} aria-label="Fiyat" />
          <button
            type="button"
            disabled={busy}
            className={`${btnGhost} w-full`}
            onClick={() =>
              run("Paket eklendi.", async () => {
                if (!coins || !price) throw new Error("Coin ve fiyat girin.");
                await api("/api/admin/coin-packages", { method: "POST", body: { coins, priceCents: price } });
                setCoins("");
                setPrice("");
                reload();
              })
            }
          >
            <Plus size={15} /> Ekle
          </button>
          <p className="text-xs text-gray-500">Google Play'de satış için ürünün Play Console'da da tanımlı olması gerekir.</p>
        </div>
      </Card>
    </div>
  );
}
