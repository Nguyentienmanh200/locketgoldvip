import { NextRequest, NextResponse } from "next/server";

/**
 * Zalo OA Bot Webhook — port từ zalo_bot.php gốc
 * URL: https://your-domain/api/zalo/webhook
 *
 * Env cần có:
 * - ZALO_BOT_TOKEN
 * - ZALO_SECRET_TOKEN (optional)
 * - ZALO_ADMIN_CHAT_ID
 */

const ZALO_TOKEN = process.env.ZALO_BOT_TOKEN || "";
const ZALO_SECRET = process.env.ZALO_SECRET_TOKEN || "";
const ADMIN_CHAT = process.env.ZALO_ADMIN_CHAT_ID || "";

async function sendZaloMessage(chatId: string, text: string) {
  if (!ZALO_TOKEN) {
    console.warn("[Zalo] Missing ZALO_BOT_TOKEN");
    return { ok: false, error: "no_token" };
  }
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

/** Sản phẩm mặc định (sau sẽ lấy từ DB) */
const PRODUCTS = [
  { id: "locket-1m", name: "Locket Gold 1 Tháng", price: 45000 },
  { id: "locket-3m", name: "Locket Gold 3 Tháng", price: 120000 },
  { id: "locket-6m", name: "Locket Gold 6 Tháng", price: 220000 },
  { id: "locket-1y", name: "Locket Gold 1 Năm", price: 380000 },
];

function formatMoney(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

function handleCommand(text: string, displayName: string, chatId: string): string {
  const cmd = text.trim().toLowerCase();
  const raw = text.trim();

  // ---- chào ----
  if (["hi", "hello", "xin chào", "chao", "chào"].includes(cmd)) {
    return (
      `Xin chào ${displayName}!\n\n` +
      `Gõ *list* — xem sản phẩm\n` +
      `Gõ *mua* — đặt hàng\n` +
      `Gõ *sodu* — xem số dư\n` +
      `Gõ *help* — trợ giúp`
    );
  }

  // ---- list / xem sản phẩm ----
  if (
    cmd === "list" ||
    cmd === "ds" ||
    cmd === "xem sản phẩm" ||
    cmd === "products" ||
    cmd === "sản phẩm"
  ) {
    let msg = `📦 *Danh sách sản phẩm*\n\n`;
    PRODUCTS.forEach((p, i) => {
      msg += `${i + 1}. ${p.name} — ${formatMoney(p.price)}\n`;
    });
    msg += `\nGõ *mua [số] [username Locket]* để đặt hàng.\nVí dụ: mua 1 tenlocket`;
    return msg;
  }

  // ---- mua ----
  if (cmd.startsWith("mua") || cmd.startsWith("buy")) {
    const parts = raw.split(/\s+/);
    // mua 1 username
    if (parts.length >= 3) {
      const idx = parseInt(parts[1], 10) - 1;
      const locketUser = parts.slice(2).join(" ");
      if (idx >= 0 && idx < PRODUCTS.length && locketUser) {
        const p = PRODUCTS[idx];
        const orderId = "LG-" + Date.now().toString().slice(-6);
        return (
          `🛒 *Đơn hàng tạo thành công*\n\n` +
          `Mã đơn: *${orderId}*\n` +
          `Sản phẩm: ${p.name}\n` +
          `Username Locket: ${locketUser}\n` +
          `Số tiền: *${formatMoney(p.price)}*\n\n` +
          `Vui lòng chuyển khoản đúng số tiền với nội dung: *${orderId}*\n` +
          `(Thông tin bank sẽ gửi sau khi cấu hình SEPAY/BANK)`
        );
      }
    }
    return (
      `🛒 Để đặt hàng, gửi theo cú pháp:\n` +
      `*mua [số sản phẩm] [username Locket]*\n\n` +
      `Ví dụ: mua 1 tenlocketcuaban\n\n` +
      `Gõ *list* để xem danh sách sản phẩm.`
    );
  }

  // ---- nạp tiền ----
  if (cmd.startsWith("nap") || cmd.startsWith("nạp")) {
    return (
      `💰 *Nạp tiền vào ví*\n\n` +
      `Chuyển khoản với nội dung là mã user / Zalo ID của bạn.\n` +
      `Hệ thống sẽ cộng tiền tự động khi nhận được (Sepay webhook).\n\n` +
      `Gõ *sodu* để xem số dư hiện tại.`
    );
  }

  // ---- số dư / tài khoản ----
  if (
    ["sodu", "số dư", "balance", "vi", "tài khoản", "me", "info"].some((k) =>
      cmd.includes(k)
    )
  ) {
    return (
      `👤 *Thông tin tài khoản*\n\n` +
      `Tên: ${displayName}\n` +
      `Zalo ID: ${chatId}\n` +
      `Số dư ví: *0đ*\n` +
      `Vai trò: User\n\n` +
      `Gõ *nap* để nạp tiền.`
    );
  }

  // ---- check gold / profile ----
  if (cmd.startsWith("check ") || cmd.startsWith("gold ") || cmd.startsWith("profile ")) {
    const username = raw.split(/\s+/).slice(1).join(" ").trim();
    if (!username) {
      return `Cú pháp: *check [username Locket]*\nVí dụ: check tenlocket`;
    }
    return (
      `🔍 Đang kiểm tra Gold cho *${username}*...\n` +
      `(Tính năng check live cần cấu hình LOCKET_API_KEY trên server)`
    );
  }

  // ---- giftcode ----
  if (cmd.startsWith("giftcode")) {
    const code = raw.split(/\s+/)[1];
    if (!code) return `Cú pháp: *giftcode [mã]*`;
    return `🎁 Đang kiểm tra giftcode *${code}*...\n(Chức năng sẽ kích hoạt khi có database)`;
  }

  // ---- huỷ ----
  if (["huỷ", "hủy", "cancel"].includes(cmd)) {
    return `✅ Đã huỷ thao tác hiện tại (nếu có).`;
  }

  // ---- liên hệ ----
  if (["liên hệ admin", "contact", "hotro", "hỗ trợ"].includes(cmd)) {
    return `📞 Liên hệ Admin để được hỗ trợ.\nGõ *help* để xem các lệnh có sẵn.`;
  }

  // ---- order ----
  if (cmd.startsWith("order")) {
    return `📋 Lịch sử đơn hàng của bạn sẽ hiển thị khi đã có database.\nGõ *mua* để tạo đơn mới.`;
  }

  // ---- help ----
  if (cmd.startsWith("help") || cmd === "menu" || cmd === "hướng dẫn" || cmd === "huong dan") {
    return (
      `📋 *Menu lệnh*\n\n` +
      `• *list* — Xem sản phẩm\n` +
      `• *mua [số] [user]* — Đặt hàng\n` +
      `• *sodu* / *me* — Số dư & tài khoản\n` +
      `• *nap* — Hướng dẫn nạp tiền\n` +
      `• *check [user]* — Kiểm tra Gold\n` +
      `• *giftcode [mã]* — Đổi giftcode\n` +
      `• *order* — Lịch sử đơn\n` +
      `• *cancel* — Huỷ thao tác\n` +
      `• *help* — Trợ giúp`
    );
  }

  // ---- admin commands (chỉ admin chat) ----
  if (ADMIN_CHAT && chatId === ADMIN_CHAT) {
    if (cmd === "adminhelp") {
      return (
        `🔧 *Admin commands*\n\n` +
        `• setkey [key] — Đổi Locket API key\n` +
        `• tiền [user] [số] — Cộng/trừ tiền\n` +
        `• ctv [user] — Set/bỏ CTV\n` +
        `• product — Quản lý sản phẩm`
      );
    }
  }

  return `Mình chưa hiểu lệnh "*${text}*".\nGõ *help* để xem hướng dẫn.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "invalid body" }, { status: 400 });
    }

    const secretHeader =
      req.headers.get("x-zalo-secret") || req.headers.get("x-secret-token");
    if (ZALO_SECRET && secretHeader && secretHeader !== ZALO_SECRET) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    console.log("[Zalo Webhook]", JSON.stringify(body).slice(0, 600));

    const eventName = body.event_name || body.event || "";
    const message =
      body.message || body.data?.message || body.payload?.message || null;

    if (!message && eventName !== "message.text.received") {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const text: string =
      message?.text || body.text || body.message?.text || "";
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

    const reply = handleCommand(text, displayName, chatId);
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

export async function GET(req: NextRequest) {
  const challenge =
    req.nextUrl.searchParams.get("challenge") ||
    req.nextUrl.searchParams.get("hub.challenge");
  if (challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({
    service: "Locket Gold VIP · Zalo Webhook",
    status: "ready",
    hasToken: Boolean(ZALO_TOKEN),
    commands: ["list", "mua", "sodu", "nap", "check", "giftcode", "help"],
  });
}
