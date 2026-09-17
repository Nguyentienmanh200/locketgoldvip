import { getSettings } from "./store";

export async function sendZaloMessage(chatId: string, text: string) {
  const s = await getSettings();
  const token = s.zalo_bot_token;
  if (!token) {
    console.warn("[Zalo] Missing token");
    return { ok: false, error: "no_token" };
  }
  const url = `https://openapi.zalo.me/v3.0/oa/message?access_token=${token}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { user_id: chatId },
        message: { text },
      }),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function sendZaloImage(
  chatId: string,
  imageUrl: string,
  caption = ""
) {
  const s = await getSettings();
  const token = s.zalo_bot_token;
  if (!token) return { ok: false, error: "no_token" };
  const url = `https://openapi.zalo.me/v3.0/oa/message?access_token=${token}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { user_id: chatId },
        message: {
          text: caption,
          attachment: {
            type: "template",
            payload: {
              template_type: "media",
              elements: [{ media_type: "image", url: imageUrl }],
            },
          },
        },
      }),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export function formatMoney(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}
