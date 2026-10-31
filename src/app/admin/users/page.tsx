import type { Metadata } from "next";
import PanelShell from "@/components/panel-shell";
import AdminUsers from "@/components/admin/users";

export const metadata: Metadata = {
  title: "Kullanıcı Yönetimi",
};

export default function Page() {
  return (
    <PanelShell panel="admin">
      <AdminUsers />
    </PanelShell>
  );
}
