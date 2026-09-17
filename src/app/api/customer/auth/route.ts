export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { fbGetUser, fbCreateUser, fbUpdateUser } from "@/lib/firebase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || "login";

    if (action === "login" || action === "register") {
      const telegramId = String(body.telegramId || body.userId || "").trim();
      const password = String(body.password || "");
      const displayName = String(body.displayName || "").trim();

      if (!telegramId || !/^\d{5,15}$/.test(telegramId)) {
        return NextResponse.json(
          { error: "Telegram ID không hợp lệ" },
          { status: 400 }
        );
      }

      let user = await fbGetUser(telegramId);

      if (action === "register") {
        if (user) {
          return NextResponse.json(
            { error: "ID này đã có tài khoản. Hãy đăng nhập." },
            { status: 400 }
          );
        }
        if (password.length < 6) {
          return NextResponse.json(
            { error: "Mật khẩu tối thiểu 6 ký tự" },
            { status: 400 }
          );
        }
        user = await fbCreateUser(telegramId, {
          password,
          displayName: displayName || "User " + telegramId,
          role: "customer",
          walletBalance: 0,
        });
      } else {
        // login
        if (!user) {
          // auto create with default password if first time
          if (password === "123456") {
            user = await fbCreateUser(telegramId, {
              password: "123456",
              displayName: "User " + telegramId,
              role: "customer",
              walletBalance: 0,
            });
          } else {
            return NextResponse.json(
              { error: "Tài khoản chưa tồn tại. Hãy đăng ký." },
              { status: 404 }
            );
          }
        }
        const dbPass = user.password || "123456";
        if (password !== dbPass) {
          return NextResponse.json({ error: "Sai mật khẩu" }, { status: 401 });
        }
      }

      const res = NextResponse.json({
        ok: true,
        user: {
          telegramId: user.telegramId,
          displayName: user.displayName || "User",
          walletBalance: user.walletBalance || 0,
          role: user.role || "customer",
        },
      });
      res.cookies.set(
        "lg_customer",
        JSON.stringify({ telegramId: user.telegramId, ts: Date.now() }),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 90,
        }
      );
      return res;
    }

    if (action === "me") {
      const cookie = req.cookies.get("lg_customer")?.value;
      if (!cookie) return NextResponse.json({ user: null });
      try {
        const sess = JSON.parse(cookie);
        const user = await fbGetUser(String(sess.telegramId));
        if (!user) return NextResponse.json({ user: null });
        return NextResponse.json({
          user: {
            telegramId: user.telegramId,
            displayName: user.displayName || "User",
            walletBalance: user.walletBalance || 0,
            role: user.role || "customer",
          },
        });
      } catch {
        return NextResponse.json({ user: null });
      }
    }

    if (action === "change_password") {
      const telegramId = String(body.telegramId || "").trim();
      const current = String(body.currentPassword || "");
      const next = String(body.newPassword || "");
      if (next.length < 6) {
        return NextResponse.json(
          { error: "Mật khẩu mới tối thiểu 6 ký tự" },
          { status: 400 }
        );
      }
      const user = await fbGetUser(telegramId);
      if (!user) {
        return NextResponse.json({ error: "Không tìm thấy tài khoản" }, { status: 404 });
      }
      const dbPass = user.password || "123456";
      if (current !== dbPass) {
        return NextResponse.json({ error: "Mật khẩu hiện tại không đúng" }, { status: 401 });
      }
      await fbUpdateUser(telegramId, { password: next });
      return NextResponse.json({ ok: true });
    }

    if (action === "logout") {
      const res = NextResponse.json({ ok: true });
      res.cookies.set("lg_customer", "", { path: "/", maxAge: 0 });
      return res;
    }

    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  } catch (e) {
    console.error("[auth]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
