"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "./api";

/** Sayfa verisi: yükleniyor / hata / veri ve yeniden yükleme. path null ise istek yapılmaz. */
export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(path));
  const [tick, setTick] = useState(0);
  const lastPath = useRef(path);

  useEffect(() => {
    // Başka bir kayda geçildiyse önceki kaydın verisi gösterilmez (yalnızca "yenile"de eski veri ekranda kalır).
    if (lastPath.current !== path) {
      lastPath.current = path;
      setData(null);
    }
    if (!path) return;
    let alive = true;
    setLoading(true);
    setError("");
    api<T>(path)
      .then((d) => {
        if (alive) setData(d);
      })
      .catch((e: unknown) => {
        if (alive) setError(e instanceof Error ? e.message : "Veri alınamadı.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [path, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, loading, reload };
}
