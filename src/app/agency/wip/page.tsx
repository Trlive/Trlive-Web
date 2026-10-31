"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Bu sayfa "Davet ve Transfer" sayfasına taşındı.
export default function Page() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/agency/invite");
  }, [router]);
  return null;
}
