import type { Metadata } from "next";
import PanelShell from "@/components/panel-shell";
import AdminReports from "@/components/admin/reports";

export const metadata: Metadata = {
  title: "Şikâyetler",
};

export default function Page() {
  return (
    <PanelShell panel="admin">
      <AdminReports />
    </PanelShell>
  );
}
