import type { Metadata } from "next";
import { Suspense } from "react";
import PanelShell from "@/components/panel-shell";
import { Loading } from "@/components/ui";
import { AdminPayoutDetail } from "@/components/admin/payouts";

export const metadata: Metadata = {
  title: "Dönem Detayı",
};

export default function Page() {
  return (
    <PanelShell panel="admin">
      <Suspense fallback={<Loading />}>
        <AdminPayoutDetail />
      </Suspense>
    </PanelShell>
  );
}
