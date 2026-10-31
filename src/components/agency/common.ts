import { getSession } from "@/lib/api";

/** Oturumdaki ajans (girişte seçilir). */
export function currentAgency() {
  const s = getSession("agency");
  return { id: s?.agencyId ?? "", name: s?.agencyName ?? "", role: s?.agencyRole ?? "assistant" };
}

export type Period = { key: string; startsAt: string; endsAt: string; daysLeft?: number };

export function periodText(p?: Period | null) {
  if (!p) return "";
  const f = (v: string) => new Date(v).toLocaleDateString("tr-TR", { day: "2-digit", month: "long" });
  const end = new Date(new Date(p.endsAt).getTime() - 1000).toISOString();
  return `${f(p.startsAt)} – ${f(end)}${p.daysLeft != null ? ` · ${p.daysLeft} gün kaldı` : ""}`;
}
