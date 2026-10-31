import type { Metadata } from "next";
import PanelShell from "@/components/panel-shell";
import AdminWip from "@/components/admin/wip";

export const metadata: Metadata = {
  title: "WIP Mağazası",
};

export default function Page() {
  return (
    <PanelShell panel="admin">
      <AdminWip />
    </PanelShell>
  );
}
