export default function OrdersPage() {
  const orders = [
    { id: "LG-8821", user: "@minhnguyen", product: "Locket Gold 1 Tháng", qty: 1, amount: 45000, status: "success", createdAt: "16/09/2026 14:22" },
    { id: "LG-8820", user: "@thuydung", product: "Locket Gold 3 Tháng", qty: 1, amount: 120000, status: "pending", createdAt: "16/09/2026 13:55" },
    { id: "LG-8819", user: "@hoanganh", product: "Locket Gold 1 Tháng", qty: 2, amount: 90000, status: "success", createdAt: "16/09/2026 12:10" },
    { id: "LG-8818", user: "@lananh98", product: "Locket Gold 6 Tháng", qty: 1, amount: 220000, status: "processing", createdAt: "16/09/2026 11:40" },
    { id: "LG-8817", user: "@duongctv", product: "Locket Gold 1 Tháng", qty: 1, amount: 38000, status: "success", createdAt: "16/09/2026 10:15" },
    { id: "LG-8816", user: "@trangctv", product: "Locket Gold 3 Tháng", qty: 1, amount: 105000, status: "failed", createdAt: "16/09/2026 09:30" },
  ];

  const statusColor: Record<string, string> = {
    success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    pending: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    processing: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    failed: "bg-red-500/15 text-red-400 border-red-500/20",
  };
  const statusLabel: Record<string, string> = {
    success: "Thành công",
    pending: "Chờ TT",
    processing: "Đang xử lý",
    failed: "Thất bại",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Đơn hàng</h1>
          <p className="text-sm text-slate-400 mt-1">Quản lý toàn bộ đơn hàng hệ thống</p>
        </div>
        <button className="btn-gold px-5 py-2.5 rounded-xl text-sm font-semibold">
          + Tạo đơn thủ công
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {["Tất cả", "Thành công", "Chờ thanh toán", "Đang xử lý", "Thất bại"].map((f, i) => (
          <button
            key={f}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition ${
              i === 0
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                : "glass text-slate-400 hover:text-slate-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-slate-800/40">
                <th className="px-6 py-3.5 font-medium">Mã đơn</th>
                <th className="px-6 py-3.5 font-medium">User</th>
                <th className="px-6 py-3.5 font-medium">Sản phẩm</th>
                <th className="px-6 py-3.5 font-medium">SL</th>
                <th className="px-6 py-3.5 font-medium">Số tiền</th>
                <th className="px-6 py-3.5 font-medium">Trạng thái</th>
                <th className="px-6 py-3.5 font-medium">Thời gian</th>
                <th className="px-6 py-3.5 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-800/20 transition">
                  <td className="px-6 py-3.5 font-mono text-amber-400/90 text-xs">{o.id}</td>
                  <td className="px-6 py-3.5 text-slate-300">{o.user}</td>
                  <td className="px-6 py-3.5 text-slate-300">{o.product}</td>
                  <td className="px-6 py-3.5 text-slate-400">{o.qty}</td>
                  <td className="px-6 py-3.5 font-medium text-white">
                    {o.amount.toLocaleString("vi-VN")}đ
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border ${statusColor[o.status]}`}>
                      {statusLabel[o.status]}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-500 text-xs">{o.createdAt}</td>
                  <td className="px-6 py-3.5">
                    <button className="text-xs text-amber-400 hover:text-amber-300 font-medium">
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
