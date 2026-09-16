import { NextRequest, NextResponse } from "next/server";

/**
 * Zalo OA Bot Webhook
 * URL: https://your-domain/api/zalo/webhook
 *
 * Cần set env:
 * - ZALO_BOT_TOKEN
 * - ZALO_SECRET_TOKEN (optional verify)
 * - ZALO_ADMIN_CHAT_ID
 */

const ZALO_TOKEN = process.env.ZALO_BOT_TOKEN || "";
const ZALO_SECRET = process.env.ZALO_SECRET_TOKEN || "";

async function sendZaloMessage(chatId: string, text: string) {
  if (!ZALO_TOKEN) {
    console.warn("[Zalo] Missing ZALO_BOT_TOKEN");
    return { ok: false, error: "no_token" };
  }
  // Zalo OA API endpoint - điều chỉnh theo docs OA bạn đang dùng
  const url = `https://openapi.zalo.me/v3.0/oa/message?access_token=${ZALO_TOKEN}`;
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
    console.error("[Zalo] send error", e);
    return { ok: false, error: String(e) };
  }
}

function handleCommand(text: string, displayName: string): string {
  const cmd = text.trim().toLowerCase();

  if (["hi", "hello", "xin chào", "chao"].includes(cmd)) {
    return `Xin chào ${displayName}!\n\nGõ *list* để xem sản phẩm\nGõ *mua* để đặt hàng\nGõ *sodu* để xem số dư`;
  }

  if (["list", "ds", "sản phẩm", "san pham"].some((k) => cmd.includes(k))) {
    return (
      `📦 *Danh sách sản phẩm*\n\n` +
      `1. Locket Gold 1 Tháng — 45.000đ\n` +
      `2. Locket Gold 3 Tháng — 120.000đ\n` +
      `3. Locket Gold 6 Tháng — 220.000đ\n` +
      `4. Locket Gold 1 Năm — 380.000đ\n\n` +
      `Gõ *mua 1* (hoặc số tương ứng) để đặt hàng.`
    );
  }

  if (cmd.startsWith("mua") || cmd === "buy") {
    return (
      `🛒 Để đặt hàng, gửi theo cú pháp:\n` +
      `*mua [số sản phẩm] [username Locket]*\n\n` +
      `Ví dụ: mua 1 tenlocketcuaban\n\n` +
      `Sau đó chuyển khoản theo QR / thông tin bank được gửi.`
    );
  }

  if (["sodu", "số dư", "balance", "vi"].some((k) => cmd.includes(k))) {
    return `💰 Số dư ví của bạn: *0đ*\n\nNạp tiền bằng cách chuyển khoản với nội dung mã user của bạn.`;
  }

  if (["help", "huong dan", "hướng dẫn", "menu"].some((k) => cmd.includes(k))) {
    return (
      `📋 *Menu*\n\n` +
      `• list — Xem sản phẩm\n` +
      `• mua — Đặt hàng\n` +
      `• sodu — Xem số dư\n` +
      `• help — Trợ giúp`
    );
  }

  return `Mình chưa hiểu lệnh "*${text}*".\nGõ *help* để xem hướng dẫn.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "invalid body" }, { status: 400 });
    }

    // Optional: verify secret header if Zalo sends it
    const secretHeader = req.headers.get("x-zalo-secret") || req.headers.get("x-secret-token");
    if (ZALO_SECRET && secretHeader && secretHeader !== ZALO_SECRET) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    console.log("[Zalo Webhook]", JSON.stringify(body).slice(0, 500));

    // Hỗ trợ nhiều format event Zalo (OA / Bot)
    const eventName = body.event_name || body.event || "";
    const message =
      body.message ||
      body.data?.message ||
      body.payload?.message ||
      null;

    if (!message && eventName !== "message.text.received") {
      // Acknowledge other events
      return NextResponse.json({ ok: true, ignored: true });
    }

    const text: string =
      message?.text ||
      body.text ||
      body.message?.text ||
      "";
    const chatId: string =
      message?.from?.id ||
      message?.chat?.id ||
      body.sender?.id ||
      body.user_id ||
      "";
    const displayName: string =
      message?.from?.display_name ||
      message?.from?.name ||
      body.sender?.name ||
      "Bạn";

    if (!chatId || !text) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const reply = handleCommand(text, displayName);
    const result = await sendZaloMessage(chatId, reply);

    return NextResponse.json({
      ok: true,
      replied: result.ok,
      chatId,
    });
  } catch (err) {
    console.error("[Zalo Webhook Error]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

// Zalo sometimes uses GET for verification
export async function GET(req: NextRequest) {
  const challenge = req.nextUrl.searchParams.get("challenge") ||
    req.nextUrl.searchParams.get("hub.challenge");
  if (challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({
    service: "Locket Gold VIP · Zalo Webhook",
    status: "ready",
    hasToken: Boolean(ZALO_TOKEN),
  });
}
