"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Tổng quan", icon: "📊" },
  { href: "/admin/orders", label: "Đơn hàng", icon: "🛒" },
  { href: "/admin/products", label: "Sản phẩm", icon: "📦" },
  { href: "/admin/users", label: "Người dùng", icon: "👥" },
  { href: "/admin/ctv", label: "CTV & Duyệt", icon: "🤝" },
  { href: "/admin/discounts", label: "Mã giảm giá", icon: "🏷️" },
  { href: "/admin/settings", label: "Cài đặt", icon: "⚙️" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 glass-strong border-r border-slate-800/60 z-40 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800/60">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20">
          <span className="text-sm font-black text-slate-900">LG</span>
        </div>
        <div>
          <div className="text-sm font-bold text-white">Locket Gold</div>
          <div className="text-[10px] text-amber-500/80 font-medium tracking-wider uppercase">
            Admin Panel
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "nav-active text-amber-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800/60">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 transition"
        >
          ← Về trang chủ
        </Link>
        <button
          onClick={() => {
            // TODO: real logout
            window.location.href = "/login";
          }}
          className="w-full mt-2 flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition"
        >
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
