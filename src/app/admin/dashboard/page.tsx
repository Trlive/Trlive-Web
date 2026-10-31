import type { Metadata } from "next";
import PanelShell from "@/components/panel-shell";
import AdminDashboard from "@/components/admin/dashboard";

export const metadata: Metadata = {
  title: "Yönetim Paneli",
};

export default function Page() {
  return (
    <PanelShell panel="admin">
      <AdminDashboard />
    </PanelShell>
  );
}
