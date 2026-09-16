import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <span className="text-lg font-black text-slate-900">LG</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-gold-gradient">
                Locket Gold
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
              <a href="#features" className="hover:text-amber-400 transition">
                Tính năng
              </a>
              <a href="#ctv" className="hover:text-amber-400 transition">
                CTV
              </a>
              <a href="#security" className="hover:text-amber-400 transition">
                Bảo mật
              </a>
            </nav>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register-ctv"
                className="btn-gold px-5 py-2.5 rounded-xl text-sm"
              >
                Đăng ký CTV
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-amber-500/5 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-amber-500/20 text-amber-400 text-xs font-semibold mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse-gold" />
            Hệ thống bảo mật cấp cao · Next.js + TypeScript
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 animate-fade-in-up delay-100">
            <span className="text-white">Locket Gold</span>
            <br />
            <span className="text-gold-gradient">Premium Store</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-400 mb-10 leading-relaxed animate-fade-in-up delay-200">
            Nền tảng bán & kích hoạt Locket Gold tự động qua Zalo Bot.
            Thanh toán ngân hàng real-time · Quản lý CTV · Bảo mật tối đa.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
            <Link
              href="/register-ctv"
              className="btn-gold px-8 py-4 rounded-2xl text-base font-bold w-full sm:w-auto"
            >
              Trở thành CTV ngay
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 rounded-2xl text-base font-semibold glass border border-slate-700 hover:border-amber-500/40 text-slate-200 transition w-full sm:w-auto"
            >
              Đăng nhập Admin
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto animate-fade-in-up delay-400">
            {[
              { label: "Đơn hàng xử lý", value: "10K+" },
              { label: "CTV đang hoạt động", value: "150+" },
              { label: "Uptime", value: "99.9%" },
              { label: "Bảo mật", value: "A+" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass rounded-2xl p-5 card-hover"
              >
                <div className="text-2xl sm:text-3xl font-black text-gold-gradient">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-500 mt-1 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Tính năng{" "}
              <span className="text-gold-gradient">mạnh mẽ</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Xây dựng lại hoàn toàn với kiến trúc hiện đại, bảo mật và trải nghiệm
              người dùng cao cấp.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "⚡",
                title: "Zalo Bot Real-time",
                desc: "Nhận đơn, kiểm tra Gold, gửi QR thanh toán tự động qua Zalo trong vài giây.",
              },
              {
                icon: "💰",
                title: "Thanh toán Sepay",
                desc: "Tích hợp webhook ngân hàng, cộng tiền ví tức thì khi nhận được chuyển khoản.",
              },
              {
                icon: "👥",
                title: "Hệ thống CTV",
                desc: "Đăng ký CTV, giá riêng theo từng sản phẩm, dashboard theo dõi hoa hồng.",
              },
              {
                icon: "🛡️",
                title: "Bảo mật tối cao",
                desc: "Rate limit, CSRF, CSP, Argon2, audit log, zero-trust architecture.",
              },
              {
                icon: "📦",
                title: "Quản lý sản phẩm",
                desc: "Stock realtime, API fulfillment tự động, discount & giftcode linh hoạt.",
              },
              {
                icon: "📊",
                title: "Dashboard Admin",
                desc: "Thống kê doanh thu, đơn hàng, user, CTV – giao diện dark premium hiện đại.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="glass rounded-2xl p-6 card-hover group"
              >
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTV CTA */}
      <section id="ctv" className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-strong rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden glow-gold">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 relative">
              Trở thành{" "}
              <span className="text-gold-gradient">Cộng tác viên</span>
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto relative">
              Đăng ký CTV để nhận giá ưu đãi, quản lý đơn hàng riêng và nhận hoa
              hồng hấp dẫn. Duyệt nhanh bởi Admin.
            </p>
            <Link
              href="/register-ctv"
              className="btn-gold inline-flex px-10 py-4 rounded-2xl text-base font-bold relative"
            >
              Đăng ký CTV miễn phí →
            </Link>
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Bảo mật{" "}
              <span className="text-gold-gradient">tàn bạo</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Được thiết kế theo chuẩn zero-trust, sẵn sàng cho production.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              "Rate Limiting (Upstash)",
              "Argon2id Password Hash",
              "Strict CSP + HSTS",
              "CSRF Protection",
              "Audit Log đầy đủ",
              "Role-based Access",
              "Input Validation (Zod)",
              "Secure Headers",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 glass rounded-xl px-4 py-3.5"
              >
                <span className="text-amber-400 text-lg">✓</span>
                <span className="text-sm font-medium text-slate-200">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-10 px-4 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <span className="text-xs font-black text-slate-900">LG</span>
            </div>
            <span className="text-sm font-semibold text-slate-400">
              Locket Gold Secure
            </span>
          </div>
          <p className="text-xs text-slate-600">
            © 2026 · Rebuilt with Next.js · Security First
          </p>
        </div>
      </footer>
    </div>
  );
}
