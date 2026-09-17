export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy tra cứu user Locket — giống index gốc:
 * GET http://locketuser.com/api/check_user?u=username
 */
export async function GET(req: NextRequest) {
  const username = (req.nextUrl.searchParams.get("u") || "").trim();
  if (!username) {
    return NextResponse.json(
      { success: false, message: "Vui lòng nhập username" },
      { status: 400 }
    );
  }

  const apiUrl =
    "http://locketuser.com/api/check_user?u=" + encodeURIComponent(username);

  try {
    const res = await fetch(apiUrl, {
      signal: AbortSignal.timeout(20000),
      headers: { Accept: "application/json" },
    });
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch {
      return NextResponse.json({
        success: false,
        message: "Phản hồi API không hợp lệ",
        raw: text.slice(0, 200),
      });
    }
  } catch (e) {
    return NextResponse.json({
      success: false,
      message: "Lỗi kết nối API: " + String(e),
    });
  }
}
