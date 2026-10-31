"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Flag, MessageSquareOff, ShieldAlert, XCircle } from "lucide-react";
import { api, fmtDate } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { Badge, Card, Empty, ErrorBox, Loading, PageHeader, inputCls, tableCls, tableWrap, tdCls, thCls } from "@/components/ui";
import { ActionMsg, Tabs, UserLink, btnDangerOutline, btnOk, btnSmall, fmtRel, reportKindText, reportReasonText, roomHref, useAction, userHref } from "./kit";

type Report = {
  id: string;
  kind: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
  reporter: string;
  reporterId: string;
  targetUserId: string | null;
  target: string | null;
  targetName: string | null;
  targetPublicId: string | null;
  targetStatus: string | null;
  roomId: string | null;
  roomName: string | null;
  messageId: string | null;
  messageText: string | null;
  messageSenderId: string | null;
  messageSender: string | null;
  resolvedAt: string | null;
  resolvedNote: string | null;
  resolvedBy: string | null;
};

type Strike = {
  id: string;
  kind: string;
  context: string;
  sample: string | null;
  createdAt: string;
  user: { id: string; publicId: string | null; username: string; displayName: string };
  restrictedUntil: string | null;
};

const strikeText: Record<string, string> = { link: "Bağlantı paylaşımı", phone: "Telefon paylaşımı", profanity: "Küfür / hakaret", flood: "Spam", auto_mute: "Otomatik susturma" };

export default function AdminReports() {
  const [tab, setTab] = useState<"open" | "resolved" | "dismissed" | "strikes">("open");
  const pending = useApi<{ reports?: number }>("/api/admin/overview/pending");
  return (
    <div>
      <PageHeader icon={<Flag size={18} />} kicker="Moderasyon" title="Şikâyetler ve ihlaller" description="Kullanıcı şikâyetlerini inceleyin, karara bağlayın; otomatik moderasyonun yakaladığı ihlalleri görün." />
      <Tabs
        tabs={[
          { key: "open", label: "Açık şikâyetler", count: pending.data?.reports },
          { key: "resolved", label: "Çözülenler" },
          { key: "dismissed", label: "Reddedilenler" },
          { key: "strikes", label: "Otomatik ihlaller" },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === "strikes" ? <Strikes /> : <ReportList key={tab} status={tab} onChanged={pending.reload} />}
    </div>
  );
}

function ReportList({ status, onChanged }: { status: string; onChanged: () => void }) {
  const { data, error, loading, reload } = useApi<{ reports: Report[] }>(`/api/admin/reports?status=${status}`);
  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  if (!data) return null;
  if (data.reports.length === 0) return <Card><Empty title={status === "open" ? "Açık şikâyet yok" : "Kayıt yok"} note={status === "open" ? "Yeni şikâyetler burada görünür." : undefined} /></Card>;
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {data.reports.map((r) => (
        <ReportCard
          key={r.id}
          r={r}
          onDone={() => {
            reload();
            onChanged();
          }}
        />
      ))}
    </div>
  );
}

