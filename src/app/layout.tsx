import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TR Live Yönetim",
    template: "%s | TR Live",
  },
  description:
    "TR Live yönetim ve ajans paneli.",
  applicationName: "TR Live",
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#090909",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
