import type { Metadata } from "next";
import PanelShell from "@/components/panel-shell";
import { AdminKyc } from "@/components/admin/people";

export const metadata: Metadata = {
  title: "Kimlik Onayları",
};

export default function Page() {
  return (
    <PanelShell panel="admin">
      <AdminKyc />
    </PanelShell>
  );
}
