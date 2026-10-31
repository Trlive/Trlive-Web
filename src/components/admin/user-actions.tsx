"use client";

import { useRef, useState, type ReactNode } from "react";
import { Ban, BadgeCheck, Coins, Crown, Gift, Hash, ImageOff, KeyRound, LogOut, MessageSquareOff, PenLine, ShieldCheck, Trash2, Undo2, UserCog, Video } from "lucide-react";
import { api, fmtNumber } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { Card, inputCls } from "@/components/ui";
import type { Detail } from "./user-detail";
import { ActionMsg, Field, btnDanger, btnDangerOutline, btnGhost, btnOk, confirmTyped, mayAct, newKey, selectCls, useAction } from "./kit";

type Run = (label: string, fn: () => Promise<void | false>) => Promise<void>;

/** Kendi meşgul / mesaj durumu olan işlem kartı. */
function ActionCard({ title, icon, tone = "gold", children }: { title: string; icon: ReactNode; tone?: "gold" | "red"; children: (run: Run, busy: boolean) => ReactNode }) {
  const { busy, msg, run } = useAction();
  return (
    <section className={`rounded-2xl border bg-[#111111] p-5 ${tone === "red" ? "border-red-500/25" : "border-[#30291e]"}`}>
      <h3 className={`mb-4 flex items-center gap-2 text-sm font-semibold ${tone === "red" ? "text-red-300" : "text-[#d7b56d]"}`}>
        {icon}
        {title}
      </h3>
      <div className="space-y-3">
        {children(run, busy)}
        <ActionMsg msg={msg} />
      </div>
    </section>
  );
}

const GRANT_CATS: [string, string][] = [
  ["frame", "Çerçeve"],
  ["entrance_effect", "Giriş efekti"],
  ["vehicle", "Araç"],
  ["chat_bubble", "Sohbet balonu"],
  ["badge", "Madalya / rozet"],
  ["mini_card", "Mini kart"],
  ["mic_wave", "Mikrofon dalgası"],
  ["room_card", "Oda kartı"],
  ["colored_id", "Renkli ID"],
];

const BADGES: [string, string][] = [
  ["bronz", "Bronz Yayıncı"],
  ["gumus", "Gümüş Yayıncı"],
  ["altin", "Altın Yayıncı"],
  ["super", "Süper Yayıncı"],
  ["ozel", "Özel Yayıncı"],
];

