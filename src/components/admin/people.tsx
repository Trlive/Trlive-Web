"use client";

// Kimlik onayları, yetkililer ve aileler sayfaları.
import { useState, type FormEvent } from "react";
import { Home, Fingerprint, Search, ShieldCheck, UserCog } from "lucide-react";
import { api, fmtDate, fmtNumber } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { Badge, Card, Empty, ErrorBox, Loading, PageHeader, inputCls, tableCls, tableWrap, tdCls, thCls } from "@/components/ui";
import { UserPicker, type AdminUser } from "./user-picker";
import { ActionMsg, Pager, Tabs, UserLink, btnSmall, roleText, useAction, type Brief } from "./kit";

export function AdminKyc() {
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const { data, error, loading, reload } = useApi<{ users: { id: string; username: string; displayName: string; kycStatus: string }[] }>(`/api/admin/kyc?status=${status}`);
  const { busy, msg, run } = useAction();
  const set = (id: string, st: string, label: string) =>
    run(label, async () => {
      await api(`/api/admin/users/${id}/kyc`, { method: "POST", body: { status: st } });
      reload();
    });
  return (
    <div>
      <PageHeader icon={<Fingerprint size={18} />} kicker="Ödeme güvenliği" title="Kimlik onayları (KYC)" description="Yayıncı maaşı ödenebilmesi için kimlik onayı gerekir. Onay / ret kullanıcının ödeme özetlerine yansır." />
      <Tabs
        tabs={[
          { key: "pending", label: "Bekleyenler" },
          { key: "approved", label: "Onaylananlar" },
          { key: "rejected", label: "Reddedilenler" },
        ]}
        value={status}
        onChange={setStatus}
      />
      <Card>
        <ActionMsg msg={msg} />
        {loading && !data && <Loading />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {data && data.users.length === 0 && <Empty title="Kayıt yok" />}
        {data && data.users.length > 0 && (
          <ul className="mt-2 grid gap-2 md:grid-cols-2">
            {data.users.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#262117] bg-[#141210] px-4 py-3">
                <UserLink user={u} size={30} />
                <span className="flex shrink-0 gap-1.5">
                  {status !== "approved" && (
                    <button type="button" disabled={busy} className={btnSmall} onClick={() => set(u.id, "approved", "Kimlik onaylandı.")}>
                      Onayla
                    </button>
                  )}
                  {status !== "rejected" && (
                    <button type="button" disabled={busy} className={btnSmall} onClick={() => set(u.id, "rejected", "Kimlik reddedildi.")}>
                      Reddet
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

type Staff = { id: string; username: string; displayName: string; systemRole: string };

export function AdminStaff() {
  const { data, error, loading, reload } = useApi<{ staff: Staff[] }>("/api/admin/staff");
  const { busy, msg, run } = useAction();
  const [pick, setPick] = useState<AdminUser | null>(null);
  const setRole = (u: { id: string; displayName?: string; username?: string }, role: "user" | "support") =>
    run(role === "support" ? "Yardımcı admin yapıldı." : "Yetki alındı.", async () => {
      if (!window.confirm(role === "support" ? `${u.displayName || u.username} yardımcı admin yapılsın mı?` : `${u.displayName || u.username} kullanıcısının yetkisi alınsın mı?`)) return false;
      await api(`/api/admin/users/${u.id}/staff-role`, { method: "POST", body: { role } });
      setPick(null);
      reload();
    });
  return (
    <div>
      <PageHeader icon={<UserCog size={18} />} kicker="Ekip" title="Yetkililer" description="Yöneticiler ve yardımcı adminler. Yardımcı admin: kullanıcı arama, ban, sohbet kısıtı, nick / fotoğraf değiştirme ve destek yanıtları." />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card title="Yetkili listesi">
          <ActionMsg msg={msg} />
          {loading && !data && <Loading />}
          {error && <ErrorBox message={error} onRetry={reload} />}
          {data && (
            <ul className="mt-2 space-y-2">
              {data.staff.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#262117] bg-[#141210] px-4 py-3">
                  <UserLink user={s} size={32} />
                  <span className="flex shrink-0 items-center gap-2">
                    <Badge tone={s.systemRole === "admin" ? "gold" : "blue"}>{roleText[s.systemRole] ?? s.systemRole}</Badge>
                    {s.systemRole === "support" && (
                      <button type="button" disabled={busy} className={btnSmall} onClick={() => setRole(s, "user")}>
                        Yetkiyi al
                      </button>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Yardımcı admin ekle">
          {!pick ? (
            <UserPicker onPick={setPick} />
          ) : (
            <div className="space-y-3">
              <UserLink user={pick} />
              <div className="flex gap-2">
                <button type="button" disabled={busy} className="gold-button disabled:opacity-60" onClick={() => setRole(pick, "support")}>
                  <ShieldCheck size={16} /> Yardımcı admin yap
                </button>
                <button type="button" className={btnSmall} onClick={() => setPick(null)}>
                  Vazgeç
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

type Family = {
  id: string;
  name: string;
  publicId: string | null;
  level: number;
  totalPoints: string;
  isActive: boolean;
  createdAt: string;
  members: number;
  owner: Brief | null;
};

export function AdminFamilies() {
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState("");
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useApi<{ page: number; pages: number; total: number; families: Family[] }>(
    `/api/admin/families?page=${page}${q ? `&q=${encodeURIComponent(q)}` : ""}`
  );
  const search = (e: FormEvent) => {
    e.preventDefault();
    setQ(draft.trim());
    setPage(1);
  };
  return (
    <div>
      <PageHeader icon={<Home size={18} />} kicker="Topluluk" title="Aileler" description="Tüm aileler, puanları ve üye sayıları. Aile reisine tıklayınca profili açılır." />
      <Card>
        <form onSubmit={search} className="mb-4 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Aile adı veya aile ID" className={`${inputCls} pl-10`} aria-label="Aile ara" />
          </div>
          <button type="submit" className="gold-button shrink-0 px-6">
            Ara
          </button>
        </form>
        {loading && !data && <Loading />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {data && data.families.length === 0 && <Empty title="Aile yok" />}
        {data && data.families.length > 0 && (
          <div className={tableWrap}>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>Aile</th>
                  <th className={thCls}>Reis</th>
                  <th className={thCls}>Üye</th>
                  <th className={`${thCls} text-right`}>Puan</th>
                  <th className={thCls}>Kuruluş</th>
                </tr>
              </thead>
              <tbody>
                {data.families.map((f) => (
                  <tr key={f.id}>
                    <td className={tdCls}>
                      <p className="font-medium text-white">{f.name}</p>
                      <p className="text-xs text-gray-500">
                        Lv {f.level}
                        {f.publicId ? ` · ID ${f.publicId}` : ""}
                        {!f.isActive ? " · kapalı" : ""}
                      </p>
                    </td>
                    <td className={tdCls}>
                      <UserLink user={f.owner} size={26} />
                    </td>
                    <td className={tdCls}>{f.members}</td>
                    <td className={`${tdCls} text-right`}>{fmtNumber(f.totalPoints)}</td>
                    <td className={`${tdCls} text-xs text-gray-400`}>{fmtDate(f.createdAt, false)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && <Pager page={data.page} pages={data.pages} total={data.total} onPage={setPage} />}
      </Card>
    </div>
  );
}
