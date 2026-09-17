"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

type UserInfo = {
  id: number;
  username: string;
  displayName: string;
  walletBalance: number;
  role: string;
  telegramId?: string;
};

declare global {
  interface Window {
    onTelegramAuth?: (user: Record<string, string>) => void;
  }
}

export default function CustomerPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [botUsername, setBotUsername] = useState("");

  const handleTelegram = useCallback(async (tgUser: Record<string, string>) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tgUser),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Đăng nhập thất bại");
        setLoading(false);
        return;
      }
      setUser(data.user);
    } catch {
      setError("Lỗi kết nối");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    window.onTelegramAuth = (u) => {
      handleTelegram(u);
    };
    // Load bot username from public config if needed
    fetch("/api/auth/telegram")
      .then((r) => r.json())
      .then((d) => {
        if (d.botUsername) setBotUsername(d.botUsername);
      })
      .catch(() => {});
  }, [handleTelegram]);

  useEffect(() => {
    if (!botUsername) return;
    // Inject Telegram Login Widget
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "8");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    const el = document.getElementById("tg-login-btn");
    if (el && !el.hasChildNodes()) {
      el.appendChild(script);
    }
  }, [botUsername]);

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[var(--accent)] flex items-center justify-center">
              <span className="text-sm font-bold text-black">LG</span>
            </div>
          </Link>
          <h1 className="mt-4 text-xl font-semibold">Khách hàng</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Đăng nhập bằng Telegram để xem số dư & đơn hàng
          </p>
        </div>

        <div className="card p-6 space-y-4">
          {error && (
            <div className="px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {!user ? (
            <>
              <p className="text-sm text-[var(--text-secondary)] text-center">
                Bấm nút bên dưới để đăng nhập bằng tài khoản Telegram của bạn.
              </p>
              {botUsername ? (
                <div id="tg-login-btn" className="flex justify-center min-h-[48px]" />
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-[var(--text-muted)] text-center">
                    Chưa cấu hình TELEGRAM_BOT_USERNAME. Có thể nhập Telegram ID thủ công để test:
                  </p>
                  <ManualTelegramLogin
                    onLogin={async (id, name) => {
                      setLoading(true);
                      const res = await fetch("/api/auth/telegram", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          id,
                          first_name: name,
                          auth_date: String(Math.floor(Date.now() / 1000)),
                          hash: "dev_bypass",
                        }),
                      });
                      // Dev bypass only works if no bot token
                      const data = await res.json();
                      if (data.user) setUser(data.user);
                      else setError(data.error || "Cần cấu hình Telegram Bot Token + Username");
                      setLoading(false);
                    }}
                  />
                </div>
              )}
              {loading && (
                <p className="text-center text-sm text-[var(--text-muted)]">Đang xác thực...</p>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-[var(--accent)] mx-auto flex items-center justify-center text-lg font-bold text-black">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <h2 className="mt-3 font-semibold">{user.displayName}</h2>
                <p className="text-sm text-[var(--text-muted)]">@{user.username}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="card p-3 text-center">
                  <p className="text-xs text-[var(--text-muted)]">Số dư</p>
                  <p className="text-lg font-semibold text-[var(--accent)] mt-1">
                    {user.walletBalance.toLocaleString("vi-VN")}đ
                  </p>
                </div>
                <div className="card p-3 text-center">
                  <p className="text-xs text-[var(--text-muted)]">Vai trò</p>
                  <p className="text-lg font-semibold mt-1 capitalize">{user.role}</p>
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)] text-center">
                Mua hàng qua Zalo Bot hoặc liên hệ Admin.
                {user.telegramId && (
                  <>
                    <br />
                    Telegram ID: {user.telegramId}
                  </>
                )}
              </p>
              <button
                type="button"
                className="btn btn-secondary w-full"
                onClick={() => {
                  setUser(null);
                  document.cookie = "lg_session=; Max-Age=0; path=/";
                }}
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>

        <p className="mt-6 text-center">
          <Link href="/" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
            ← Về trang chủ
          </Link>
        </p>
      </div>
    </div>
  );
}

function ManualTelegramLogin({
  onLogin,
}: {
  onLogin: (id: string, name: string) => void;
}) {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  return (
    <div className="space-y-3">
      <input
        className="input"
        placeholder="Telegram ID (số)"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />
      <input
        className="input"
        placeholder="Tên hiển thị"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button
        type="button"
        className="btn btn-primary w-full"
        disabled={!id}
        onClick={() => onLogin(id, name || "TG User")}
      >
        Đăng nhập bằng Telegram ID
      </button>
    </div>
  );
}
