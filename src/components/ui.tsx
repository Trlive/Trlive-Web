"use client";

import type { ReactNode } from "react";
import { AlertTriangle, Inbox, Loader2, RefreshCw } from "lucide-react";

export function PageHeader({
  icon,
  kicker,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  kicker: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <div className="flex items-center gap-2 text-sm text-[#d7b56d]">
          {icon}
          {kicker}
        </div>
        <h2 className="mt-2 text-2xl font-bold text-white">{title}</h2>
        {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  note,
  icon,
  tone = "gold",
}: {
  label: string;
  value: ReactNode;
  note?: ReactNode;
  icon?: ReactNode;
  tone?: "gold" | "green" | "red" | "blue";
}) {
  const toneCls = {
    gold: "bg-[#292114] text-[#d7b56d]",
    green: "bg-[#13281c] text-[#53bd86]",
    red: "bg-[#2c1515] text-[#e35d5d]",
    blue: "bg-[#13212c] text-[#5aa9e6]",
  }[tone];
  return (
    <div className="rounded-2xl border border-[#30291e] bg-[#111111] p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-gray-400">{label}</span>
        {icon && <div className={`rounded-xl p-3 ${toneCls}`}>{icon}</div>}
      </div>
      <div className="mt-5 break-words text-2xl font-bold text-white">{value}</div>
      {note && <p className="mt-2 text-xs text-gray-500">{note}</p>}
    </div>
  );
}

export function Card({ title, subtitle, action, children }: { title?: string; subtitle?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#30291e] bg-[#111111] p-5 md:p-6">
      {(title || action) && (
        <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Loading({ label = "Yükleniyor..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-14 text-sm text-gray-400">
      <Loader2 size={18} className="animate-spin text-[#d7b56d]" />
      {label}
    </div>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-300 sm:flex-row sm:items-center sm:justify-between">
      <span className="flex items-center gap-2">
        <AlertTriangle size={17} />
        {message}
      </span>
      {onRetry && (
        <button type="button" onClick={onRetry} className="inline-flex items-center gap-2 rounded-lg border border-red-400/30 px-3 py-1.5 text-xs hover:bg-red-500/10">
          <RefreshCw size={14} />
          Tekrar dene
        </button>
      )}
    </div>
  );
}

export function Empty({ title, note }: { title: string; note?: string }) {
  return (
    <div className="py-12 text-center">
      <Inbox size={30} className="mx-auto mb-3 text-gray-600" />
      <p className="font-medium text-gray-300">{title}</p>
      {note && <p className="mt-2 text-xs text-gray-500">{note}</p>}
    </div>
  );
}

export function Notice({ tone = "ok", children }: { tone?: "ok" | "error"; children: ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-lg border p-3 text-sm ${
        tone === "error" ? "border-red-500/25 bg-red-500/10 text-red-300" : "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
      }`}
    >
      {children}
    </p>
  );
}

export function Badge({ children, tone = "gold" }: { children: ReactNode; tone?: "gold" | "green" | "red" | "gray" | "blue" }) {
  const cls = {
    gold: "border-[#8c713d] bg-[#292114] text-[#e5c77e]",
    green: "border-emerald-700/50 bg-emerald-900/30 text-emerald-300",
    red: "border-red-700/50 bg-red-900/30 text-red-300",
    gray: "border-white/10 bg-white/5 text-gray-300",
    blue: "border-sky-700/50 bg-sky-900/30 text-sky-300",
  }[tone];
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>{children}</span>;
}

export const inputCls =
  "w-full rounded-xl border border-[#30291e] bg-[#171717] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#8c713d]";

export const tableWrap = "overflow-x-auto";
export const tableCls = "w-full min-w-[640px] text-left text-sm";
export const thCls = "border-b border-[#30291e] px-4 py-3 font-medium text-gray-500";
export const tdCls = "border-b border-[#1f1b14] px-4 py-3 text-gray-200";
