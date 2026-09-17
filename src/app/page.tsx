import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0c0c0e] text-white">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0c0c0e]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-black">
              LG
            </div>
            <span className="text-sm font-semibold tracking-tight sm:text-base">
              Locket Gold VIP
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/app?mode=login"
              className="rounded-full px-3.5 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
            >
              Đăng nhập
            </Link>
            <Link
              href="/app?mode=register"
              className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 text-sm font-semibold text-black shadow-lg shadow-amber-500/20 transition hover:opacity-90"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-5xl px-4 pb-20 pt-14 sm:px-6 sm:pt-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Kích hoạt Locket Gold nhanh
          </div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl sm:leading-[1.15]">
            Mua Locket Gold
            <br />
            <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
              đơn giản &amp; nhanh chóng
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-zinc-400 sm:text-base">
            Chọn gói, nhập username, thanh toán bằng số dư. Hỗ trợ giá CTV và nạp tiền tự động qua chuyển khoản.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 text-sm font-semibold text-black shadow-xl shadow-amber-500/25 transition hover:opacity-90"
            >
              Vào cửa hàng
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/app?mode=register"
              className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
            >
              Tạo tài khoản
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {[
            {
              t: "Mua nhanh",
              d: "Chọn gói Gold, nhập username Locket và hoàn tất trong vài bước.",
              i: "⚡",
            },
            {
              t: "Nạp tự động",
              d: "Chuyển khoản đúng nội dung — hệ thống cộng tiền vào ví của bạn.",
              i: "💳",
            },
            {
              t: "Hỗ trợ CTV",
              d: "Tài khoản CTV / đại lý được áp giá riêng khi mua hàng.",
              i: "🤝",
            },
          ].map((f) => (
            <div
              key={f.t}
              className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition hover:border-amber-500/20 hover:bg-white/[0.05]"
            >
              <div className="mb-3 text-2xl">{f.i}</div>
              <h3 className="text-sm font-semibold text-white">{f.t}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">{f.d}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-white/5 py-6 text-center text-xs text-zinc-600">
        Locket Gold VIP
      </footer>
    </div>
  );
}
