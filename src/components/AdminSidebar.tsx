"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const items = [
  { href: "/admin", label: "Tổng quan", icon: "◈" },
  { href: "/admin/orders", label: "Đơn hàng", icon: "☰" },
  { href: "/admin/products", label: "Sản phẩm", icon: "◇" },
  { href: "/admin/users", label: "Người dùng", icon: "◎" },
  { href: "/admin/ctv", label: "CTV", icon: "◉" },
  { href: "/admin/discounts", label: "Mã giảm giá", icon: "▣" },
  { href: "/admin/settings", label: "Cài đặt", icon: "⚙" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Đóng menu khi đổi trang (mobile)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Khóa scroll body khi mở menu mobile
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const NavContent = () => (
    <>
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-[var(--border)] shrink-0">
        <div className="w-7 h-7 rounded-md bg-[var(--accent)] flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-black">LG</span>
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold leading-tight truncate">Locket Gold</div>
          <div className="text-[10px] text-[var(--text-muted)]">Admin</div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {items.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${active ? "active" : ""}`}
            >
              <span className="w-5 text-center text-xs opacity-70 shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[var(--border)] space-y-1 shrink-0">
        <Link href="/" className="nav-item text-xs">
          ← Trang chủ
        </Link>
        <button
          type="button"
          onClick={() => {
            window.location.href = "/login";
          }}
          className="nav-item w-full text-left text-xs text-red-400/80 hover:text-red-400"
        >
          Đăng xuất
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 border-b border-[var(--border)] bg-[var(--bg)] flex items-center justify-between px-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-9 h-9 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)]"
          aria-label="Mở menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[var(--accent)] flex items-center justify-center">
            <span className="text-[10px] font-bold text-black">LG</span>
          </div>
          <span className="text-sm font-semibold">Admin</span>
        </div>
        <div className="w-9 h-9 rounded-full bg-[var(--accent)] flex items-center justify-center text-xs font-bold text-black">
          A
        </div>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 bottom-0 z-50 w-64 max-w-[85vw] bg-[var(--bg-elevated)] border-r border-[var(--border)] flex flex-col transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <NavContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-56 border-r border-[var(--border)] bg-[var(--bg-elevated)] flex-col z-40">
        <NavContent />
      </aside>
    </>
  );
}
