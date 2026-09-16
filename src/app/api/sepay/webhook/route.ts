import { NextRequest, NextResponse } from "next/server";

/**
 * Sepay payment webhook
 * Khi nhận chuyển khoản → cộng tiền / cập nhật đơn
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }

    // Verify API key nếu Sepay gửi
    const apiKey = process.env.SEPAY_API_KEY || "";
    const headerKey =
      req.headers.get("authorization") ||
      req.headers.get("x-api-key") ||
      "";

    if (apiKey && headerKey && !headerKey.includes(apiKey)) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    console.log("[Sepay Webhook]", JSON.stringify(body).slice(0, 800));

    // TODO: parse amount, content (order code), update order status, credit wallet
    // const amount = body.transferAmount || body.amount;
    // const content = body.content || body.description;

    return NextResponse.json({ ok: true, received: true });
  } catch (e) {
    console.error("[Sepay Error]", e);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ service: "Sepay Webhook", status: "ready" });
}
