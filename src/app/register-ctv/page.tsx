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

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    if (form.password.length < 8) {
      setError("Mật khẩu tối thiểu 8 ký tự");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mx-auto mb-4 text-emerald-400 text-xl">
            ✓
          </div>
          <h2 className="text-lg font-semibold mb-2">Đã gửi yêu cầu</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
            Admin sẽ duyệt trong thời gian sớm nhất. Bạn sẽ được thông báo qua Zalo khi được phê duyệt.
          </p>
          <Link href="/" className="btn btn-primary">
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[var(--accent)] flex items-center justify-center">
              <span className="text-sm font-bold text-black">LG</span>
            </div>
          </Link>
          <h1 className="mt-4 text-xl font-semibold">Đăng ký CTV</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Trở thành cộng tác viên Locket Gold VIP
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <div className="px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Tên đăng nhập *</label>
              <input name="username" value={form.username} onChange={onChange} required minLength={3} className="input" placeholder="username" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Tên hiển thị *</label>
              <input name="displayName" value={form.displayName} onChange={onChange} required className="input" placeholder="Nguyễn Văn A" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Mật khẩu *</label>
              <input type="password" name="password" value={form.password} onChange={onChange} required minLength={8} className="input" placeholder="Tối thiểu 8 ký tự" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Xác nhận MK *</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={onChange} required className="input" placeholder="Nhập lại" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Zalo ID / Link *</label>
              <input name="zaloId" value={form.zaloId} onChange={onChange} required className="input" placeholder="zalo.me/xxx" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Số điện thoại</label>
              <input name="phone" value={form.phone} onChange={onChange} className="input" placeholder="09xx xxx xxx" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Lý do muốn làm CTV</label>
            <textarea name="reason" value={form.reason} onChange={onChange} rows={3} className="input resize-none" placeholder="Kinh nghiệm, nguồn khách..." />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? "Đang gửi..." : "Gửi yêu cầu đăng ký"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          Đã có tài khoản?{" "}
          <Link href="/login" className="text-[var(--accent)] hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
