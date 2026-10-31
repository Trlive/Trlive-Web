import type { Metadata } from "next";
import PanelShell from "@/components/panel-shell";
import AdminSecurity from "@/components/admin/security";

export const metadata: Metadata = {
  title: "Güvenlik",
};

export default function Page() {
  return (
    <PanelShell panel="admin">
      <AdminSecurity />
    </PanelShell>
  );
}
