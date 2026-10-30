import type { Metadata } from "next";
import PanelLogin from "@/components/panel-login";

export const metadata: Metadata = {
  title: "Ajans Girişi",
};

export default function AgencyLoginPage() {
  return (
    <PanelLogin
      panel="agency"
      title="Ajans Girişi"
      description="TR Live ajans yönetim alanına güvenli erişim."
    />
  );
}
