import crypto from "crypto";
import { getSettings } from "./store";

/** Verify Telegram Login Widget data */
export async function verifyTelegramAuth(
  data: Record<string, string>
): Promise<{ ok: boolean; dev?: boolean }> {
  const settings = await getSettings();
  const token = settings.telegram_bot_token;

  // Dev mode: chưa cấu hình bot → cho phép login bằng id (chỉ khi hash=dev_bypass)
  if (!token) {
    if (data.hash === "dev_bypass" && data.id) {
      return { ok: true, dev: true };
    }
    return { ok: false };
  }

  const checkHash = data.hash;
  if (!checkHash) return { ok: false };

  const entries = Object.keys(data)
    .filter((k) => k !== "hash")
    .sort()
    .map((k) => `${k}=${data[k]}`);
  const dataCheckString = entries.join("\n");

  const secretKey = crypto.createHash("sha256").update(token).digest();
  const hmac = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (hmac !== checkHash) return { ok: false };

  const authDate = parseInt(data.auth_date || "0", 10);
  if (Date.now() / 1000 - authDate > 86400) return { ok: false };

  return { ok: true };
}

export async function getTelegramBotUsername() {
  const s = await getSettings();
  return s.telegram_bot_username || "";
}
