export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import {
  getAllProducts,
  getProductById,
  getProductEffectivePrice,
  getUserById,
  getOrdersByUserId,
  createOrder,
  generateOrderId,
  changeProductStock,
  updateUserBalance,
  addTransaction,
  getDiscount,
  useDiscount,
  updateOrderStatus,
  addBalance,
} from "@/lib/store";
import { callLocketApi, checkGoldLive, callOrderApi } from "@/lib/locket";
import { generateVietQR, getBankInfo } from "@/lib/bank";

async function getSessionUser(req: NextRequest) {
  const cookie = req.cookies.get("lg_customer")?.value;
  if (!cookie) return null;
  try {
    const sess = JSON.parse(cookie);
    return getUserById(sess.userId);
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action") || "products";
  const user = await getSessionUser(req);

  if (action === "products") {
    const products = await getAllProducts();
    const list = [];
    for (const p of products) {
      const price = await getProductEffectivePrice(p.id, user);
      list.push({ ...p, price });
    }
    return NextResponse.json({ products: list });
  }

  if (action === "orders") {
    if (!user) return NextResponse.json({ error: "login required" }, { status: 401 });
    const orders = await getOrdersByUserId(user.id);
    return NextResponse.json({ orders });
  }

  if (action === "bank") {
    const bank = await getBankInfo();
    return NextResponse.json({ bank });
  }

  if (action === "qr") {
    if (!user) return NextResponse.json({ error: "login required" }, { status: 401 });
    const amount = Number(req.nextUrl.searchParams.get("amount") || 50000);
    const content = `NAP ${user.username}`;
    const qr = await generateVietQR(Math.max(10000, amount), content);
    const bank = await getBankInfo();
    return NextResponse.json({ qr, bank, content, amount: Math.max(10000, amount) });
  }

  if (action === "check_gold") {
    const username = req.nextUrl.searchParams.get("user") || "";
    if (!username) return NextResponse.json({ error: "missing user" }, { status: 400 });
    const info = await checkGoldLive(username);
    return NextResponse.json(info);
  }

  return NextResponse.json({ error: "unknown" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "login required" }, { status: 401 });

  const body = await req.json();
  const action = body.action;

  if (action === "buy") {
    const productId = String(body.productId || "");
    const customerInput = String(body.customerInput || body.locketUser || "").trim();
    const qty = Math.max(1, Number(body.qty) || 1);
    const discountCode = body.discountCode ? String(body.discountCode) : null;

    const product = await getProductById(productId);
    if (!product) return NextResponse.json({ error: "Sản phẩm không tồn tại" }, { status: 400 });
    if ((product.stock ?? -1) === 0) {
      return NextResponse.json({ error: "Hết hàng" }, { status: 400 });
    }

    const unitPrice = await getProductEffectivePrice(productId, user);
    let discountAmount = 0;
    if (discountCode) {
      const d = await getDiscount(discountCode);
      if (!d || (d.used || 0) >= (d.max_uses || 0)) {
        return NextResponse.json({ error: "Mã giảm giá không hợp lệ" }, { status: 400 });
      }
      if (d.type === "percent") discountAmount = Math.floor((unitPrice * qty * d.value) / 100);
      else discountAmount = Math.min(d.value, unitPrice * qty);
    }
    const total = Math.max(0, unitPrice * qty - discountAmount);

    if ((user.walletBalance || 0) < total) {
      return NextResponse.json(
        { error: "Số dư không đủ", need: total, balance: user.walletBalance },
        { status: 400 }
      );
    }

    if (product.stock !== -1) {
      const st = await changeProductStock(productId, -qty);
      if (st === false) return NextResponse.json({ error: "Hết hàng" }, { status: 400 });
    }

    const newBal = (user.walletBalance || 0) - total;
    await updateUserBalance(user.id, newBal);
    await addTransaction({
      userId: user.id,
      type: "order",
      amount: -total,
      note: `Mua ${product.name} x${qty} - ${customerInput}`,
      balanceAfter: newBal,
    });

    const orderId = generateOrderId();
    await createOrder({
      orderId,
      userId: user.id,
      productId,
      productName: product.name,
      qty,
      customerInput,
      price: unitPrice,
      discountCode,
      discountAmount,
      totalAmount: total,
      status: "processing",
      source: "web",
    });
    if (discountCode) await useDiscount(discountCode);

    let activateMsg = "";
    const isLocket =
      productId.includes("locket") || product.name.toLowerCase().includes("locket");
    if (isLocket && customerInput) {
      const r = await callLocketApi(customerInput);
      if (r.ok) {
        await updateOrderStatus(orderId, "success");
        activateMsg = r.message;
      } else {
        await addBalance(user.id, total, "refund", "Hoàn " + orderId);
        if (product.stock !== -1) await changeProductStock(productId, qty);
        await updateOrderStatus(orderId, "failed");
        return NextResponse.json({
          ok: false,
          error: "Kích hoạt thất bại: " + r.message + " (đã hoàn tiền)",
          orderId,
        });
      }
    } else if (product.api_order_enabled && product.api_url && product.api_key) {
      const r = await callOrderApi(product.api_url, product.api_key, {
        product_id: product.id,
        username: customerInput,
        order_id: orderId,
        amount: total,
        qty,
      });
      if (r.success) await updateOrderStatus(orderId, "success");
      else {
        await updateOrderStatus(orderId, "failed");
        activateMsg = r.message || "";
      }
    } else {
      await updateOrderStatus(orderId, "success");
    }

    const fresh = await getUserById(user.id);
    return NextResponse.json({
      ok: true,
      orderId,
      total,
      balance: fresh?.walletBalance ?? newBal,
      message: activateMsg,
    });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
