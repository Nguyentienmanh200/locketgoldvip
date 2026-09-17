import { NextRequest, NextResponse } from "next/server";
import {
  getSettings,
  getAllUsers,
  addBalance,
  getUserById,
} from "@/lib/store";
import { sendZaloMessage } from "@/lib/zalo";

/**
 * Sepay webhook — khi có chuyển khoản vào TK
 * Nội dung chuyển khoản dạng: NAP{userId} hoặc username
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }

    const settings = await getSettings();
    const apiKey = settings.sepay_api_key;
    const headerKey =
      req.headers.get("authorization") ||
      req.headers.get("x-api-key") ||
      "";

    if (apiKey && headerKey && !headerKey.includes(apiKey)) {
      // Một số Sepay gửi key trong body
      if (body.api_key !== apiKey && body.token !== apiKey) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      }
    }

    console.log("[Sepay]", JSON.stringify(body).slice(0, 800));

    const amount = Number(
      body.transferAmount || body.amount || body.creditAmount || 0
    );
    const content = String(
      body.content || body.description || body.transferContent || ""
    ).toUpperCase();

    if (!amount || amount <= 0) {
      return NextResponse.json({ ok: true, skipped: "no_amount" });
    }

    // Tìm user: NAP123 hoặc username trong nội dung
    let userId: number | null = null;
    const napMatch = content.match(/NAP\s*(\d+)/i);
    if (napMatch) {
      userId = parseInt(napMatch[1], 10);
    }

    const users = await getAllUsers();
    if (!userId) {
      for (const u of users) {
        if (
          content.includes(u.username.toUpperCase()) ||
          (u.zaloId && content.includes(u.zaloId.toUpperCase()))
        ) {
          userId = u.id;
          break;
        }
      }
    }

    if (!userId) {
      console.warn("[Sepay] Cannot match user for content:", content);
      return NextResponse.json({ ok: true, matched: false, content });
    }

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ ok: true, matched: false, userId });
    }

    await addBalance(
      userId,
      amount,
      "deposit",
      `Sepay nạp tự động: ${content}`
    );

    if (user.zaloId) {
      await sendZaloMessage(
        user.zaloId,
        `✅ Đã nhận nạp *${amount.toLocaleString("vi-VN")}đ*\nSố dư mới sẽ cập nhật khi bạn gõ *sodu*.`
      );
    }

    return NextResponse.json({
      ok: true,
      matched: true,
      userId,
      amount,
    });
  } catch (e) {
    console.error("[Sepay Error]", e);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ service: "Sepay Webhook", status: "ready" });
}
