export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import {
  getSettings,
  updateSetting,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserBalance,
  deleteUser,
  getAllProducts,
  createProduct,
  deleteProduct,
  updateProduct,
  getAllOrders,
  updateOrderStatus,
  createOrder,
  generateOrderId,
  getAllDiscounts,
  createDiscount,
  deleteDiscount,
  getAllGiftcodes,
  createGiftcode,
  deleteGiftcode,
  getCtvApplications,
  updateCtvApplication,
  setCtvPrice,
  getProductById,
  addTransaction,
  changeProductStock,
  addBalance,
} from "@/lib/store";
import { callLocketApi, callOrderApi } from "@/lib/locket";

function checkAdmin(req: NextRequest) {
  const auth = req.headers.get("x-admin-password") || "";
  return auth;
}

export async function GET(req: NextRequest) {
  const pwd = checkAdmin(req);
  const settings = await getSettings();
  if (pwd !== settings.admin_password) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const [users, products, orders, discounts, giftcodes, ctvApps, settingsSafe] =
    await Promise.all([
      getAllUsers(),
      getAllProducts(),
      getAllOrders(),
      getAllDiscounts(),
      getAllGiftcodes(),
      getCtvApplications(),
      getSettings(),
    ]);
  return NextResponse.json({
    users,
    products,
    orders,
    discounts,
    giftcodes,
    ctvApps,
    settings: {
      bank_name: settingsSafe.bank_name,
      bank_account: settingsSafe.bank_account,
      bank_owner: settingsSafe.bank_owner,
      bank_code: settingsSafe.bank_code,
      has_locket_key: Boolean(settingsSafe.locket_api_key),
      has_zalo_token: Boolean(settingsSafe.zalo_bot_token),
      has_sepay: Boolean(settingsSafe.sepay_api_key),
    },
  });
}

