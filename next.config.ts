import type { NextConfig } from "next";

// GitHub Pages: site statik dosya olarak üretilir (out/ klasörü) ve depo adının altında yayınlanır
// (ör. https://trlive.github.io/Trlive-Web/). Yol, yayın iş akışında NEXT_PUBLIC_BASE_PATH ile verilir.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
  // Yayın sırasında stil denetimi derlemeyi durdurmasın (tip denetimi açık kalır).
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