export default function UserActions({ data, onChanged }: { data: Detail; onChanged: () => void }) {
  const u = data.user;
  const full = data.viewer.full;
  const name = u.displayName || u.username;
  const deleted = u.accountStatus === "deleted";
  const isAdminTarget = u.systemRole === "admin";
  const base = `/api/admin/users/${u.id}`;
  // Sunucudaki yetki kuralı: yönetici hesabına (kendisi hariç) ve yardımcı admin diğer yetkililere işlem yapamaz.
  const canEdit = mayAct(u.systemRole, u.id);
  const canSanction = canEdit && !isAdminTarget;

  if (deleted) {
    return (
      <Card>
        <p className="text-sm text-gray-400">Bu hesap silinmiş; üzerinde işlem yapılamaz. Geçmiş kayıtları diğer sekmelerde görebilirsiniz.</p>
      </Card>
    );
  }

  if (!full && !canEdit) {
    return (
      <Card>
        <p className="text-sm text-gray-400">Bu hesap bir yetkiliye ait; üzerinde işlem yetkiniz yok.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
      {canSanction && <BanCard data={data} onChanged={onChanged} />}
      {canSanction && <ChatRestrictCard data={data} onChanged={onChanged} />}
      {canEdit && <NameCard data={data} onChanged={onChanged} />}

      {canEdit && u.avatarUrl && (
        <ActionCard title="Profil fotoğrafı" icon={<ImageOff size={16} />}>
          {(run, busy) => (
            <>
              <p className="text-xs text-gray-500">Uygunsuz profil fotoğrafını kaldırır (dosya da silinir).</p>
              <button
                type="button"
                disabled={busy}
                className={btnDangerOutline}
                onClick={() =>
                  run("Profil fotoğrafı kaldırıldı.", async () => {
                    if (!window.confirm(`${name} kullanıcısının profil fotoğrafı kaldırılsın mı?`)) return false;
                    await api(`${base}/avatar`, { method: "POST", body: { avatarUrl: null } });
                    onChanged();
                  })
                }
              >
                <ImageOff size={16} /> Fotoğrafı kaldır
              </button>
            </>
          )}
        </ActionCard>
      )}

      {full && u.accountStatus === "active" && <CoinCard data={data} onChanged={onChanged} />}
      {full && <WipCard data={data} onChanged={onChanged} />}
      {full && <GrantCard data={data} onChanged={onChanged} />}
      {full && <SpecialIdCard data={data} onChanged={onChanged} />}
      {full && <HostBadgeCard data={data} onChanged={onChanged} />}
      {full && data.broadcaster && <BroadcasterCard data={data} onChanged={onChanged} />}
      {full && <KycCard data={data} onChanged={onChanged} />}
      {full && !isAdminTarget && <StaffRoleCard data={data} onChanged={onChanged} />}
      {full && canEdit && <CredentialsCard data={data} onChanged={onChanged} />}
      {full && canSanction && (
        <ActionCard title="Oturumları kapat" icon={<LogOut size={16} />}>
          {(run, busy) => (
            <>
              <p className="text-xs text-gray-500">Hesap çalındı şüphesinde: tüm cihazlardaki oturumlar kapanır, yeniden giriş gerekir.</p>
              <button
                type="button"
                disabled={busy}
                className={btnGhost}
                onClick={() =>
                  run("Tüm oturumlar kapatıldı.", async () => {
                    if (!window.confirm(`${name} kullanıcısının tüm oturumları kapatılsın mı?`)) return false;
                    await api(`${base}/sessions/revoke-all`, { method: "POST", body: {} });
                    onChanged();
                  })
                }
              >
                <LogOut size={16} /> Tüm oturumları kapat
              </button>
            </>
          )}
        </ActionCard>
      )}
      {full && !isAdminTarget && <DeleteCard data={data} />}
    </div>
  );
}

function BanCard({ data, onChanged }: { data: Detail; onChanged: () => void }) {
  const u = data.user;
  const [hours, setHours] = useState("24");
  const [reason, setReason] = useState("");
  return (
    <ActionCard title={u.accountStatus === "banned" ? "Ban kaldır" : "Hesabı banla"} icon={<Ban size={16} />} tone="red">
      {(run, busy) =>
        u.accountStatus === "banned" ? (
          <>
            <p className="text-sm text-gray-400">
              {u.bannedUntil ? `Ban bitişi: ${new Date(u.bannedUntil).toLocaleString("tr-TR")}` : "Süresiz ban"} · Neden: {u.banReason || "—"}
            </p>
            <button
              type="button"
              disabled={busy}
              className={btnOk}
              onClick={() =>
                run("Ban kaldırıldı.", async () => {
                  await api(`/api/admin/users/${u.id}/unban`, { method: "POST", body: {} });
                  onChanged();
                })
              }
            >
              <Undo2 size={16} /> Banı kaldır
            </button>
          </>
        ) : (
          <>
            <div className="grid gap-2 sm:grid-cols-[150px_minmax(0,1fr)]">
              <select value={hours} onChange={(e) => setHours(e.target.value)} className={selectCls} aria-label="Ban süresi">
                <option value="1">1 saat</option>
                <option value="6">6 saat</option>
                <option value="24">1 gün</option>
                <option value="72">3 gün</option>
                <option value="168">7 gün</option>
                <option value="720">30 gün</option>
                <option value="2160">90 gün</option>
                <option value="0">Süresiz</option>
              </select>
              <input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} placeholder="Neden (zorunlu, kullanıcıya gösterilir)" className={inputCls} />
            </div>
            <p className="text-xs text-gray-500">Banlanan kişinin tüm oturumları kapanır, bulunduğu odalardan çıkarılır.</p>
            <button
              type="button"
              disabled={busy}
              className={btnDanger}
              onClick={() =>
                run("Hesap banlandı.", async () => {
                  if (!reason.trim()) throw new Error("Ban nedeni yazın.");
                  if (!window.confirm(`${u.displayName || u.username} ${hours === "0" ? "süresiz" : `${hours} saat`} banlansın mı?`)) return false;
                  await api(`/api/admin/users/${u.id}/ban`, { method: "POST", body: { hours: hours === "0" ? null : Number(hours), reason: reason.trim() } });
                  setReason("");
                  onChanged();
                })
              }
            >
              <Ban size={16} /> Banla
            </button>
          </>
        )
      }
    </ActionCard>
  );
}

