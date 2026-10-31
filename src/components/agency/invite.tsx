"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeftRight, Search, UserPlus } from "lucide-react";
import { api, fmtDate } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { Badge, Card, Empty, ErrorBox, Loading, Notice, PageHeader, inputCls, tableCls, tableWrap, tdCls, thCls } from "@/components/ui";
import { Avatar } from "@/components/admin/user-picker";
import { currentAgency } from "./common";

type PublicUser = { id: string; displayName?: string; username?: string; publicId?: string | null; avatarUrl?: string | null };
type Transfer = {
  id: string;
  kind: string;
  status: string;
  createdAt: string;
  autoAt?: string | null;
  direction: "in" | "out";
  canDecide: boolean;
  from: { name: string | null } | null;
  to: { name: string | null } | null;
  user?: PublicUser;
};

const kindText: Record<string, string> = { join: "Katılma", transfer: "Ajans değiştirme", leave: "Ayrılma", removed: "Çıkarıldı" };
const statusText: Record<string, [string, "green" | "gold" | "red" | "gray" | "blue"]> = {
  pending_source: ["Ajans onayı bekliyor", "gold"],
  pending_platform: ["Platform incelemesinde", "blue"],
  approved: ["Onaylandı", "green"],
  rejected: ["Reddedildi", "red"],
  cancelled: ["İptal", "gray"],
};

