export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import {
  getUserByTelegramId,
  getUserById,
  createUser,
  updateUser,
} from "@/lib/store";
import crypto from "crypto";

function hashPw(pw: string) {
  return crypto.createHash("sha256").update(pw + "_lg_salt").digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || "login";

    if (action === "login") {
      const telegramId = String(body.telegramId || body.userId || "").trim();
      const password = String(body.password || "");
      if (!telegramId) {
        return NextResponse.json({ error: "Thiếu Telegram ID" }, { status: 400 });
      }

      let user = await getUserByTelegramId(telegramId);
      if (!user) {
        user = await createUser("tg_" + telegramId, "User " + telegramId, {
          telegramId,
          role: "user",
        });
      }

      const storedHash = user.passwordHash;
      const inputHash = hashPw(password);
      const ok =
        storedHash === inputHash ||
        (!storedHash && password === "123456");

      if (!ok) {
        return NextResponse.json(
          { error: "Sai mật khẩu (mặc định: 123456)" },
          { status: 401 }
        );
      }

      const res = NextResponse.json({
        ok: true,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          telegramId: user.telegramId,
          walletBalance: user.walletBalance,
          role: user.role,
        },
      });
      res.cookies.set(
        "lg_customer",
        JSON.stringify({ userId: user.id, telegramId, ts: Date.now() }),
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
      const user = await getUserByTelegramId(telegramId);
      if (!user)
        return NextResponse.json({ error: "User không tồn tại" }, { status: 404 });

      const storedHash = user.passwordHash;
      const curOk =
        (!storedHash && current === "123456") || storedHash === hashPw(current);
      if (!curOk) {
        return NextResponse.json(
          { error: "Mật khẩu hiện tại sai" },
          { status: 401 }
        );
      }
      await updateUser(user.id, { passwordHash: hashPw(next) });
      return NextResponse.json({ ok: true });
    }

    if (action === "me") {
      const cookie = req.cookies.get("lg_customer")?.value;
      if (!cookie) return NextResponse.json({ user: null });
      try {
        const sess = JSON.parse(cookie);
        const user = await getUserById(sess.userId);
        if (!user) return NextResponse.json({ user: null });
        return NextResponse.json({
          user: {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            telegramId: user.telegramId,
            walletBalance: user.walletBalance,
            role: user.role,
          },
        });
      } catch {
        return NextResponse.json({ user: null });
      }
    }

    if (action === "logout") {
      const res = NextResponse.json({ ok: true });
      res.cookies.set("lg_customer", "", { path: "/", maxAge: 0 });
      return res;
    }

    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  } catch (e) {
    console.error("[customer auth]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
