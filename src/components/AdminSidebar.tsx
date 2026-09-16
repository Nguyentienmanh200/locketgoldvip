"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 border-r border-[var(--border)] bg-[var(--bg-elevated)] flex flex-col z-40">
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-[var(--border)]">
        <div className="w-7 h-7 rounded-md bg-[var(--accent)] flex items-center justify-center">
          <span className="text-xs font-bold text-black">LG</span>
        </div>
        <div>
          <div className="text-sm font-semibold leading-tight">Locket Gold</div>
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
              <span className="w-5 text-center text-xs opacity-70">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[var(--border)] space-y-1">
        <Link href="/" className="nav-item text-xs">
          ← Trang chủ
        </Link>
        <button
          onClick={() => (window.location.href = "/login")}
          className="nav-item w-full text-left text-xs text-red-400/80 hover:text-red-400"
        >
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
