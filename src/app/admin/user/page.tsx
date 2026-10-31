import type { Metadata } from "next";
import { Suspense } from "react";
import PanelShell from "@/components/panel-shell";
import { Loading } from "@/components/ui";
import AdminUserDetail from "@/components/admin/user-detail";

export const metadata: Metadata = {
  title: "Kullanıcı Detayı",
};

export default function Page() {
  return (
    <PanelShell panel="admin">
      <Suspense fallback={<Loading />}>
        <AdminUserDetail />
      </Suspense>
    </PanelShell>
  );
}
