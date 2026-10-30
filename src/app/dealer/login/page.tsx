import type { Metadata } from "next";
import PanelLogin from "@/components/panel-login";

export const metadata: Metadata = {
  title: "Coin Bayi Girişi",
};

export default function DealerLoginPage() {
  return (
    <PanelLogin
      panel="dealer"
      title="Coin Bayi Girişi"
      description="TR Live Coin bayi yönetim alanına güvenli erişim."
    />
  );
}
