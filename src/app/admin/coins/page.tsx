import type { Metadata } from "next";
import PanelShell from "@/components/panel-shell";
import AdminCoins from "@/components/admin/coins";

export const metadata: Metadata = {
  title: "Coin İşlemleri",
};

export default function Page() {
  return (
    <PanelShell panel="admin">
      <AdminCoins />
    </PanelShell>
  );
}
