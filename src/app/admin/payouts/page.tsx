import type { Metadata } from "next";
import PanelShell from "@/components/panel-shell";
import AdminPayouts from "@/components/admin/payouts";

export const metadata: Metadata = {
  title: "Maaş Dönemleri",
};

export default function Page() {
  return (
    <PanelShell panel="admin">
      <AdminPayouts />
    </PanelShell>
  );
}