function ChatRestrictCard({ data, onChanged }: { data: Detail; onChanged: () => void }) {
  const u = data.user;
  const [minutes, setMinutes] = useState("60");
  return (
    <ActionCard title="Sohbet kısıtı" icon={<MessageSquareOff size={16} />}>
      {(run, busy) => (
        <>
          <p className="text-xs text-gray-500">
            {u.chatRestrictedUntil ? `Şu an kısıtlı: ${new Date(u.chatRestrictedUntil).toLocaleString("tr-TR")} saatine kadar.` : "Kısıtlı kişi odalarda, özel mesajlarda, gönderi ve yorumlarda yazamaz."}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select value={minutes} onChange={(e) => setMinutes(e.target.value)} className={`${selectCls} flex-1`} aria-label="Kısıt süresi">
              <option value="15">15 dakika</option>
              <option value="60">1 saat</option>
              <option value="360">6 saat</option>
              <option value="1440">1 gün</option>
              <option value="4320">3 gün</option>
              <option value="10080">7 gün</option>
            </select>
            <button
              type="button"
              disabled={busy}
              className={btnGhost}
              onClick={() =>
                run("Sohbet kısıtı uygulandı.", async () => {
                  await api(`/api/admin/users/${u.id}/chat-restriction`, { method: "POST", body: { minutes: Number(minutes) } });
                  onChanged();
                })
              }
            >
              Kısıtla
            </button>
          </div>
          {u.chatRestrictedUntil && (
            <button
              type="button"
              disabled={busy}
              className={btnOk}
              onClick={() =>
                run("Sohbet kısıtı kaldırıldı.", async () => {
                  await api(`/api/admin/users/${u.id}/chat-restriction`, { method: "POST", body: { minutes: 0 } });
                  onChanged();
                })
              }
            >
              Kısıtı kaldır
            </button>
          )}
        </>
      )}
    </ActionCard>
  );
}

function NameCard({ data, onChanged }: { data: Detail; onChanged: () => void }) {
  const u = data.user;
  const [nameVal, setNameVal] = useState(u.displayName);
  return (
    <ActionCard title="Görünen adı değiştir" icon={<PenLine size={16} />}>
      {(run, busy) => (
        <>
          <input value={nameVal} onChange={(e) => setNameVal(e.target.value)} maxLength={40} className={inputCls} aria-label="Görünen ad" />
          <button
            type="button"
            disabled={busy || nameVal.trim() === u.displayName}
            className={btnGhost}
            onClick={() =>
              run("Görünen ad değiştirildi.", async () => {
                if (nameVal.trim().length < 2) throw new Error("Ad en az 2 karakter olmalı.");
                await api(`/api/admin/users/${u.id}/display-name`, { method: "POST", body: { displayName: nameVal.trim() } });
                onChanged();
              })
            }
          >
            Kaydet
          </button>
        </>
      )}
    </ActionCard>
  );
}

function CoinCard({ data, onChanged }: { data: Detail; onChanged: () => void }) {
  const u = data.user;
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  // Tekrar koruması: aynı giriş için aynı anahtar (cevap kaybolup yeniden denenirse Coin iki kez eklenmez); başarıdan sonra yenilenir.
  const key = useRef(newKey());
  return (
    <ActionCard title={`Coin ekle / düş · bakiye ${fmtNumber(u.coins)}`} icon={<Coins size={16} />}>
      {(run, busy) => (
        <>
          <div className="grid gap-2 sm:grid-cols-[160px_minmax(0,1fr)]">
            <input
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                key.current = newKey();
              }}
              inputMode="numeric"
              placeholder="1000 ya da -500"
              className={inputCls}
              aria-label="Coin miktarı"
            />
            <input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} placeholder="Açıklama (kayda geçer)" className={inputCls} aria-label="Açıklama" />
          </div>
          <button
            type="button"
            disabled={busy}
            className="gold-button disabled:opacity-60"
            onClick={() =>
              run("Coin bakiyesi güncellendi.", async () => {
                const a = amount.trim();
                if (!/^-?\d{1,12}$/.test(a) || /^-?0+$/.test(a)) throw new Error("Geçerli bir Coin miktarı girin (düşmek için eksi).");
                if (!window.confirm(`${u.displayName || u.username} hesabına ${fmtNumber(a)} Coin ${a.startsWith("-") ? "düşülecek" : "eklenecek"}. Onaylıyor musunuz?`)) return false;
                await api(`/api/admin/users/${u.id}/coins`, {
                  method: "POST",
                  body: { amount: a, reason: reason.trim() || "Web paneli düzenlemesi" },
                  headers: { "Idempotency-Key": key.current },
                });
                key.current = newKey();
                setAmount("");
                setReason("");
                onChanged();
              })
            }
          >
            Uygula
          </button>
          <p className="text-xs text-gray-500">Tüm Coin işlemleri mali denetim kaydına yazılır.</p>
        </>
      )}
    </ActionCard>
  );
}

