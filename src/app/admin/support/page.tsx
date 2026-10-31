import type { Metadata } from "next";
import PanelShell from "@/components/panel-shell";
import AdminSupport from "@/components/admin/support";

export const metadata: Metadata = {
  title: "Destek",
};

export default function Page() {
  return (
    <PanelShell panel="admin">
      <AdminSupport />
    </PanelShell>
  );
}
