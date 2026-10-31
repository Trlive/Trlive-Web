import type { Metadata } from "next";
import PanelShell from "@/components/panel-shell";
import AgencyInvite from "@/components/agency/invite";

export const metadata: Metadata = {
  title: "Davet ve Transfer",
};

export default function Page() {
  return (
    <PanelShell panel="agency">
      <AgencyInvite />
    </PanelShell>
  );
}
