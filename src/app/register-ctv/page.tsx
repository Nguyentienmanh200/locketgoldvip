"use client";

import Link from "next/link";
import { useState } from "react";

export default function RegisterCtvPage() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    zaloId: "",
    displayName: "",
    phone: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    if (form.password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    setLoading(true);
    // TODO: call real API /api/ctv/register
    await new Promise((r) => setTimeout(r, 1200));
    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-strong rounded-3xl p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Đăng ký thành công!
          </h2>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Yêu cầu CTV của bạn đã được gửi. Admin sẽ duyệt trong thời gian sớm
            nhất. Bạn sẽ nhận thông báo qua Zalo khi được phê duyệt.
          </p>
          <Link
            href="/"
            className="btn-gold inline-flex px-8 py-3 rounded-xl text-sm font-bold"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <span className="text-lg font-black text-slate-900">LG</span>
            </div>
          </Link>
          <h1 className="mt-5 text-3xl font-bold text-white">
            Đăng ký{" "}
            <span className="text-gold-gradient">Cộng tác viên</span>
          </h1>
          <p className="mt-2 text-slate-400 text-sm">
            Điền thông tin để trở thành CTV của Locket Gold
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-strong rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium">
                {error}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Tên đăng nhập *
                </label>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  minLength={3}
                  placeholder="username"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-600 text-sm input-gold transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Tên hiển thị *
                </label>
                <input
                  name="displayName"
                  value={form.displayName}
                  onChange={handleChange}
                  required
                  placeholder="Nguyễn Văn A"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-600 text-sm input-gold transition"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Mật khẩu *
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  placeholder="Tối thiểu 8 ký tự"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-600 text-sm input-gold transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Xác nhận mật khẩu *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Nhập lại mật khẩu"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-600 text-sm input-gold transition"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Zalo ID / Link *
                </label>
                <input
                  name="zaloId"
                  value={form.zaloId}
                  onChange={handleChange}
                  required
                  placeholder="zalo.me/xxx hoặc ID"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-600 text-sm input-gold transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Số điện thoại
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="09xx xxx xxx"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-600 text-sm input-gold transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                Lý do muốn trở thành CTV
              </label>
              <textarea
                name="reason"
                value={form.reason}
                onChange={handleChange}
                rows={3}
                placeholder="Giới thiệu ngắn về bản thân / kinh nghiệm..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-600 text-sm input-gold transition resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3.5 rounded-xl text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Đang gửi yêu cầu..." : "Gửi yêu cầu đăng ký CTV"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="text-amber-400 hover:text-amber-300 font-medium"
            >
              Đăng nhập
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          <Link href="/" className="hover:text-slate-400 transition">
            ← Quay lại trang chủ
          </Link>
        </p>
      </div>
    </div>
  );
}