function ReportCard({ r, onDone }: { r: Report; onDone: () => void }) {
  const [note, setNote] = useState("");
  const { busy, msg, run } = useAction();
  const decide = (st: "resolved" | "dismissed") =>
    run(st === "resolved" ? "Şikâyet çözüldü olarak kapatıldı." : "Şikâyet reddedildi.", async () => {
      await api(`/api/admin/reports/${r.id}/resolve`, { method: "POST", body: { status: st, note: note.trim() || null } });
      onDone();
    });
  return (
    <section className="rounded-2xl border border-[#30291e] bg-[#111111] p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={r.status === "open" ? "red" : r.status === "resolved" ? "green" : "gray"}>{r.status === "open" ? "Açık" : r.status === "resolved" ? "Çözüldü" : "Reddedildi"}</Badge>
        <span className="font-semibold text-white">{reportReasonText[r.reason] ?? r.reason}</span>
        <span className="text-xs text-gray-500">
          {reportKindText[r.kind] ?? r.kind} · {fmtRel(r.createdAt)}
        </span>
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-gray-500">Şikâyet edilen</dt>
          <dd className="mt-1">
            {r.targetUserId ? (
              <Link href={userHref(r.targetUserId)} className="text-[#e5c77e] hover:underline">
                {r.targetName || r.target} {r.target ? `(@${r.target})` : ""}
              </Link>
            ) : (
              "—"
            )}
            {r.targetStatus === "banned" && <span className="ml-2 text-xs text-red-300">banlı</span>}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Şikâyet eden</dt>
          <dd className="mt-1">
            <Link href={userHref(r.reporterId)} className="text-[#e5c77e] hover:underline">
              @{r.reporter}
            </Link>
          </dd>
        </div>
        {r.roomId && (
          <div>
            <dt className="text-xs text-gray-500">Oda</dt>
            <dd className="mt-1">
              <Link href={roomHref(r.roomId)} className="text-[#e5c77e] hover:underline">
                {r.roomName ?? "Odayı aç"}
              </Link>
            </dd>
          </div>
        )}
        <div>
          <dt className="text-xs text-gray-500">Tarih</dt>
          <dd className="mt-1 text-gray-300">{fmtDate(r.createdAt)}</dd>
        </div>
      </dl>
      {r.messageText && (
        <blockquote className="mt-4 rounded-xl border-l-2 border-red-400/60 bg-[#1a1111] px-4 py-3 text-sm text-gray-200">
          <span className="mb-1 block text-xs text-gray-500">
            Şikâyet edilen mesaj
            {r.messageSenderId && (
              <>
                {" · yazan: "}
                <Link href={userHref(r.messageSenderId)} className="text-[#e5c77e] hover:underline">
                  @{r.messageSender ?? "?"}
                </Link>
              </>
            )}
          </span>
          <span className="whitespace-pre-wrap break-words">{r.messageText}</span>
          {r.messageSenderId && r.targetUserId && r.messageSenderId !== r.targetUserId && (
            <span role="note" className="mt-2 block text-xs font-medium text-amber-300">
              Dikkat: bu mesajı şikâyet edilen kişi değil, @{r.messageSender ?? "başka biri"} yazmış. Karar vermeden önce kontrol edin.
            </span>
          )}
        </blockquote>
      )}
      {(r.kind === "dm" || r.kind === "room_message") && r.messageId && !r.messageText && (
        <p className="mt-3 text-xs text-gray-500">Şikâyet edilen mesaj bulunamadı (silinmiş ya da şikâyet edene ait bir konuşmadan değil).</p>
      )}
      {r.details && <p className="mt-3 rounded-xl bg-[#141210] p-3 text-sm text-gray-300">Açıklama: {r.details}</p>}
      {r.status === "open" ? (
        <div className="mt-4 space-y-2">
          <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder="Karar notu (isteğe bağlı)" className={inputCls} aria-label="Karar notu" />
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy} onClick={() => decide("resolved")} className={btnOk}>
              <CheckCircle2 size={16} /> Çözüldü
            </button>
            <button type="button" disabled={busy} onClick={() => decide("dismissed")} className={btnDangerOutline}>
              <XCircle size={16} /> Reddet
            </button>
            {r.targetUserId && (
              <Link href={userHref(r.targetUserId)} className={btnSmall}>
                Kullanıcıyı aç (ban / kısıt)
              </Link>
            )}
          </div>
          <ActionMsg msg={msg} />
        </div>
      ) : (
        <p className="mt-4 text-xs text-gray-500">
          {r.resolvedBy ? `@${r.resolvedBy} · ` : ""}
          {fmtDate(r.resolvedAt)}
          {r.resolvedNote ? ` · Not: ${r.resolvedNote}` : ""}
        </p>
      )}
    </section>
  );
}

function Strikes() {
  const { data, error, loading, reload } = useApi<{ strikes: Strike[] }>("/api/admin/moderation/strikes?limit=300");
  const { busy, msg, run } = useAction();
  return (
    <Card title="Otomatik moderasyon" subtitle="Bağlantı, telefon, küfür ve spam nedeniyle engellenen mesajlar (son 300)">
      <ActionMsg msg={msg} />
      {loading && !data && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && data.strikes.length === 0 && <Empty title="İhlal yok" />}
      {data && data.strikes.length > 0 && (
        <div className={tableWrap}>
          <table className={`${tableCls} min-w-[820px]`}>
            <thead>
              <tr>
                <th className={thCls}>Kullanıcı</th>
                <th className={thCls}>İhlal</th>
                <th className={thCls}>Mesaj</th>
                <th className={thCls}>Tarih</th>
                <th className={thCls}>Kısıt</th>
              </tr>
            </thead>
            <tbody>
              {data.strikes.map((s) => (
                <tr key={s.id}>
                  <td className={tdCls}>
                    <UserLink user={s.user} size={26} />
                  </td>
                  <td className={tdCls}>
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldAlert size={14} className="text-red-300" />
                      {strikeText[s.kind] ?? s.kind}
                    </span>
                    <span className="block text-xs text-gray-500">{s.context}</span>
                  </td>
                  <td className={`${tdCls} max-w-[300px] text-xs text-gray-300`}>
                    <span className="line-clamp-2 break-words">{s.sample ?? "—"}</span>
                  </td>
                  <td className={`${tdCls} whitespace-nowrap text-xs text-gray-400`}>{fmtDate(s.createdAt)}</td>
                  <td className={tdCls}>
                    {s.restrictedUntil ? (
                      <button
                        type="button"
                        disabled={busy}
                        className={btnSmall}
                        onClick={() =>
                          run("Sohbet kısıtı kaldırıldı.", async () => {
                            await api(`/api/admin/users/${s.user.id}/chat-restriction`, { method: "POST", body: { minutes: 0 } });
                            reload();
                          })
                        }
                      >
                        <MessageSquareOff size={13} /> {fmtRel(s.restrictedUntil)} · kaldır
                      </button>
                    ) : (
                      <span className="text-xs text-gray-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