export async function POST(req: NextRequest) {
  const pwd = checkAdmin(req);
  const settings = await getSettings();
  if (pwd !== settings.admin_password) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const action = body.action as string;

  try {
    switch (action) {
      case "update_locket_key": {
        await updateSetting("locket_api_key", String(body.locket_api_key || ""));
        if (body.locket_api_base_url) {
          await updateSetting("locket_api_base_url", String(body.locket_api_base_url));
        }
        return NextResponse.json({ ok: true });
      }
      case "add_product": {
        const ok = await createProduct({
          id: String(body.id),
          name: String(body.name),
          price: Number(body.price) || 0,
          stock: Number(body.stock) ?? 0,
          description: body.description || "",
          api_order_enabled: Boolean(body.api_order_enabled),
          api_url: body.api_url || "",
          api_key: body.api_key || "",
        });
        return NextResponse.json({ ok });
      }
      case "delete_product": {
        await deleteProduct(String(body.id));
        return NextResponse.json({ ok: true });
      }
      case "update_product": {
        const id = String(body.id);
        if (body.price !== undefined) await updateProduct(id, "price", Number(body.price));
        if (body.stock !== undefined) await updateProduct(id, "stock", Number(body.stock));
        if (body.api_order_enabled !== undefined)
          await updateProduct(id, "api_order_enabled", Boolean(body.api_order_enabled));
        if (body.api_url !== undefined) await updateProduct(id, "api_url", body.api_url);
        if (body.api_key !== undefined) await updateProduct(id, "api_key", body.api_key);
        if (body.name !== undefined) await updateProduct(id, "name", body.name);
        return NextResponse.json({ ok: true });
      }
      case "add_discount": {
        const ok = await createDiscount(
          String(body.code),
          Number(body.value) || 0,
          body.type === "fixed" ? "fixed" : "percent",
          Number(body.max_uses) || 999
        );
        return NextResponse.json({ ok });
      }
      case "delete_discount": {
        await deleteDiscount(String(body.code));
        return NextResponse.json({ ok: true });
      }
      case "add_giftcode": {
        const ok = await createGiftcode(
          String(body.code),
          Number(body.reward) || 0,
          Number(body.max_uses) || 1
        );
        return NextResponse.json({ ok });
      }
      case "delete_giftcode": {
        await deleteGiftcode(String(body.code));
        return NextResponse.json({ ok: true });
      }
      case "update_user_balance": {
        await updateUserBalance(Number(body.user_id), Number(body.balance) || 0);
        return NextResponse.json({ ok: true });
      }
      case "set_ctv": {
        await updateUser(Number(body.user_id), {
          role: body.is_ctv ? "ctv" : "user",
        });
        return NextResponse.json({ ok: true });
      }
      case "set_admin": {
        await updateUser(Number(body.user_id), {
          role: body.is_admin ? "admin" : "user",
        });
        return NextResponse.json({ ok: true });
      }
      case "update_ctv_price": {
        await setCtvPrice(
          Number(body.user_id),
          String(body.product_id),
          Number(body.price) || 0
        );
        return NextResponse.json({ ok: true });
      }
      case "delete_user": {
        await deleteUser(Number(body.user_id));
        return NextResponse.json({ ok: true });
      }
      case "update_order_status": {
        await updateOrderStatus(String(body.order_id), body.status);
        return NextResponse.json({ ok: true });
      }
      case "create_order_manual": {
        const product = await getProductById(String(body.product_id));
        if (!product) return NextResponse.json({ error: "no product" }, { status: 400 });
        const userId = Number(body.user_id);
        const qty = Number(body.qty) || 1;
        const customerInput = String(body.customer_input || "");
        const price = product.price * qty;
        const orderId = generateOrderId();
        if (product.stock !== -1) {
          const st = await changeProductStock(product.id, -qty);
          if (st === false) return NextResponse.json({ error: "out of stock" }, { status: 400 });
        }
        await createOrder({
          orderId,
          userId,
          productId: product.id,
          productName: product.name,
          qty,
          customerInput,
          price: product.price,
          totalAmount: price,
          status: "processing",
          source: "admin",
        });
        let msg = "Đã tạo đơn " + orderId;
        if (body.call_api) {
          const isLocket =
            product.id.includes("locket") ||
            product.name.toLowerCase().includes("locket");
          if (isLocket) {
            const r = await callLocketApi(customerInput);
            if (r.ok) {
              await updateOrderStatus(orderId, "success");
              msg += " · Kích hoạt OK";
            } else {
              await addBalance(userId, price, "refund", "Hoàn đơn " + orderId);
              if (product.stock !== -1) await changeProductStock(product.id, qty);
              await updateOrderStatus(orderId, "failed");
              msg += " · Kích hoạt fail: " + r.message;
            }
          } else if (product.api_order_enabled && product.api_url && product.api_key) {
            const r = await callOrderApi(product.api_url, product.api_key, {
              product_id: product.id,
              username: customerInput,
              order_id: orderId,
              amount: price,
              qty,
            });
            if (r.success) {
              await updateOrderStatus(orderId, "success");
              msg += " · API OK";
            } else {
              await updateOrderStatus(orderId, "failed");
              msg += " · API fail";
            }
          } else {
            await updateOrderStatus(orderId, "success");
          }
        }
        return NextResponse.json({ ok: true, orderId, message: msg });
      }
      case "ctv_approve": {
        await updateCtvApplication(String(body.id), "approved");
        return NextResponse.json({ ok: true });
      }
      case "ctv_reject": {
        await updateCtvApplication(String(body.id), "rejected");
        return NextResponse.json({ ok: true });
      }
      case "export_orders_csv": {
        const orders = await getAllOrders();
        const header = "orderId,userId,productName,qty,totalAmount,status,createdAt\n";
        const rows = orders
          .map(
            (o) =>
              `${o.orderId},${o.userId},${o.productName},${o.qty},${o.totalAmount},${o.status},${o.createdAt}`
          )
          .join("\n");
        return new NextResponse(header + rows, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": "attachment; filename=orders.csv",
          },
        });
      }
      default:
        return NextResponse.json({ error: "unknown action" }, { status: 400 });
    }
  } catch (e) {
    console.error("[admin]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
