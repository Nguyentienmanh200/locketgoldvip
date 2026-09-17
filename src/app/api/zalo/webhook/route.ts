export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import {
  getOrCreateUserByZalo,
  getAllProducts,
  getProductById,
  getProductEffectivePrice,
  getDiscount,
  useDiscount,
  getGiftcode,
  useGiftcode,
  changeProductStock,
  updateUserBalance,
  addTransaction,
  createOrder,
  generateOrderId,
  addBalance,
  refundOrder,
  updateOrderStatus,
  getZaloSession,
  updateZaloSession,
  deleteZaloSession,
  getSettings,
  updateSetting,
  getUserByUsername,
  updateUser,
} from "@/lib/store";
import { callLocketApi, checkGoldLive, callOrderApi } from "@/lib/locket";
import { generateVietQR, getBankInfo } from "@/lib/bank";
import { sendZaloMessage, sendZaloImage, formatMoney } from "@/lib/zalo";
import type { User } from "@/lib/types";

async function reply(chatId: string, msg: string) {
  return sendZaloMessage(chatId, msg);
}

async function processBuy(
  user: User,
  zaloId: string,
  productId: string,
  customerInput: string,
  finalPrice: number,
  discountCode: string | null,
  discountAmount: number
) {
  const product = await getProductById(productId);
  if (!product) {
    await deleteZaloSession(zaloId);
    return "❌ Sản phẩm không còn tồn tại.";
  }
  const stock = product.stock ?? -1;
  if (stock === 0) {
    await deleteZaloSession(zaloId);
    return "❌ Sản phẩm đã hết hàng.";
  }

  if ((user.walletBalance || 0) < finalPrice) {
    await updateZaloSession(zaloId, {
      step: "wait_payment",
      productId,
      customerInput,
      price: finalPrice,
      finalPrice,
      discountCode,
      discountAmount,
    });
    return (
      `❌ Số dư không đủ (cần ${formatMoney(finalPrice)}).\n` +
      `Gửi *nap ${finalPrice}* để tạo QR nạp tiền, hoặc *huỷ* để thoát.`
    );
  }

  // Trừ stock
  if (stock !== -1) {
    const changed = await changeProductStock(productId, -1);
    if (changed === false) {
      return "❌ Sản phẩm vừa hết hàng. Thử lại sau.";
    }
  }

  const newBalance = (user.walletBalance || 0) - finalPrice;
  await updateUserBalance(user.id, newBalance);
  await addTransaction({
    userId: user.id,
    type: "order",
    amount: -finalPrice,
    note: `Mua ${product.name} - ${customerInput}`,
    balanceAfter: newBalance,
  });

  const orderId = generateOrderId();
  await createOrder({
    orderId,
    userId: user.id,
    productId,
    productName: product.name,
    qty: 1,
    customerInput,
    price: product.price,
    discountCode,
    discountAmount,
    totalAmount: finalPrice,
    status: "processing",
    source: "zalo",
  });

  if (discountCode) await useDiscount(discountCode);
  await deleteZaloSession(zaloId);

  // Kích hoạt Locket / API
  let activateMsg = "";
  const isLocket =
    productId.includes("locket") ||
    product.name.toLowerCase().includes("locket gold");

  if (isLocket) {
    const apiResult = await callLocketApi(customerInput);
    if (apiResult.ok) {
      await updateOrderStatus(orderId, "success");
      activateMsg = `\n✅ Kích hoạt Locket Gold thành công!\n${apiResult.message}`;
    } else {
      await refundOrder(orderId, user.id, finalPrice);
      if (stock !== -1) await changeProductStock(productId, 1);
      activateMsg = `\n❌ Kích hoạt thất bại: ${apiResult.message}\nĐã hoàn tiền.`;
    }
  } else if (product.api_order_enabled && product.api_url && product.api_key) {
    const apiResult = await callOrderApi(product.api_url, product.api_key, {
      product_id: product.id,
      product_name: product.name,
      username: customerInput,
      user_id: user.id,
      order_id: orderId,
      amount: finalPrice,
      qty: 1,
      timestamp: Date.now(),
    });
    if (apiResult.success) {
      await updateOrderStatus(orderId, "success");
      activateMsg = `\n✅ Gọi API order thành công!`;
    } else {
      await refundOrder(orderId, user.id, finalPrice);
      if (stock !== -1) await changeProductStock(productId, 1);
      activateMsg = `\n❌ API thất bại: ${apiResult.message}\nĐã hoàn tiền.`;
    }
  } else {
    await updateOrderStatus(orderId, "success");
    activateMsg = "\n✅ Đơn đã ghi nhận (xử lý thủ công).";
  }

  // Báo admin
  const settings = await getSettings();
  if (settings.admin_zalo_id) {
    await sendZaloMessage(
      settings.admin_zalo_id,
      `🛒 ĐƠN MỚI\nMã: ${orderId}\nSP: ${product.name}\nKhách: @${user.username}\nInput: ${customerInput}\nTiền: ${formatMoney(finalPrice)}`
    );
  }

  return (
    `✅ *Đặt hàng thành công*\n\n` +
    `Mã đơn: *${orderId}*\n` +
    `SP: ${product.name}\n` +
    `Username: ${customerInput}\n` +
    `Thanh toán: ${formatMoney(finalPrice)}\n` +
    `Số dư còn: ${formatMoney(newBalance)}` +
    activateMsg
  );
}

