import type { Metadata } from "next";
import PanelShell from "@/components/panel-shell";
import AdminSettings from "@/components/admin/settings";

export const metadata: Metadata = {
  title: "Yönetim Ayarları",
};

export default function Page() {
  return (
    <PanelShell panel="admin">
      <AdminSettings />
    </PanelShell>
  );
}
