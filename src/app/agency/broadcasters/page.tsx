import type { Metadata } from "next";
import PanelShell from "@/components/panel-shell";
import AgencyBroadcasters from "@/components/agency/broadcasters";

export const metadata: Metadata = {
  title: "Yayıncılarım",
};

export default function Page() {
  return (
    <PanelShell panel="agency">
      <AgencyBroadcasters />
    </PanelShell>
  );
}
