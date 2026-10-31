import type { Metadata } from "next";
import PanelShell from "@/components/panel-shell";
import AgencyDashboard from "@/components/agency/dashboard";

export const metadata: Metadata = {
  title: "Ajans Paneli",
};

export default function Page() {
  return (
    <PanelShell panel="agency">
      <AgencyDashboard />
    </PanelShell>
  );
}