async function handleCommand(
  text: string,
  displayName: string,
  zaloId: string
): Promise<string> {
  const cmd = text.trim().toLowerCase();
  const raw = text.trim();
  const user = await getOrCreateUserByZalo(zaloId, displayName);
  const settings = await getSettings();
  const isAdminUser =
    settings.admin_zalo_id && settings.admin_zalo_id === zaloId;

  // ---- Session: mã giảm giá / không ----
  if (
    cmd.startsWith("magiamgia ") ||
    cmd === "không" ||
    cmd === "ko" ||
    cmd === "no"
  ) {
    const state = await getZaloSession(zaloId);
    if (!state || state.step !== "buy") {
      await deleteZaloSession(zaloId);
      return "❌ Không có giao dịch đang chờ. Gõ *mua* để bắt đầu.";
    }
    let discountAmount = 0;
    let discountCode: string | null = null;
    if (cmd.startsWith("magiamgia ")) {
      const code = raw.slice(10).trim();
      const d = await getDiscount(code);
      if (!d || (d.used || 0) >= (d.max_uses || 0)) {
        return "❌ Mã giảm giá không hợp lệ hoặc hết lượt.";
      }
      if (d.type === "percent") {
        discountAmount = Math.floor(((state.price as number) * d.value) / 100);
      } else {
        discountAmount = Math.min(d.value, state.price as number);
      }
      discountCode = code;
    }
    const finalPrice = Math.max(
      0,
      (state.price as number) - discountAmount
    );
    return processBuy(
      user,
      zaloId,
      state.productId as string,
      state.customerInput as string,
      finalPrice,
      discountCode,
      discountAmount
    );
  }

  // ---- chào ----
  if (["hi", "hello", "xin chào", "chao", "chào"].includes(cmd)) {
    return (
      `Xin chào ${displayName}!\n` +
      `Số dư: *${formatMoney(user.walletBalance)}*\n\n` +
      `Gõ *list* — sản phẩm\n` +
      `Gõ *mua* — đặt hàng\n` +
      `Gõ *sodu* — số dư\n` +
      `Gõ *help* — trợ giúp`
    );
  }

  // ---- list ----
  if (
    ["list", "ds", "xem sản phẩm", "products", "sản phẩm"].includes(cmd)
  ) {
    const products = await getAllProducts();
    let msg = `📦 *Danh sách sản phẩm*\n\n`;
    for (const p of products) {
      const price = await getProductEffectivePrice(p.id, user);
      const st = p.stock === -1 ? "∞" : String(p.stock);
      msg += `• *${p.id}*\n  ${p.name} — ${formatMoney(price)} (kho: ${st})\n\n`;
    }
    msg += `Cú pháp: *mua <id_sp> <username_locket>*\nVí dụ: mua locket_gold_1month tenban`;
    return msg;
  }

  // ---- mua ----
  if (cmd.startsWith("mua") || cmd.startsWith("buy")) {
    const parts = raw.split(/\s+/);
    if (parts.length < 3) {
      return (
        `❌ Cú pháp: *mua <id_sản_phẩm> <username_locket>*\n` +
        `Ví dụ: mua locket_gold_1month dora123\nGõ *list* để xem ID sản phẩm.`
      );
    }
    const productId = parts[1];
    const customerInput = parts.slice(2).join(" ");
    const product = await getProductById(productId);
    if (!product) return "❌ Sản phẩm không tồn tại. Gõ *list*.";
    if ((product.stock ?? -1) === 0) return "❌ Sản phẩm hết hàng.";

    const price = await getProductEffectivePrice(productId, user);
    await updateZaloSession(zaloId, {
      step: "buy",
      productId,
      customerInput,
      price,
    });
    return (
      `🛒 Mua *${product.name}* — ${formatMoney(price)}\n` +
      `Username: ${customerInput}\n\n` +
      `Có mã giảm giá?\n` +
      `Gửi *magiamgia <code>* hoặc *không* để tiếp tục.`
    );
  }

  // ---- nạp ----
  if (cmd.startsWith("nap") || cmd.startsWith("nạp")) {
    const parts = raw.split(/\s+/);
    let amount = 50000;
    if (parts[1] && !isNaN(parseInt(parts[1], 10))) {
      amount = parseInt(parts[1], 10);
    }
    if (amount < 10000) amount = 10000;
    const content = `NAP${user.id}`;
    const qr = await generateVietQR(amount, content);
    const bank = await getBankInfo();
    await sendZaloImage(
      zaloId,
      qr,
      `💰 QR nạp ${formatMoney(amount)}\nNội dung: ${content}`
    );
    return (
      `💰 *Nạp tiền*\n\n` +
      `🏦 ${bank.bank_name}\n` +
      `STK: *${bank.account}*\n` +
      `Chủ TK: ${bank.owner}\n` +
      `Số tiền: *${formatMoney(amount)}*\n` +
      `Nội dung: *${content}*\n\n` +
      `Chuyển đúng nội dung để cộng tiền tự động.`
    );
  }

  // ---- số dư / me ----
  if (
    ["sodu", "số dư", "balance", "vi", "tài khoản", "me", "info"].some((k) =>
      cmd.includes(k)
    )
  ) {
    return (
      `👤 *Tài khoản*\n` +
      `Tên: ${user.displayName}\n` +
      `User: @${user.username}\n` +
      `Zalo: ${zaloId}\n` +
      `Số dư: *${formatMoney(user.walletBalance)}*\n` +
      `Role: ${user.role}`
    );
  }

  // ---- check gold ----
  if (
    cmd.startsWith("check ") ||
    cmd.startsWith("gold ") ||
    cmd.startsWith("profile ")
  ) {
    const username = raw.split(/\s+/).slice(1).join(" ").trim();
    if (!username) return `Cú pháp: *check [username Locket]*`;
    const info = await checkGoldLive(username);
    if (!info.success) return `❌ ${info.error}`;
    return (
      `🔍 *${info.username}*\n` +
      `Tên: ${info.displayName}\n` +
      `UID: ${info.uid}\n` +
      `Gold: ${info.isGold ? "✅ Có" : "❌ Không"}\n` +
      (info.badge ? `Badge: ${info.badge}` : "")
    );
  }

  // ---- giftcode ----
  if (cmd.startsWith("giftcode")) {
    const code = raw.split(/\s+/)[1];
    if (!code) return `Cú pháp: *giftcode [mã]*`;
    const g = await getGiftcode(code);
    if (!g || (g.used || 0) >= (g.max_uses || 0)) {
      return "❌ Giftcode không hợp lệ hoặc hết lượt.";
    }
    await useGiftcode(code);
    await addBalance(user.id, g.reward, "giftcode", `Giftcode ${code}`);
    const updated = await getOrCreateUserByZalo(zaloId, displayName);
    return (
      `🎁 Đổi giftcode thành công!\n` +
      `+${formatMoney(g.reward)}\n` +
      `Số dư: *${formatMoney(updated.walletBalance)}*`
    );
  }

  // ---- huỷ ----
  if (["huỷ", "hủy", "cancel"].includes(cmd)) {
    await deleteZaloSession(zaloId);
    return "✅ Đã huỷ thao tác.";
  }

  // ---- order lịch sử ----
  if (cmd.startsWith("order") || cmd === "donhang" || cmd === "đơn hàng") {
    return `📋 Xem lịch sử đơn trên web hoặc liên hệ admin.\nGõ *mua* để tạo đơn mới.`;
  }

  // ---- liên hệ ----
  if (["liên hệ admin", "contact", "hotro", "hỗ trợ"].includes(cmd)) {
    return `📞 Liên hệ Admin để được hỗ trợ.\nGõ *help* xem lệnh.`;
  }

  // ---- help ----
  if (
    cmd.startsWith("help") ||
    cmd === "menu" ||
    cmd === "hướng dẫn" ||
    cmd === "huong dan"
  ) {
    return (
      `📋 *Menu*\n\n` +
      `• *list* — Sản phẩm\n` +
      `• *mua <id> <user>* — Đặt hàng\n` +
      `• *sodu* / *me* — Số dư\n` +
      `• *nap [số tiền]* — QR nạp tiền\n` +
      `• *check <user>* — Check Gold\n` +
      `• *giftcode <mã>* — Đổi code\n` +
      `• *cancel* — Huỷ\n` +
      `• *help* — Trợ giúp`
    );
  }

  // ========== ADMIN ==========
  if (isAdminUser) {
    if (cmd === "adminhelp") {
      return (
        `🔧 *Admin*\n` +
        `• nhập key <api_key>\n` +
        `• tiền <@user|+/-số>\n` +
        `• setadmin <@user>\n` +
        `• ctv <@user>\n` +
        `• ctvprice <@user> <spid> <giá>`
      );
    }
    if (cmd.startsWith("nhập key") || cmd.startsWith("setkey") || cmd.startsWith("nhap key")) {
      const newKey = raw.split(/\s+/).slice(-1)[0];
      if (!newKey || newKey.length < 5) return "❌ Cú pháp: nhập key <api_key>";
      await updateSetting("locket_api_key", newKey);
      return "✅ Đã cập nhật LOCKET_API_KEY.";
    }
    if (cmd.startsWith("tiền ") || cmd.startsWith("tien ")) {
      const parts = raw.split(/\s+/);
      if (parts.length < 3) return "Cú pháp: tiền <@username> <+/-số>";
      const uname = parts[1].replace(/^@/, "");
      const amountStr = parts[2];
      const target = await getUserByUsername(uname);
      if (!target) return "❌ Không tìm thấy user.";
      const amount = parseInt(amountStr.replace(/[^\d-]/g, ""), 10);
      if (isNaN(amount)) return "❌ Số tiền không hợp lệ.";
      await addBalance(target.id, amount, "admin_adjust", `Admin điều chỉnh`);
      const u = await getUserByUsername(uname);
      return `✅ Đã ${amount >= 0 ? "cộng" : "trừ"} ${formatMoney(Math.abs(amount))} cho @${uname}.\nSố dư: ${formatMoney(u?.walletBalance || 0)}`;
    }
    if (cmd.startsWith("ctv ")) {
      const uname = raw.split(/\s+/)[1]?.replace(/^@/, "");
      const target = await getUserByUsername(uname || "");
      if (!target) return "❌ Không tìm thấy user.";
      const nextRole = target.role === "ctv" ? "user" : "ctv";
      await updateUser(target.id, { role: nextRole });
      return `✅ @${uname} → role *${nextRole}*`;
    }
  }

  return `Mình chưa hiểu "*${text}*".\nGõ *help* để xem lệnh.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "invalid body" }, { status: 400 });
    }

    const settings = await getSettings();
    const secretHeader =
      req.headers.get("x-zalo-secret") || req.headers.get("x-secret-token");
    if (
      settings.zalo_secret_token &&
      secretHeader &&
      secretHeader !== settings.zalo_secret_token
    ) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    console.log("[Zalo]", JSON.stringify(body).slice(0, 500));

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

    const replyText = await handleCommand(text, displayName, String(chatId));
    const result = await reply(String(chatId), replyText);

    return NextResponse.json({ ok: true, replied: result.ok, chatId });
  } catch (err) {
    console.error("[Zalo Error]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const challenge =
    req.nextUrl.searchParams.get("challenge") ||
    req.nextUrl.searchParams.get("hub.challenge");
  if (challenge) return new NextResponse(challenge, { status: 200 });
  const s = await getSettings();
  return NextResponse.json({
    service: "Locket Gold VIP · Zalo Webhook",
    status: "ready",
    hasToken: Boolean(s.zalo_bot_token),
    hasLocketKey: Boolean(s.locket_api_key),
    commands: [
      "list",
      "mua",
      "sodu",
      "nap",
      "check",
      "giftcode",
      "magiamgia",
      "help",
    ],
  });
}
