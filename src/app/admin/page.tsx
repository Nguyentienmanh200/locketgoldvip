export default function AdminDashboard() {
  const stats = [
    {
      label: "Doanh thu hôm nay",
      value: "12.450.000đ",
      change: "+18%",
      positive: true,
      icon: "💰",
    },
    {
      label: "Đơn hàng mới",
      value: "47",
      change: "+12%",
      positive: true,
      icon: "🛒",
    },
    {
      label: "User mới",
      value: "23",
      change: "+5%",
      positive: true,
      icon: "👤",
    },
    {
      label: "CTV chờ duyệt",
      value: "8",
      change: "Cần xử lý",
      positive: false,
      icon: "🤝",
    },
  ];

  const recentOrders = [
    { id: "LG-8821", user: "@minhnguyen", product: "Locket Gold 1 Tháng", amount: "45.000đ", status: "success" },
    { id: "LG-8820", user: "@thuydung", product: "Locket Gold 3 Tháng", amount: "120.000đ", status: "pending" },
    { id: "LG-8819", user: "@hoanganh", product: "Locket Gold 1 Tháng", amount: "45.000đ", status: "success" },
    { id: "LG-8818", user: "@lananh98", product: "Locket Gold 6 Tháng", amount: "220.000đ", status: "processing" },
    { id: "LG-8817", user: "@duongctv", product: "Locket Gold 1 Tháng", amount: "38.000đ", status: "success" },
  ];

  const statusColor: Record<string, string> = {
    success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    pending: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    processing: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    failed: "bg-red-500/15 text-red-400 border-red-500/20",
  };

  const statusLabel: Record<string, string> = {
    success: "Thành công",
    pending: "Chờ thanh toán",
    processing: "Đang xử lý",
    failed: "Thất bại",
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-white">Tổng quan</h1>
        <p className="text-sm text-slate-400 mt-1">
          Thống kê hoạt động hệ thống Locket Gold
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="glass rounded-2xl p-5 card-hover"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {s.label}
                </p>
                <p className="text-2xl font-bold text-white mt-2">{s.value}</p>
              </div>
              <span className="text-2xl">{s.icon}</span>
            </div>
            <p
              className={`text-xs mt-3 font-medium ${
                s.positive ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {s.change}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">
            Đơn hàng gần đây
          </h2>
          <a
            href="/admin/orders"
            className="text-xs text-amber-400 hover:text-amber-300 font-medium"
          >
            Xem tất cả →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-slate-800/40">
                <th className="px-6 py-3 font-medium">Mã đơn</th>
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Sản phẩm</th>
                <th className="px-6 py-3 font-medium">Số tiền</th>
                <th className="px-6 py-3 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {recentOrders.map((o) => (
                <tr
                  key={o.id}
                  className="hover:bg-slate-800/20 transition"
                >
                  <td className="px-6 py-3.5 font-mono text-amber-400/90 text-xs">
                    {o.id}
                  </td>
                  <td className="px-6 py-3.5 text-slate-300">{o.user}</td>
                  <td className="px-6 py-3.5 text-slate-300">{o.product}</td>
                  <td className="px-6 py-3.5 font-medium text-white">
                    {o.amount}
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border ${
                        statusColor[o.status]
                      }`}
                    >
                      {statusLabel[o.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-5">
        {[
          { href: "/admin/products", label: "Thêm sản phẩm", icon: "📦", desc: "Tạo sản phẩm mới" },
          { href: "/admin/ctv", label: "Duyệt CTV", icon: "🤝", desc: "8 yêu cầu đang chờ" },
          { href: "/admin/settings", label: "Cài đặt hệ thống", icon: "⚙️", desc: "API, Bank, Zalo..." },
        ].map((a) => (
          <a
            key={a.href}
            href={a.href}
            className="glass rounded-2xl p-5 card-hover flex items-start gap-4"
          >
            <span className="text-2xl">{a.icon}</span>
            <div>
              <div className="font-semibold text-white text-sm">{a.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{a.desc}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
