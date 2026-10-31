import type { Metadata } from "next";
import PanelShell from "@/components/panel-shell";
import AdminFinance from "@/components/admin/finance";

export const metadata: Metadata = {
  title: "Mali Kayıtlar",
};

export default function Page() {
  return (
    <PanelShell panel="admin">
      <AdminFinance />
    </PanelShell>
  );
}
