import type { Metadata } from "next";
import { Suspense } from "react";
import PanelShell from "@/components/panel-shell";
import { Loading } from "@/components/ui";
import { AdminRoomDetail } from "@/components/admin/rooms";

export const metadata: Metadata = {
  title: "Oda Detayı",
};

export default function Page() {
  return (
    <PanelShell panel="admin">
      <Suspense fallback={<Loading />}>
        <AdminRoomDetail />
      </Suspense>
    </PanelShell>
  );
}
