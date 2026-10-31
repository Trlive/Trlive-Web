import type { Metadata } from "next";
import PanelShell from "@/components/panel-shell";
import AgencyEarnings from "@/components/agency/earnings";

export const metadata: Metadata = {
  title: "Kazançlar",
};

export default function Page() {
  return (
    <PanelShell panel="agency">
      <AgencyEarnings />
    </PanelShell>
  );
}