export default function AgencyInvite() {
  const ag = currentAgency();
  const tr = useApi<{ transfers: Transfer[]; counts: { joined: number; left: number; pending: number } }>(ag.id ? `/api/agency-center/${ag.id}/transfers` : null);
  const [q, setQ] = useState("");
  const [found, setFound] = useState<PublicUser[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  async function search(e: FormEvent) {
    e.preventDefault();
    if (q.trim().length < 2) {
      setMsg({ tone: "error", text: "Aramak için en az 2 karakter girin." });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const r = await api<{ users: PublicUser[] }>(`/api/users/search?q=${encodeURIComponent(q.trim())}`);
      setFound(r.users ?? []);
    } catch (err) {
      setMsg({ tone: "error", text: err instanceof Error ? err.message : "Arama yapılamadı." });
    } finally {
      setBusy(false);
    }
  }

  async function invite(u: PublicUser) {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    try {
      await api(`/api/agency-center/${ag.id}/invite`, { method: "POST", body: { userId: u.id } });
      setMsg({ tone: "ok", text: `${u.displayName || u.username} kişisine yayıncı daveti gönderildi. Kabul edince ajansınıza katılır.` });
      tr.reload();
    } catch (err) {
      setMsg({ tone: "error", text: err instanceof Error ? err.message : "Davet gönderilemedi." });
    } finally {
      setBusy(false);
    }
  }

  async function decide(t: Transfer, approve: boolean) {
    const who = t.user?.displayName ?? "Yayıncı";
    let note: string | null = null;
    if (approve) {
      if (!window.confirm(`${who} kişisinin ${t.kind === "leave" ? "ajanstan ayrılmasını" : `"${t.to?.name ?? ""}" ajansına geçmesini`} onaylıyor musunuz?`)) return;
    } else {
      const typed = window.prompt("Reddetme nedeni (isteğe bağlı, en fazla 200 karakter):");
      if (typed === null) return; // vazgeçildi
      note = typed.trim().slice(0, 200) || null;
      if (!window.confirm("Transfer reddedilsin mi? Yayıncı 7 gün içinde platform incelemesi isteyebilir.")) return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await api(`/api/agency-transfers/${t.id}/respond`, { method: "POST", body: { approve, ...(note ? { note } : {}) } });
      setMsg({ tone: "ok", text: approve ? "Transfer onaylandı." : "Transfer reddedildi." });
      tr.reload();
    } catch (err) {
      setMsg({ tone: "error", text: err instanceof Error ? err.message : "İşlem başarısız." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader icon={<UserPlus size={18} />} kicker="Ekip büyütme" title="Davet ve Transfer" description="Yayıncı davet edin, katılma / ayrılma / transfer isteklerini yönetin." />
      <div className="space-y-6">
        <Card title="Yayıncı davet et" subtitle="Kullanıcı adı, görünen ad veya ID ile arayın">
          <form onSubmit={search} className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Kullanıcı ara" aria-label="Kullanıcı ara" className={`${inputCls} pl-10`} />
            </div>
            <button type="submit" disabled={busy} className="gold-button shrink-0 px-5 disabled:opacity-60">
              Ara
            </button>
          </form>
          {msg && (
            <div className="mt-4">
              <Notice tone={msg.tone}>{msg.text}</Notice>
            </div>
          )}
          {found && (
            <div className="mt-4 space-y-2">
              {found.length === 0 && <p className="py-4 text-center text-sm text-gray-500">Kullanıcı bulunamadı.</p>}
              {found.map((u) => (
                <div key={u.id} className="flex items-center gap-3 rounded-xl border border-[#262117] bg-[#141210] px-3 py-2">
                  <Avatar url={u.avatarUrl} name={u.displayName || u.username} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{u.displayName || u.username}</p>
                    <p className="text-xs text-gray-500">ID {u.publicId ?? "—"}</p>
                  </div>
                  <button type="button" disabled={busy} onClick={() => invite(u)} className="rounded-lg border border-[#8c713d] px-3 py-1.5 text-xs text-[#e5c77e] hover:bg-[#292114] disabled:opacity-60">
                    Davet et
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card
          title="Transfer geçmişi"
          subtitle={tr.data ? `Katılan ${tr.data.counts.joined} · Ayrılan ${tr.data.counts.left} · Onay bekleyen ${tr.data.counts.pending}` : undefined}
          action={<ArrowLeftRight size={18} className="text-[#d7b56d]" />}
        >
          {tr.loading && !tr.data && <Loading />}
          {tr.error && <ErrorBox message={tr.error} onRetry={tr.reload} />}
          {tr.data && tr.data.transfers.length === 0 && <Empty title="Henüz transfer kaydı yok." />}
          {tr.data && tr.data.transfers.length > 0 && (
            <div className={tableWrap}>
              <table className={`${tableCls} min-w-[820px]`}>
                <thead>
                  <tr>
                    <th className={thCls}>Yayıncı</th>
                    <th className={thCls}>Tür</th>
                    <th className={thCls}>Nereden → Nereye</th>
                    <th className={thCls}>Durum</th>
                    <th className={thCls}>Tarih</th>
                    <th className={thCls}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {tr.data.transfers.map((t) => {
                    const st = statusText[t.status] ?? [t.status, "gray"];
                    return (
                      <tr key={t.id}>
                        <td className={tdCls}>
                          {t.user?.displayName ?? "—"} <span className="text-xs text-gray-500">ID {t.user?.publicId ?? "—"}</span>
                        </td>
                        <td className={tdCls}>{kindText[t.kind] ?? t.kind}</td>
                        <td className={`${tdCls} text-xs text-gray-400`}>
                          {t.from?.name ?? "—"} → {t.to?.name ?? "—"}
                        </td>
                        <td className={tdCls}>
                          <Badge tone={st[1]}>{st[0]}</Badge>
                          {t.status === "pending_source" && t.autoAt && <p className="mt-1 text-xs text-gray-500">Otomatik onay: {fmtDate(t.autoAt)}</p>}
                        </td>
                        <td className={tdCls}>{fmtDate(t.createdAt)}</td>
                        <td className={tdCls}>
                          {t.canDecide ? (
                            <div className="flex gap-2">
                              <button type="button" disabled={busy} onClick={() => decide(t, false)} className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10">
                                Reddet
                              </button>
                              <button type="button" disabled={busy} onClick={() => decide(t, true)} className="rounded-lg border border-emerald-500/40 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/10">
                                Onayla
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-600">—</span>
                          )}
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
    </div>
  );
}
