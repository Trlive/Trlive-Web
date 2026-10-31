"use client";

import { useState } from "react";
import { Ban, Coins, ShieldCheck, Trash2, Undo2, Users } from "lucide-react";
import { api, fmtDate, fmtNumber, getSession } from "@/lib/api";
import { Badge, Card, Notice, PageHeader, inputCls } from "@/components/ui";
import { Avatar, UserPicker, type AdminUser } from "./user-picker";

const roleText: Record<string, string> = { admin: "Yönetici", support: "Yardımcı admin", user: "Kullanıcı" };

function newKey() {
  return `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function AdminUsers() {
  const isAdmin = getSession("admin")?.user.systemRole === "admin";
  const [user, setUser] = useState<AdminUser | null>(null);
  const [hours, setHours] = useState("24");
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [coinReason, setCoinReason] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  // fn false dönerse (onay penceresinde vazgeçildi) başarı mesajı gösterilmez.
  async function run(label: string, fn: () => Promise<void | false>) {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await fn();
      if (r !== false) setMsg({ tone: "ok", text: label });
    } catch (e) {
      setMsg({ tone: "error", text: e instanceof Error ? e.message : "İşlem başarısız." });
    } finally {
      setBusy(false);
    }
  }

  async function refreshUser(u: AdminUser) {
    const r = await api<{ users: AdminUser[] }>(`/api/admin/users?q=${encodeURIComponent(u.publicId || u.id)}`);
    const fresh = r.users?.find((x) => x.id === u.id);
    if (fresh) setUser(fresh);
  }

  const ban = () =>
    run("Hesap banlandı.", async () => {
      if (!user) return;
      if (!reason.trim()) throw new Error("Ban nedeni yazın.");
      const h = hours === "0" ? null : Number(hours);
      await api(`/api/admin/users/${user.id}/ban`, { method: "POST", body: { hours: h, reason: reason.trim() } });
      setReason("");
      await refreshUser(user);
    });

  const unban = () =>
    run("Ban kaldırıldı.", async () => {
      if (!user) return;
      await api(`/api/admin/users/${user.id}/unban`, { method: "POST", body: {} });
      await refreshUser(user);
    });

  const coins = () =>
    run("Coin bakiyesi güncellendi.", async () => {
      if (!user) return;
      if (!/^-?\d{1,12}$/.test(amount.trim()) || amount.trim() === "0") throw new Error("Geçerli bir Coin miktarı girin (çıkarmak için eksi).");
      if (!window.confirm(`${user.displayName || user.username} hesabına ${amount} Coin ${Number(amount) < 0 ? "düşülecek" : "eklenecek"}. Onaylıyor musunuz?`)) return false;
      // Aynı isteğin iki kez işlenmemesi için tekrar koruması anahtarı.
      await api(`/api/admin/users/${user.id}/coins`, {
        method: "POST",
        body: { amount: amount.trim(), reason: coinReason.trim() || "Web paneli düzenlemesi" },
        headers: { "Idempotency-Key": newKey() },
      });
      setAmount("");
      setCoinReason("");
      await refreshUser(user);
    });

  // Hesabı sil: e-posta ile gelen silme talepleri ve 18 yaşından küçük olduğu anlaşılan hesaplar için (yalnızca yönetici).
  const removeAccount = () =>
    run("Hesap silindi.", async () => {
      if (!user) return false;
      if (deleteReason.trim().length < 3) throw new Error("Silme nedenini yazın (ör. e-posta ile silme talebi).");
      const typed = window.prompt(`${user.displayName || user.username} hesabı kalıcı olarak silinecek. Bu işlem geri alınamaz. Onay için SİL yazın.`);
      if (typed === null) return false;
      if (typed.trim().toLocaleUpperCase("tr-TR") !== "SİL") throw new Error("Onay metni hatalı; hesap silinmedi.");
      await api(`/api/admin/users/${user.id}/delete`, { method: "POST", body: { reason: deleteReason.trim() } });
      setDeleteReason("");
      await refreshUser(user);
    });

  return (
    <div>
      <PageHeader icon={<Users size={18} />} kicker="Kullanıcı yönetimi" title="Kullanıcılar" description="Kullanıcı arayın; ban, ban kaldırma, Coin ve hesap silme işlemlerini yapın." />
      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <Card title="Kullanıcı ara" subtitle="Kullanıcı adı, görünen ad veya ID ile">
          <UserPicker onPick={(u) => { setUser(u); setMsg(null); }} />
        </Card>

        <Card
          title="Seçili kullanıcı"
          action={
            <div className="flex items-center gap-2 rounded-xl border border-[#4b3c22] bg-[#17140e] px-3 py-2 text-xs text-[#d7b56d]">
              <ShieldCheck size={16} />
              {isAdmin ? "Yönetici yetkisi" : "Yardımcı admin yetkisi"}
            </div>
          }
        >
          {!user ? (
            <p className="py-10 text-center text-sm text-gray-500">Soldan bir kullanıcı seçin.</p>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar url={user.avatarUrl} name={user.displayName || user.username} size={56} />
                <div className="min-w-0">
                  <p className="truncate text-lg font-bold text-white">{user.displayName || user.username}</p>
                  <p className="text-sm text-gray-500">@{user.username} · ID {user.publicId ?? "—"}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge tone="gray">{roleText[user.systemRole ?? "user"] ?? user.systemRole}</Badge>
                    {user.accountStatus === "banned" ? (
                      <Badge tone="red">Banlı {user.bannedUntil ? `· ${fmtDate(user.bannedUntil)}'e kadar` : "· süresiz"}</Badge>
                    ) : user.accountStatus === "deleted" ? (
                      <Badge tone="gray">Silinmiş</Badge>
                    ) : (
                      <Badge tone="green">Aktif</Badge>
                    )}
                  </div>
                </div>
              </div>

              {isAdmin && user.coins !== undefined && (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-[#262117] bg-[#141210] p-3">
                    <p className="text-xs text-gray-500">Coin</p>
                    <p className="mt-1 font-bold text-white">{fmtNumber(user.coins)}</p>
                  </div>
                  <div className="rounded-xl border border-[#262117] bg-[#141210] p-3">
                    <p className="text-xs text-gray-500">Elmas</p>
                    <p className="mt-1 font-bold text-white">{fmtNumber(user.diamonds)}</p>
                  </div>
                </div>
              )}
              {user.banReason && <p className="text-sm text-gray-400">Ban nedeni: {user.banReason}</p>}

              {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}

              {user.accountStatus === "banned" ? (
                <button type="button" disabled={busy} onClick={unban} className="gold-button w-full disabled:opacity-60">
                  <Undo2 size={17} />
                  Banı kaldır
                </button>
              ) : user.accountStatus !== "deleted" ? (
                <div className="space-y-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-red-300">
                    <Ban size={16} />
                    Hesabı banla
                  </p>
                  <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
                    <select value={hours} onChange={(e) => setHours(e.target.value)} className={inputCls} aria-label="Ban süresi">
                      <option value="1">1 saat</option>
                      <option value="24">1 gün</option>
                      <option value="72">3 gün</option>
                      <option value="168">7 gün</option>
                      <option value="720">30 gün</option>
                      <option value="0">Süresiz</option>
                    </select>
                    <input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} placeholder="Neden (zorunlu)" className={inputCls} />
                  </div>
                  <button type="button" disabled={busy} onClick={ban} className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60">
                    Banla
                  </button>
                </div>
              ) : null}

              {isAdmin && user.accountStatus === "active" && (
                <div className="space-y-3 rounded-xl border border-[#30291e] p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-[#d7b56d]">
                    <Coins size={16} />
                    Coin ekle / düş
                  </p>
                  <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
                    <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="numeric" placeholder="ör. 1000 ya da -500" className={inputCls} />
                    <input value={coinReason} onChange={(e) => setCoinReason(e.target.value)} maxLength={300} placeholder="Açıklama (kayda geçer)" className={inputCls} />
                  </div>
                  <button type="button" disabled={busy} onClick={coins} className="gold-button w-full disabled:opacity-60">
                    Uygula
                  </button>
                  <p className="text-xs text-gray-500">Tüm Coin işlemleri mali denetim kaydına yazılır.</p>
                </div>
              )}

              {isAdmin && user.accountStatus !== "deleted" && user.systemRole !== "admin" && (
                <div className="space-y-3 rounded-xl border border-red-500/30 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-red-300">
                    <Trash2 size={16} />
                    Hesabı sil
                  </p>
                  <p className="text-xs leading-5 text-gray-500">
                    E-posta ile gelen silme talepleri veya 18 yaşından küçük olduğu anlaşılan hesaplar için. Kişisel bilgiler silinir;
                    ödeme ve güvenlik kayıtları yasal süre boyunca saklanır.
                  </p>
                  <input value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)} maxLength={300} placeholder="Silme nedeni (zorunlu, kayda geçer)" className={inputCls} />
                  <button type="button" disabled={busy} onClick={removeAccount} className="w-full rounded-xl border border-red-500/60 px-4 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-60">
                    Hesabı kalıcı olarak sil
                  </button>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
