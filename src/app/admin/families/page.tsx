import type { Metadata } from "next";
import PanelShell from "@/components/panel-shell";
import { AdminFamilies } from "@/components/admin/people";

export const metadata: Metadata = {
  title: "Aileler",
};

export default function Page() {
  return (
    <PanelShell panel="admin">
      <AdminFamilies />
    </PanelShell>
  );
}
