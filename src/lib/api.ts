// TR Live web paneli: sunucu bağlantısı ve oturum.
// Giriş, uygulamadaki hesapla yapılır (kullanıcı adı / telefon + şifre). Sitede hiçbir şifre saklanmaz;
// oturum anahtarları yalnızca bu tarayıcı sekmesinde (sessionStorage) tutulur ve sekme kapanınca silinir.

export type PanelType = "admin" | "agency";

export type PanelUser = {
  id: string;
  username?: string;
  displayName?: string;
  publicId?: string | null;
  avatarUrl?: string | null;
  systemRole?: string;
};

export type PanelSession = {
  panel: PanelType;
  token: string;
  refreshToken?: string;
  user: PanelUser;
  agencyId?: string;
  agencyName?: string;
  agencyRole?: "owner" | "assistant";
};

export const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://130-61-222-48.sslip.io"
).replace(/\/+$/, "");

const KEY = "trlive.panel.session";
const DEVICE = { name: "TR Live Web Paneli" };

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getSession(panel?: PanelType): PanelSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as PanelSession;
    if (!s?.token || (panel && s.panel !== panel)) return null;
    return s;
  } catch {
    return null;
  }
}

export function saveSession(s: PanelSession) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* gizli sekme vb. */
  }
}

export function clearSession() {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* yoksay */
  }
}

async function raw(
  path: string,
  init: { method?: string; body?: unknown; token?: string; headers?: Record<string, string> } = {}
): Promise<Response> {
  const headers: Record<string, string> = { ...(init.headers ?? {}), "X-Client": "web-panel" };
  if (init.body !== undefined) headers["Content-Type"] = "application/json";
  if (init.token) headers.Authorization = `Bearer ${init.token}`;
  return fetch(`${API_BASE}${path}`, {
    method: init.method ?? "GET",
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });
}

async function parse(res: Response): Promise<Record<string, unknown>> {
  const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  if (!res.ok) {
    const msg =
      typeof data?.message === "string"
        ? data.message
        : res.status === 426
          ? "Sunucu güncelleme istiyor."
          : `İstek başarısız (${res.status}).`;
    throw new ApiError(msg, res.status);
  }
  return data ?? {};
}

let refreshing: Promise<boolean> | null = null;

