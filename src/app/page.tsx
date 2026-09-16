import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
              <span className="text-sm font-bold text-black">LG</span>
            </div>
            <span className="font-semibold text-[15px]">Locket Gold VIP</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn btn-ghost text-sm">
              Đăng nhập
            </Link>
            <Link href="/register-ctv" className="btn btn-primary text-sm">
              Đăng ký CTV
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] text-xs text-[var(--text-secondary)] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
          Hệ thống đang hoạt động
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight max-w-2xl leading-tight">
          Bán Locket Gold
          <br />
          <span className="text-[var(--accent)]">tự động qua Zalo</span>
        </h1>
        <p className="mt-5 text-[var(--text-secondary)] max-w-lg text-[15px] leading-relaxed">
          Quản lý đơn hàng, CTV, thanh toán ngân hàng và kích hoạt Gold tự động.
          Website + Zalo Bot đồng bộ real-time.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/register-ctv" className="btn btn-primary px-6">
            Đăng ký làm CTV
          </Link>
          <Link href="/login" className="btn btn-secondary px-6">
            Vào Admin
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-[var(--border)] py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-xl font-semibold mb-10">Tính năng chính</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Zalo Bot", desc: "Nhận lệnh mua, list sản phẩm, check Gold, gửi QR thanh toán tự động." },
              { title: "Thanh toán", desc: "Tích hợp Sepay / chuyển khoản. Cộng tiền ví ngay khi nhận được." },
              { title: "Hệ thống CTV", desc: "Đăng ký, duyệt, giá riêng theo CTV, theo dõi hoa hồng." },
              { title: "Admin Dashboard", desc: "Quản lý đơn, user, sản phẩm, mã giảm giá, cài đặt API." },
              { title: "Kích hoạt API", desc: "Gọi API Locket Gold tự động sau khi thanh toán thành công." },
              { title: "Bảo mật", desc: "Rate limit, validation, role-based access, audit log." },
            ].map((f) => (
              <div key={f.title} className="card p-5">
                <h3 className="font-medium text-[15px] mb-1.5">{f.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-6 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>Locket Gold VIP</span>
          <span>© 2026</span>
        </div>
      </footer>
    </div>
  );
}
