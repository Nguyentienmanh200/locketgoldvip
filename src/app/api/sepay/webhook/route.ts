export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import {
  getSettings,
  getAllUsers,
  getUserByUsername,
  getUserById,
  updateUserBalance,
  addTransaction,
  getAllTransactions,
} from "@/lib/store";
import { sendZaloMessage } from "@/lib/zalo";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ status: "error" });

    const settings = await getSettings();
    const sepayKey = settings.sepay_api_key;
    const authHeader =
      req.headers.get("authorization") || req.headers.get("Authorization") || "";
    const isValidAuth =
      authHeader === "Bearer " + sepayKey ||
      authHeader === "Apikey " + sepayKey ||
      body.api_key === sepayKey;

    const isSePay =
      body.gateway || body.id || body.transactionDate || body.transferAmount;
    if (!isSePay) {
      return NextResponse.json({ status: "ignored" });
    }

    if (sepayKey && !isValidAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const amount = Number(body.transferAmount || body.amount || 0);
    const content = String(body.content || body.description || "");
    const txId = String(body.id || body.referenceCode || "");

    // Chống xử lý trùng
    if (txId) {
      const txs = await getAllTransactions();
      if (txs.some((t) => (t.note || "").includes(txId))) {
        return NextResponse.json({ success: true, duplicate: true });
      }
    }

    if (amount <= 0 || !content) {
      return NextResponse.json({ success: true, skipped: true });
    }

    // NAP username (giống PHP gốc)
    const match = content.match(/NAP\s+([a-zA-Z0-9_]+)/i);
    const napId = content.match(/NAP\s*(\d+)/i);

    let user = null;
    if (napId) {
      user = await getUserById(parseInt(napId[1], 10));
    }
    if (!user && match) {
      const rawName = match[1];
      const allUsers = await getAllUsers();
      for (const u of allUsers) {
        const cleanDisplay = (u.displayName || "").replace(/[^a-zA-Z0-9]/g, "");
        if (cleanDisplay.toLowerCase() === rawName.toLowerCase()) {
          user = u;
          break;
        }
        if (u.username.toLowerCase() === rawName.toLowerCase()) {
          user = u;
          break;
        }
      }
      if (!user) {
        for (const tryName of [
          rawName,
          rawName.toLowerCase(),
          "user_" + rawName.toLowerCase(),
        ]) {
          user = await getUserByUsername(tryName);
          if (user) break;
        }
      }
    }

    if (!user) {
      console.warn("[Sepay] user not found for", content);
      return NextResponse.json({ success: true, matched: false });
    }

    const newBalance = (user.walletBalance || 0) + amount;
    await updateUserBalance(user.id, newBalance);
    await addTransaction({
      userId: user.id,
      type: "deposit",
      amount,
      note: `Auto Bank SePay: ${content} (tx: ${txId})`,
      balanceAfter: newBalance,
    });

    if (settings.admin_zalo_id) {
      await sendZaloMessage(
        settings.admin_zalo_id,
        `💳 NẠP TIỀN THÀNH CÔNG\nUser: ${user.username}\n+${amount.toLocaleString("vi-VN")}đ\nSố dư: ${newBalance.toLocaleString("vi-VN")}đ`
      );
    }
    if (user.zaloId) {
      await sendZaloMessage(
        user.zaloId,
        `✅ Bạn đã nạp thành công ${amount.toLocaleString("vi-VN")}đ. Số dư: ${newBalance.toLocaleString("vi-VN")}đ.`
      );
    }

    return NextResponse.json({ success: true, matched: true, userId: user.id });
  } catch (e) {
    console.error("[Sepay]", e);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ service: "Sepay Webhook", status: "ready" });
}