async function refresh(): Promise<boolean> {
  const s = getSession();
  if (!s?.refreshToken) return false;
  try {
    const res = await raw("/api/auth/refresh", {
      method: "POST",
      body: { refreshToken: s.refreshToken, device: DEVICE },
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { token?: string; refreshToken?: string };
    if (!data.token) return false;
    saveSession({ ...s, token: data.token, refreshToken: data.refreshToken ?? s.refreshToken });
    return true;
  } catch {
    return false;
  }
}

/** Oturumlu istek. Erişim anahtarı dolmuşsa bir kez yenilenir; olmazsa oturum kapanır. */
export async function api<T = Record<string, unknown>>(
  path: string,
  init: { method?: string; body?: unknown; headers?: Record<string, string> } = {}
): Promise<T> {
  let s = getSession();
  if (!s) throw new ApiError("Oturum bulunamadı. Lütfen yeniden giriş yapın.", 401);
  let res: Response;
  try {
    res = await raw(path, { ...init, token: s.token });
  } catch {
    throw new ApiError("Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin.", 0);
  }
  if (res.status === 401) {
    refreshing ??= refresh().finally(() => {
      refreshing = null;
    });
    if (await refreshing) {
      s = getSession();
      if (s) res = await raw(path, { ...init, token: s.token });
    }
    if (res.status === 401) {
      clearSession();
      if (typeof window !== "undefined") window.dispatchEvent(new Event("trlive-logout"));
    }
  }
  return (await parse(res)) as T;
}

/** Görsel yükleme (png / jpeg / webp): dosya gövdesi olduğu gibi gönderilir, sunucu adresini döner. */
export async function apiUpload(path: string, file: File): Promise<{ url: string }> {
  const s = getSession();
  if (!s) throw new ApiError("Oturum bulunamadı. Lütfen yeniden giriş yapın.", 401);
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) throw new ApiError("Yalnızca PNG, JPEG veya WEBP görsel yüklenebilir.", 400);
  if (file.size > 3 * 1024 * 1024) throw new ApiError("Görsel en fazla 3 MB olabilir.", 400);
  const send = (token: string) =>
    fetch(`${API_BASE}${path}`, {
      method: "PUT",
      headers: { "X-Client": "web-panel", "Content-Type": file.type, Authorization: `Bearer ${token}` },
      body: file,
      cache: "no-store",
    });
  let res: Response;
  try {
    res = await send(s.token);
    if (res.status === 401 && (await refresh())) {
      const fresh = getSession();
      if (fresh) res = await send(fresh.token);
    }
  } catch {
    throw new ApiError("Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin.", 0);
  }
  return (await parse(res)) as { url: string };
}

/** Uygulama hesabıyla giriş + panel yetkisi denetimi. */
export async function login(panel: PanelType, username: string, password: string): Promise<PanelSession> {
  let res: Response;
  try {
    res = await raw("/api/auth/login", {
      method: "POST",
      body: { username: username.trim(), password, device: DEVICE },
    });
  } catch {
    throw new ApiError("Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin.", 0);
  }
  const data = (await parse(res)) as { token?: string; refreshToken?: string; user?: PanelUser };
  if (!data.token || !data.user) throw new ApiError("Sunucudan beklenen oturum bilgisi gelmedi.", 500);
  const session: PanelSession = { panel, token: data.token, refreshToken: data.refreshToken, user: data.user };
  saveSession(session);
  try {
    if (panel === "admin") {
      const role = data.user.systemRole;
      if (role !== "admin" && role !== "support") {
        throw new ApiError("Bu hesabın yönetim paneline erişim yetkisi yok.", 403);
      }
    } else {
      const me = await api<{
        owned?: { id: string; name: string; status: string } | null;
        assistant?: { agency: { id: string; name: string; status: string } } | null;
      }>("/api/agency-center/me");
      const own = me.owned && me.owned.status !== "pending" ? me.owned : null;
      const as = me.assistant?.agency ?? null;
      const a = own ?? as;
      if (!a) throw new ApiError("Bu hesap bir ajansın sahibi ya da asistanı değil.", 403);
      session.agencyId = a.id;
      session.agencyName = a.name;
      session.agencyRole = own ? "owner" : "assistant";
      saveSession(session);
    }
  } catch (e) {
    await logout();
    throw e;
  }
  return session;
}

export async function logout() {
  const s = getSession();
  clearSession();
  if (!s) return;
  try {
    await raw("/api/auth/logout", { method: "POST", body: { refreshToken: s.refreshToken }, token: s.token });
  } catch {
    /* çevrimdışı: sunucudaki oturum süresi dolunca kapanır */
  }
}

// ---------- Biçimlendirme ----------

export function fmtNumber(v: unknown): string {
  const s = String(v ?? "0");
  if (!/^-?\d+$/.test(s)) return s;
  const neg = s.startsWith("-");
  const digits = neg ? s.slice(1) : s;
  return (neg ? "-" : "") + digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function fmtMoney(cents: unknown, currency = "USD"): string {
  const s = String(cents ?? "0");
  if (!/^-?\d+$/.test(s)) return s;
  const neg = s.startsWith("-");
  const d = (neg ? s.slice(1) : s).padStart(3, "0");
  const whole = d.slice(0, -2).replace(/^0+(?=\d)/, "");
  const sym = currency === "TRY" ? "₺" : currency === "EUR" ? "€" : "$";
  return `${neg ? "-" : ""}${sym}${fmtNumber(whole)},${d.slice(-2)}`;
}

export function fmtDate(v: unknown, withTime = true): string {
  if (!v) return "—";
  const d = new Date(String(v));
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("tr-TR", withTime
    ? { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }
    : { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function fmtDuration(seconds: unknown): string {
  const s = Math.max(0, Number(seconds) || 0);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h} sa ${m} dk` : `${m} dk`;
}

export function absoluteUrl(url: unknown): string | null {
  if (typeof url !== "string" || !url) return null;
  return url.startsWith("http") ? url : `${API_BASE}${url}`;
}
