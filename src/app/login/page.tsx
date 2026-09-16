"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    if (username === "admin" && password === "admin123") {
      window.location.href = "/admin";
    } else {
      setError("Sai tài khoản hoặc mật khẩu");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[var(--accent)] flex items-center justify-center">
              <span className="text-sm font-bold text-black">LG</span>
            </div>
          </Link>
          <h1 className="mt-4 text-xl font-semibold">Đăng nhập</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Truy cập hệ thống quản trị
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <div className="px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
              Tài khoản
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="input"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="input"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          Muốn làm CTV?{" "}
          <Link href="/register-ctv" className="text-[var(--accent)] hover:underline">
            Đăng ký
          </Link>
        </p>
        <p className="mt-3 text-center">
          <Link href="/" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
            ← Về trang chủ
          </Link>
        </p>
      </div>
    </div>
  );
}
