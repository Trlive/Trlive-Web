import type { Metadata } from "next";
import PanelShell from "@/components/panel-shell";
import AdminAnnouncements from "@/components/admin/announcements";

export const metadata: Metadata = {
  title: "Duyurular",
};

export default function Page() {
  return (
    <PanelShell panel="admin">
      <AdminAnnouncements />
    </PanelShell>
  );
}
