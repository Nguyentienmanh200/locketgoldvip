export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import {
  fbGetUser,
  fbGetProducts,
  fbGetProduct,
  fbGetOrders,
  fbCreateOrder,
  fbUpdateUser,
  fbGetDiscount,
} from "@/lib/firebase";
import { callLocketApi } from "@/lib/locket";
import { generateVietQR, getBankInfo } from "@/lib/bank";

async function sessionUser(req: NextRequest) {
  const cookie = req.cookies.get("lg_customer")?.value;
  if (!cookie) return null;
  try {
    const sess = JSON.parse(cookie);
    return fbGetUser(String(sess.telegramId));
  } catch {
    return null;
  }
}

function displayPrice(
  product: { id: string; price: number; ctvPrice?: number },
  user: { role?: string; customPrices?: Record<string, number> } | null
) {
  if (user?.customPrices) {
    const k = String(product.id);
    if (user.customPrices[k] != null) return Number(user.customPrices[k]);
  }
  if (
    user &&
    (user.role === "ctv" || user.role === "agent" || user.role === "admin") &&
    product.ctvPrice != null
  ) {
    return Number(product.ctvPrice);
  }
  return Number(product.price) || 0;
}

export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action") || "products";
  const user = await sessionUser(req);

  if (action === "products") {
    const products = await fbGetProducts();
    const list = products.map((p) => ({
      ...p,
      price: displayPrice(p, user),
      originalPrice: p.price,
    }));
    return NextResponse.json({ products: list });
  }

  if (action === "orders") {
    if (!user) return NextResponse.json({ error: "login" }, { status: 401 });
    const orders = await fbGetOrders(user.telegramId);
    return NextResponse.json({ orders });
  }

  if (action === "bank") {
    const bank = await getBankInfo();
    return NextResponse.json({ bank });
  }

  if (action === "qr") {
    if (!user) return NextResponse.json({ error: "login" }, { status: 401 });
    const amount = Math.max(10000, Number(req.nextUrl.searchParams.get("amount") || 50000));
    const content = `NAP ${user.telegramId}`;
    const qr = await generateVietQR(amount, content);
    const bank = await getBankInfo();
    return NextResponse.json({ qr, bank, content, amount });
  }

  return NextResponse.json({ error: "unknown" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const user = await sessionUser(req);
  if (!user) return NextResponse.json({ error: "login" }, { status: 401 });

  const body = await req.json();
  if (body.action !== "buy") {
    return NextResponse.json({ error: "unknown" }, { status: 400 });
  }

  const productId = String(body.productId || "");
  let customerInput = String(body.customerInput || body.locketUser || "").trim();
  const qty = Math.max(1, Number(body.qty) || 1);
  const discountCode = body.discountCode ? String(body.discountCode) : null;

  const um = customerInput.match(/(?:locket\.cam\/|@)([a-zA-Z0-9_]+)/i);
  if (um) customerInput = um[1];

  if (!customerInput) {
    return NextResponse.json({ error: "Nhập username Locket" }, { status: 400 });
  }

  const product = await fbGetProduct(productId);
  if (!product) {
    return NextResponse.json({ error: "Sản phẩm không tồn tại" }, { status: 400 });
  }

  const unitPrice = displayPrice(product, user);
  let total = unitPrice * qty;
  let discountPercent = 0;

  if (discountCode) {
    const d = await fbGetDiscount(discountCode);
    if (!d) {
      return NextResponse.json({ error: "Mã giảm giá không tồn tại" }, { status: 400 });
    }
    const data = d as { discountPercent?: number; validUntil?: { toDate?: () => Date } };
    if (data.validUntil?.toDate && data.validUntil.toDate() < new Date()) {
      return NextResponse.json({ error: "Mã đã hết hạn" }, { status: 400 });
    }
    discountPercent = Number(data.discountPercent) || 0;
    total = Math.round(total * (1 - discountPercent / 100));
  }

  const balance = user.walletBalance || 0;
  if (balance < total) {
    return NextResponse.json(
      { error: "Số dư không đủ", need: total, balance },
      { status: 400 }
    );
  }

  // Trừ tiền
  await fbUpdateUser(user.telegramId, { walletBalance: balance - total });

  const orderId = "ORD-" + Date.now();
  let status = "success";
  let activateMsg = "";

  const isGold = product.isGold || productId.includes("gold") || (product.name || "").toLowerCase().includes("gold");
  if (isGold) {
    try {
      const r = await callLocketApi(customerInput);
      if (r.ok) {
        activateMsg = r.message || "Kích hoạt thành công";
        status = "success";
      } else {
        // hoàn tiền
        await fbUpdateUser(user.telegramId, { walletBalance: balance });
        status = "failed";
        activateMsg = r.message || "Kích hoạt thất bại";
        await fbCreateOrder({
          telegramId: user.telegramId,
          orderId,
          productId,
          productName: product.name,
          qty,
          customerInput,
          totalAmount: total,
          status: "failed",
          ctvPriceUsed: unitPrice,
        });
        return NextResponse.json({
          ok: false,
          error: "Kích hoạt thất bại: " + activateMsg + " (đã hoàn tiền)",
          orderId,
        });
      }
    } catch (e) {
      activateMsg = String(e);
    }
  }

  await fbCreateOrder({
    telegramId: user.telegramId,
    orderId,
    productId,
    productName: product.name,
    qty,
    customerInput,
    totalAmount: total,
    status,
    ctvPriceUsed: unitPrice,
    discountCode: discountCode || null,
  });

  const fresh = await fbGetUser(user.telegramId);
  return NextResponse.json({
    ok: true,
    success: true,
    orderId,
    total,
    balance: fresh?.walletBalance ?? balance - total,
    message: activateMsg || "Đặt hàng thành công",
    bill: {
      statusHeader: "Đơn hàng đã được xác nhận",
      orderId,
      contentCK: "LK" + orderId.replace("ORD-", ""),
      createdAt: new Date().toLocaleString("vi-VN"),
      productName: product.name,
      qty,
      total,
      unitPrice,
      customerInput,
      footerMsg: activateMsg || "Đơn hàng đã ghi nhận",
    },
  });
}
