import type { Metadata } from "next";
import PanelLogin from "@/components/panel-login";

export const metadata: Metadata = {
  title: "Yönetim Paneli Girişi",
};

export default function AdminLoginPage() {
  return (
    <PanelLogin
      panel="admin"
      title="Yönetim Girişi"
      description="TR Live platform yönetim merkezine güvenli erişim."
    />
  );
}
