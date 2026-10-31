import type { Metadata } from "next";
import PanelShell from "@/components/panel-shell";
import AgencySettings from "@/components/agency/settings";

export const metadata: Metadata = {
  title: "Ajans Bilgileri",
};

export default function Page() {
  return (
    <PanelShell panel="agency">
      <AgencySettings />
    </PanelShell>
  );
}
