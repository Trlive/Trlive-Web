"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Bayi paneli kaldırıldı (Coin yükleme için e-pin sistemi gelecek). Eski adres ana sayfaya yönlendirilir.
export default function Page() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);
  return null;
}
