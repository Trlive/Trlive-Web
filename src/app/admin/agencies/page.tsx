import type { Metadata } from "next";
import PanelShell from "@/components/panel-shell";
import AdminAgencies from "@/components/admin/agencies";

export const metadata: Metadata = {
  title: "Ajanslar",
};

export default function Page() {
  return (
    <PanelShell panel="admin">
      <AdminAgencies />
    </PanelShell>
  );
}