function WipCard({ data, onChanged }: { data: Detail; onChanged: () => void }) {
  const u = data.user;
  const tiers = useApi<{ tiers: { level: number; name: string }[] }>("/api/wip/tiers");
  const [level, setLevel] = useState(String(u.wip?.level ?? 1));
  const [days, setDays] = useState("30");
  const levels = tiers.data?.tiers?.length ? tiers.data.tiers : Array.from({ length: 11 }, (_, i) => ({ level: i + 1, name: i + 1 >= 11 ? "SWIP" : `WIP ${i + 1}` }));
  return (
    <ActionCard title={u.wip ? `WIP · şu an ${u.wip.level >= 11 ? "SWIP" : `WIP ${u.wip.level}`}` : "WIP ver"} icon={<Crown size={16} />}>
      {(run, busy) => (
        <>
          <div className="grid gap-2 sm:grid-cols-2">
            <select value={level} onChange={(e) => setLevel(e.target.value)} className={selectCls} aria-label="WIP kademesi">
              {levels.map((t) => (
                <option key={t.level} value={t.level}>
                  {t.name}
                </option>
              ))}
            </select>
            <select value={days} onChange={(e) => setDays(e.target.value)} className={selectCls} aria-label="Süre">
              <option value="1">1 gün</option>
              <option value="7">7 gün</option>
              <option value="30">30 gün</option>
              <option value="90">90 gün</option>
              <option value="365">1 yıl</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              className="gold-button disabled:opacity-60 sm:w-auto"
              onClick={() =>
                run("WIP verildi.", async () => {
                  await api(`/api/admin/users/${u.id}/wip`, { method: "POST", body: { level: Number(level), days: Number(days) } });
                  onChanged();
                })
              }
            >
              Ver / güncelle
            </button>
            {u.wip && (
              <button
                type="button"
                disabled={busy}
                className={btnDangerOutline}
                onClick={() =>
                  run("WIP kaldırıldı.", async () => {
                    if (!window.confirm("WIP üyeliği kaldırılsın mı?")) return false;
                    await api(`/api/admin/users/${u.id}/wip`, { method: "DELETE" });
                    onChanged();
                  })
                }
              >
                Kaldır
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500">Verilen süre bugünden başlar; mevcut üyeliğin yerine geçer.</p>
        </>
      )}
    </ActionCard>
  );
}

function GrantCard({ data, onChanged }: { data: Detail; onChanged: () => void }) {
  const u = data.user;
  const [cat, setCat] = useState("frame");
  const items = useApi<{ items: { key: string; name: string; wip?: boolean }[] }>(`/api/admin/grantables?category=${cat}`);
  const [key, setKey] = useState("");
  const [days, setDays] = useState("30");
  return (
    <ActionCard title="Öğe ver (çerçeve, araç, balon, madalya...)" icon={<Gift size={16} />}>
      {(run, busy) => (
        <>
          <div className="grid gap-2 sm:grid-cols-2">
            <select
              value={cat}
              onChange={(e) => {
                setCat(e.target.value);
                setKey("");
              }}
              className={selectCls}
              aria-label="Kategori"
            >
              {GRANT_CATS.map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </select>
            <select value={days} onChange={(e) => setDays(e.target.value)} className={selectCls} aria-label="Süre">
              <option value="7">7 gün</option>
              <option value="30">30 gün</option>
              <option value="90">90 gün</option>
              <option value="365">1 yıl</option>
              <option value="">Süresiz</option>
            </select>
          </div>
          <select value={key} onChange={(e) => setKey(e.target.value)} className={`${selectCls} w-full`} aria-label="Öğe" disabled={items.loading}>
            <option value="">{items.loading ? "Yükleniyor..." : items.data?.items.length ? "Öğe seçin" : "Bu kategoride öğe yok"}</option>
            {items.data?.items.map((i) => (
              <option key={i.key} value={i.key}>
                {i.name}
              </option>
            ))}
          </select>
          {items.error && <p className="text-xs text-red-300">{items.error}</p>}
          <button
            type="button"
            disabled={busy || !key}
            className="gold-button disabled:opacity-60"
            onClick={() =>
              run("Öğe verildi.", async () => {
                await api(`/api/admin/users/${u.id}/grant`, { method: "POST", body: { category: cat, itemKey: key, days: days ? Number(days) : null } });
                onChanged();
              })
            }
          >
            Ver
          </button>
        </>
      )}
    </ActionCard>
  );
}

function SpecialIdCard({ data, onChanged }: { data: Detail; onChanged: () => void }) {
  const u = data.user;
  const [value, setValue] = useState("");
  const [days, setDays] = useState("30");
  return (
    <ActionCard title={u.specialId ? `Özel ID · ${u.specialId.value}` : "Özel ID ver"} icon={<Hash size={16} />}>
      {(run, busy) => (
        <>
          <div className="grid gap-2 sm:grid-cols-2">
            <input value={value} onChange={(e) => setValue(e.target.value.replace(/\D/g, "").slice(0, 7))} inputMode="numeric" placeholder="Numara (boş = rastgele)" className={inputCls} aria-label="Özel ID" />
            <select value={days} onChange={(e) => setDays(e.target.value)} className={selectCls} aria-label="Süre">
              <option value="7">7 gün</option>
              <option value="30">30 gün</option>
              <option value="90">90 gün</option>
              <option value="365">1 yıl</option>
              <option value="3650">10 yıl</option>
            </select>
          </div>
          <p className="text-xs text-gray-500">2-7 haneli, 0 ile başlamayan numara.</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              className="gold-button disabled:opacity-60 sm:w-auto"
              onClick={() =>
                run("Özel ID verildi.", async () => {
                  if (value && !/^[1-9]\d{1,6}$/.test(value)) throw new Error("Özel ID 2-7 haneli olmalı ve 0 ile başlamamalı.");
                  await api(`/api/admin/users/${u.id}/special-id`, { method: "POST", body: { specialId: value || null, days: Number(days) } });
                  setValue("");
                  onChanged();
                })
              }
            >
              Ver
            </button>
            {u.specialId && (
              <button
                type="button"
                disabled={busy}
                className={btnDangerOutline}
                onClick={() =>
                  run("Özel ID kaldırıldı.", async () => {
                    if (!window.confirm("Özel ID kaldırılsın mı?")) return false;
                    await api(`/api/admin/users/${u.id}/special-id`, { method: "DELETE" });
                    onChanged();
                  })
                }
              >
                Kaldır
              </button>
            )}
          </div>
        </>
      )}
    </ActionCard>
  );
}

function HostBadgeCard({ data, onChanged }: { data: Detail; onChanged: () => void }) {
  const u = data.user;
  const [badge, setBadge] = useState(u.hostBadge?.badge ?? "bronz");
  const [days, setDays] = useState("30");
  return (
    <ActionCard title={u.hostBadge ? `Yayıncı rozeti · ${u.hostBadge.badge}` : "Yayıncı rozeti ver"} icon={<BadgeCheck size={16} />}>
      {(run, busy) => (
        <>
          <div className="grid gap-2 sm:grid-cols-2">
            <select value={badge} onChange={(e) => setBadge(e.target.value)} className={selectCls} aria-label="Rozet">
              {BADGES.map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </select>
            <select value={days} onChange={(e) => setDays(e.target.value)} className={selectCls} aria-label="Süre">
              <option value="7">7 gün</option>
              <option value="30">30 gün</option>
              <option value="90">90 gün</option>
              <option value="365">1 yıl</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              className="gold-button disabled:opacity-60 sm:w-auto"
              onClick={() =>
                run("Rozet verildi.", async () => {
                  await api(`/api/admin/users/${u.id}/host-badge`, { method: "POST", body: { badge, days: Number(days) } });
                  onChanged();
                })
              }
            >
              Ver
            </button>
            {u.hostBadge && (
              <button
                type="button"
                disabled={busy}
                className={btnDangerOutline}
                onClick={() =>
                  run("Rozet kaldırıldı.", async () => {
                    if (!window.confirm("Yayıncı rozeti kaldırılsın mı?")) return false;
                    await api(`/api/admin/users/${u.id}/host-badge`, { method: "DELETE" });
                    onChanged();
                  })
                }
              >
                Kaldır
              </button>
            )}
          </div>
        </>
      )}
    </ActionCard>
  );
}

function BroadcasterCard({ data, onChanged }: { data: Detail; onChanged: () => void }) {
  const u = data.user;
  const b = data.broadcaster!;
  const set = (status: string, label: string, run: Run) =>
    run(label, async () => {
      if (status !== "approved" && !window.confirm(`Yayıncılık durumu "${status === "suspended" ? "askıya alındı" : "reddedildi"}" yapılsın mı? Ajans bağlantısı da kaldırılır.`)) return false;
      await api(`/api/admin/broadcasters/${u.id}/status`, { method: "POST", body: { status } });
      onChanged();
    });
  return (
    <ActionCard title={`Yayıncılık · ${b.status === "approved" ? "onaylı" : b.status === "pending" ? "başvuru bekliyor" : b.status === "suspended" ? "askıda" : "reddedildi"}`} icon={<Video size={16} />}>
      {(run, busy) => (
        <>
          <p className="text-xs text-gray-500">Ajans: {b.agency?.name ?? "yok"}</p>
          <div className="flex flex-wrap gap-2">
            {b.status !== "approved" && (
              <button type="button" disabled={busy} className={btnOk} onClick={() => set("approved", "Yayıncılık onaylandı.", run)}>
                Onayla
              </button>
            )}
            {b.status !== "suspended" && (
              <button type="button" disabled={busy} className={btnDangerOutline} onClick={() => set("suspended", "Yayıncılık askıya alındı.", run)}>
                Askıya al
              </button>
            )}
            {b.status === "pending" && (
              <button type="button" disabled={busy} className={btnDangerOutline} onClick={() => set("rejected", "Başvuru reddedildi.", run)}>
                Reddet
              </button>
            )}
          </div>
        </>
      )}
    </ActionCard>
  );
}

function KycCard({ data, onChanged }: { data: Detail; onChanged: () => void }) {
  const u = data.user;
  const st = u.kycStatus ?? "none";
  const set = (status: string, label: string, run: Run) =>
    run(label, async () => {
      await api(`/api/admin/users/${u.id}/kyc`, { method: "POST", body: { status } });
      onChanged();
    });
  return (
    <ActionCard title={`Kimlik doğrulama · ${st === "approved" ? "onaylı" : st === "pending" ? "bekliyor" : st === "rejected" ? "reddedildi" : "yok"}`} icon={<ShieldCheck size={16} />}>
      {(run, busy) => (
        <>
          <p className="text-xs text-gray-500">Yayıncı maaşı ödemesi için kimlik onayı gerekir.</p>
          <div className="flex flex-wrap gap-2">
            {st !== "approved" && (
              <button type="button" disabled={busy} className={btnOk} onClick={() => set("approved", "Kimlik onaylandı.", run)}>
                Onayla
              </button>
            )}
            {st !== "rejected" && (
              <button type="button" disabled={busy} className={btnDangerOutline} onClick={() => set("rejected", "Kimlik reddedildi.", run)}>
                Reddet
              </button>
            )}
            {st !== "none" && (
              <button type="button" disabled={busy} className={btnGhost} onClick={() => set("none", "Kimlik durumu sıfırlandı.", run)}>
                Sıfırla
              </button>
            )}
          </div>
        </>
      )}
    </ActionCard>
  );
}

function StaffRoleCard({ data, onChanged }: { data: Detail; onChanged: () => void }) {
  const u = data.user;
  const isSupport = u.systemRole === "support";
  return (
    <ActionCard title={`Yetki · ${isSupport ? "Yardımcı admin" : "Kullanıcı"}`} icon={<UserCog size={16} />}>
      {(run, busy) => (
        <>
          <p className="text-xs text-gray-500">Yardımcı admin: kullanıcı arama, ban, sohbet kısıtı, nick / fotoğraf değiştirme ve destek mesajlarına yanıt.</p>
          <button
            type="button"
            disabled={busy || (!isSupport && u.accountStatus !== "active")}
            className={isSupport ? btnDangerOutline : btnGhost}
            onClick={() =>
              run(isSupport ? "Yardımcı admin yetkisi alındı." : "Yardımcı admin yapıldı.", async () => {
                if (!window.confirm(isSupport ? "Yardımcı admin yetkisi alınsın mı?" : `${u.displayName || u.username} yardımcı admin yapılsın mı?`)) return false;
                await api(`/api/admin/users/${u.id}/staff-role`, { method: "POST", body: { role: isSupport ? "user" : "support" } });
                onChanged();
              })
            }
          >
            {isSupport ? "Yetkiyi al" : "Yardımcı admin yap"}
          </button>
        </>
      )}
    </ActionCard>
  );
}

function CredentialsCard({ data, onChanged }: { data: Detail; onChanged: () => void }) {
  const u = data.user;
  const [username, setUsername] = useState(u.username);
  const [phone, setPhone] = useState(u.phone ?? "");
  const [password, setPassword] = useState("");
  return (
    <ActionCard title="Giriş bilgileri" icon={<KeyRound size={16} />}>
      {(run, busy) => (
        <>
          <Field label="Kullanıcı adı">
            <input value={username} onChange={(e) => setUsername(e.target.value)} maxLength={30} className={inputCls} autoComplete="off" />
          </Field>
          <Field label="Telefon" hint="Boş bırakılırsa telefon kaldırılır.">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} className={inputCls} autoComplete="off" inputMode="tel" />
          </Field>
          <Field label="Yeni şifre" hint="Kullanıcının şifresini unuttuğu durumlarda. Değişince tüm oturumları kapanır. Mevcut şifre hiçbir zaman gösterilmez.">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} autoComplete="new-password" placeholder="Değiştirmeyecekseniz boş bırakın" />
          </Field>
          <button
            type="button"
            disabled={busy}
            className={btnGhost}
            onClick={() =>
              run("Giriş bilgileri güncellendi.", async () => {
                const body: Record<string, string> = {};
                if (username.trim().toLowerCase() !== u.username) body.username = username.trim().toLowerCase();
                if (phone.trim() !== (u.phone ?? "")) body.phone = phone.trim();
                if (password) body.password = password;
                if (!Object.keys(body).length) throw new Error("Değiştirilecek bir bilgi yok.");
                if (body.password && !window.confirm("Şifre değişecek ve kullanıcının tüm oturumları kapanacak. Onaylıyor musunuz?")) return false;
                await api(`/api/admin/users/${u.id}/credentials`, { method: "POST", body });
                setPassword("");
                onChanged();
              })
            }
          >
            Kaydet
          </button>
        </>
      )}
    </ActionCard>
  );
}

function DeleteCard({ data }: { data: Detail }) {
  const u = data.user;
  const [reason, setReason] = useState("");
  const [done, setDone] = useState(false);
  return (
    <ActionCard title="Hesabı sil" icon={<Trash2 size={16} />} tone="red">
      {(run, busy) => (
        <>
          <p className="text-xs leading-5 text-gray-500">
            E-posta ile gelen silme talepleri veya 18 yaşından küçük olduğu anlaşılan hesaplar için. Kişisel bilgiler silinir; ödeme ve güvenlik kayıtları yasal süre boyunca saklanır. Geri
            alınamaz.
          </p>
          <input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} placeholder="Silme nedeni (zorunlu, kayda geçer)" className={inputCls} aria-label="Silme nedeni" />
          <button
            type="button"
            disabled={busy || done}
            className={btnDangerOutline}
            onClick={() =>
              run("Hesap silindi. Sayfayı yenileyince güncel hali görünür.", async () => {
                if (reason.trim().length < 3) throw new Error("Silme nedenini yazın (ör. e-posta ile silme talebi).");
                if (!confirmTyped(`${u.displayName || u.username} hesabı kalıcı olarak silinecek. Bu işlem geri alınamaz.`)) return false;
                await api(`/api/admin/users/${u.id}/delete`, { method: "POST", body: { reason: reason.trim() } });
                setDone(true);
              })
            }
          >
            <Trash2 size={16} /> Hesabı kalıcı olarak sil
          </button>
        </>
      )}
    </ActionCard>
  );
}
