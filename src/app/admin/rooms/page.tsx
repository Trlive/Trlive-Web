import type { Metadata } from "next";
import PanelShell from "@/components/panel-shell";
import AdminRooms from "@/components/admin/rooms";

export const metadata: Metadata = {
  title: "Odalar",
};

export default function Page() {
  return (
    <PanelShell panel="admin">
      <AdminRooms />
    </PanelShell>
  );
}
