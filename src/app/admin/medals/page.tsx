import type { Metadata } from "next";
import PanelShell from "@/components/panel-shell";
import AdminMedals from "@/components/admin/medals";

export const metadata: Metadata = {
  title: "Madalya Sistemi",
};

export default function Page() {
  return (
    <PanelShell panel="admin">
      <AdminMedals />
    </PanelShell>
  );
}
