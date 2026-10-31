"use client";

import { useState } from "react";
import { Headphones } from "lucide-react";
import { useApi } from "@/lib/use-api";
import { Card, Empty, ErrorBox, Loading, PageHeader } from "@/components/ui";
import { Avatar } from "./user-picker";
import { UserLink, fmtRel } from "./kit";
import { SupportThread } from "./user-history";

type Thread = {
  userId: string;
  username: string;
  displayName: string;
  publicId: string | null;
  avatarUrl: string | null;
  lastMessage: string;
  lastFromStaff: boolean;
  lastAt: string;
  waiting: number;
};

export default function AdminSupport() {
  const { data, error, loading, reload } = useApi<{ threads: Thread[] }>("/api/admin/support/threads");
  const [sel, setSel] = useState<Thread | null>(null);
  const waiting = data?.threads.filter((t) => t.waiting > 0).length ?? 0;
  return (
    <div>
      <PageHeader
        icon={<Headphones size={18} />}
        kicker="Müşteri hizmetleri"
        title="Destek mesajları"
        description={data ? `${waiting} kişi yanıt bekliyor. Yanıtlarınız uygulamadaki Destek bölümünde görünür.` : "Uygulamadaki Destek bölümünden gelen mesajlar."}
        action={
          <button type="button" onClick={reload} className="rounded-xl border border-[#4b3c22] bg-[#17140e] px-4 py-2 text-sm text-[#d7b56d] hover:bg-[#211a0f]">
            Yenile
          </button>
        }
      />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Card title="Konuşmalar" subtitle="Yanıt bekleyenler üstte">
          {loading && !data && <Loading />}
          {error && <ErrorBox message={error} onRetry={reload} />}
          {data && data.threads.length === 0 && <Empty title="Destek mesajı yok" />}
          {data && data.threads.length > 0 && (
            <ul className="max-h-[640px] space-y-1 overflow-y-auto">
              {data.threads.map((t) => (
                <li key={t.userId}>
                  <button
                    type="button"
                    onClick={() => setSel(t)}
                    className={`flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                      sel?.userId === t.userId ? "border-[#8c713d] bg-[#1d170d]" : "border-transparent hover:border-[#30291e] hover:bg-[#15120c]"
                    }`}
                  >
                    <Avatar url={t.avatarUrl} name={t.displayName || t.username} size={36} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-white">{t.displayName || t.username}</span>
                        <span className="shrink-0 text-[11px] text-gray-500">{fmtRel(t.lastAt)}</span>
                      </span>
                      <span className="mt-0.5 flex items-center justify-between gap-2">
                        <span className="truncate text-xs text-gray-400">
                          {t.lastFromStaff ? "Siz: " : ""}
                          {t.lastMessage}
                        </span>
                        {t.waiting > 0 && <span className="shrink-0 rounded-full bg-red-600 px-1.5 text-[11px] font-bold text-white">{t.waiting}</span>}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card
          title={sel ? undefined : "Konuşma"}
          action={sel ? <UserLink user={{ id: sel.userId, username: sel.username, displayName: sel.displayName, avatarUrl: sel.avatarUrl, publicId: sel.publicId }} /> : undefined}
        >
          {sel ? <SupportThread key={sel.userId} userId={sel.userId} onSent={reload} /> : <p className="py-16 text-center text-sm text-gray-500">Soldan bir konuşma seçin.</p>}
        </Card>
      </div>
    </div>
  );
}
