import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 min-w-0 shrink">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-black">LG</span>
            </div>
            <span className="font-semibold text-[15px] truncate hidden xs:inline sm:inline">
              Locket Gold VIP
            </span>
          </Link>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/customer" className="btn btn-ghost text-sm px-3 py-2 hidden sm:inline-flex">
              Khách hàng
            </Link>
            <Link href="/login" className="btn btn-ghost text-sm px-3 py-2">
              Admin
            </Link>
            <Link href="/register-ctv" className="btn btn-primary text-sm px-3 sm:px-4 py-2">
              Đăng ký CTV
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] text-xs text-[var(--text-secondary)] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] shrink-0" />
          Hệ thống đang hoạt động
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight max-w-2xl leading-tight px-2">
          Bán Locket Gold
          <br />
          <span className="text-[var(--accent)]">tự động qua Zalo</span>
        </h1>
        <p className="mt-5 text-[var(--text-secondary)] max-w-lg text-sm sm:text-[15px] leading-relaxed px-2">
          Quản lý đơn hàng, CTV, thanh toán ngân hàng và kích hoạt Gold tự động.
          Website + Zalo Bot đồng bộ real-time.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full max-w-xs sm:max-w-none px-2">
          <Link href="/register-ctv" className="btn btn-primary px-6 py-3">
            Đăng ký làm CTV
          </Link>
          <Link href="/login" className="btn btn-secondary px-6 py-3">
            Vào Admin
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-[var(--border)] py-12 sm:py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-lg sm:text-xl font-semibold mb-8 sm:mb-10">Tính năng chính</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[
              { title: "Zalo Bot", desc: "Nhận lệnh mua, list sản phẩm, check Gold, gửi QR thanh toán tự động." },
              { title: "Thanh toán", desc: "Tích hợp Sepay / chuyển khoản. Cộng tiền ví ngay khi nhận được." },
              { title: "Hệ thống CTV", desc: "Đăng ký, duyệt, giá riêng theo CTV, theo dõi hoa hồng." },
              { title: "Admin Dashboard", desc: "Quản lý đơn, user, sản phẩm, mã giảm giá, cài đặt API." },
              { title: "Kích hoạt API", desc: "Gọi API Locket Gold tự động sau khi thanh toán thành công." },
              { title: "Bảo mật", desc: "Rate limit, validation, role-based access, audit log." },
            ].map((f) => (
              <div key={f.title} className="card p-4 sm:p-5">
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
