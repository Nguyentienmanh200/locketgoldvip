import { NextRequest, NextResponse } from "next/server";
import { verifyTelegramAuth, getTelegramBotUsername } from "@/lib/telegram";
import { getOrCreateUserByTelegram } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data: Record<string, string> = {};
    for (const [k, v] of Object.entries(body)) {
      if (v != null) data[k] = String(v);
    }

    const verified = await verifyTelegramAuth(data);
    if (!verified.ok) {
      return NextResponse.json(
        { error: "Xác thực Telegram không hợp lệ hoặc hết hạn" },
        { status: 401 }
      );
    }

    const telegramId = data.id;
    const displayName = [data.first_name, data.last_name]
      .filter(Boolean)
      .join(" ");
    const username = data.username || undefined;

    const user = await getOrCreateUserByTelegram(
      telegramId,
      displayName || "Telegram User",
      username
    );

    const res = NextResponse.json({
      ok: true,
      dev: verified.dev || false,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        walletBalance: user.walletBalance,
        role: user.role,
        telegramId: user.telegramId,
      },
    });

    res.cookies.set(
      "lg_session",
      JSON.stringify({
        userId: user.id,
        telegramId: user.telegramId,
        ts: Date.now(),
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      }
    );

    return res;
  } catch (e) {
    console.error("[TG Auth]", e);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

export async function GET() {
  const username = await getTelegramBotUsername();
  return NextResponse.json({
    service: "Telegram Login",
    status: "ready",
    botUsername: username,
  });
}
