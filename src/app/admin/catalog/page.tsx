import type { Metadata } from "next";
import PanelShell from "@/components/panel-shell";
import AdminCatalog from "@/components/admin/catalog";

export const metadata: Metadata = {
  title: "Katalog",
};

export default function Page() {
  return (
    <PanelShell panel="admin">
      <AdminCatalog />
    </PanelShell>
  );
}
