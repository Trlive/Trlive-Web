import type { Metadata } from "next";
import PanelShell from "@/components/panel-shell";
import { AdminStaff } from "@/components/admin/people";

export const metadata: Metadata = {
  title: "Yetkililer",
};

export default function Page() {
  return (
    <PanelShell panel="admin">
      <AdminStaff />
    </PanelShell>
  );
}
