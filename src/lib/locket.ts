import { getSettings } from "./store";

export async function locketApiRequest(
  endpoint: string,
  method: "GET" | "POST" = "GET",
  body?: Record<string, unknown> | null,
  query?: Record<string, string | number>
) {
  const settings = await getSettings();
  const base = (settings.locket_api_base_url || "").replace(/\/$/, "");
  const key = settings.locket_api_key || "";

  if (!base || !key) {
    return {
      success: false,
      status: "error",
      message: "Chưa cấu hình LOCKET_API_BASE_URL hoặc LOCKET_API_KEY",
    };
  }

  let url = `${base}${endpoint}`;
  if (query) {
    const qs = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => qs.set(k, String(v)));
    url += (url.includes("?") ? "&" : "?") + qs.toString();
  }

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        "X-API-Key": key,
      },
      body: method !== "GET" && body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return { ...data, http_code: res.status };
  } catch (e) {
    return {
      success: false,
      status: "error",
      message: "Curl/network error: " + String(e),
    };
  }
}

/** Kích hoạt Locket Gold cho username */
export async function callLocketApi(username: string) {
  const result = await locketApiRequest("/api/v1/ctv/gold", "POST", {
    user: username,
  });
  if (
    result.status === "success" ||
    result.status === "info" ||
    result.ok === true
  ) {
    return {
      ok: true,
      message: (result.message as string) || "Thành công",
      data: result.data ?? null,
    };
  }
  return {
    ok: false,
    message: (result.message as string) || "Lỗi không xác định",
  };
}

/** Thông tin CTV trên API Locket */
export async function getCtvInfo() {
  const result = await locketApiRequest("/api/v1/ctv/me", "GET");
  if (result.status === "success") {
    const data = (result.data || {}) as Record<string, unknown>;
    return {
      success: true,
      username: data.username || "",
      displayName: data.displayName || "",
      balance: data.balance || 0,
      remaining_requests: data.remaining_requests || 0,
      prices: data.prices || [],
      active: data.active || false,
    };
  }
  return {
    success: false,
    error: (result.message as string) || "Không thể lấy thông tin CTV",
  };
}

export async function getCtvOrders(limit = 20) {
  const result = await locketApiRequest("/api/v1/ctv/orders", "GET", null, {
    limit,
  });
  if (result.status === "success") {
    return { success: true, orders: result.orders || [] };
  }
  return {
    success: false,
    error: (result.message as string) || "Không thể lấy đơn CTV",
  };
}

/** Check user Locket có Gold không */
export async function checkGoldLive(username: string) {
  const result = await locketApiRequest("/api/v1/userinfo", "GET", null, {
    user: username,
  });
  if (result.username) {
    return {
      success: true,
      username: result.username as string,
      displayName: (result.displayName as string) || "",
      uid: (result.uid as string) || "",
      isGold: Boolean(result.isGold),
      badge: (result.badge as string) || "",
      avatar: (result.avatar as string) || (result.photoURL as string) || "",
    };
  }
  return {
    success: false,
    error: (result.message as string) || "Không thể kiểm tra user",
  };
}

/** Gọi API order tùy chỉnh của sản phẩm */
export async function callOrderApi(
  apiUrl: string,
  apiKey: string,
  payload: Record<string, unknown>
) {
  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-API-Key": apiKey,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && (data.success !== false)) {
      return { success: true, message: data.message || "OK", data };
    }
    return {
      success: false,
      message: data.message || `HTTP ${res.status}`,
    };
  } catch (e) {
    return { success: false, message: String(e) };
  }
}
