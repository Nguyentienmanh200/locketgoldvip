export default function AdminDashboard() {
  const stats = [
    { label: "Doanh thu hôm nay", value: "12.450.000đ", sub: "+18% so với hôm qua" },
    { label: "Đơn hàng mới", value: "47", sub: "12 đang chờ" },
    { label: "User mới", value: "23", sub: "Hôm nay" },
    { label: "CTV chờ duyệt", value: "8", sub: "Cần xử lý" },
  ];

  const orders = [
    { id: "LG-8821", user: "@minhnguyen", product: "Gold 1 Tháng", amount: "45.000đ", status: "success" },
    { id: "LG-8820", user: "@thuydung", product: "Gold 3 Tháng", amount: "120.000đ", status: "pending" },
    { id: "LG-8819", user: "@hoanganh", product: "Gold 1 Tháng", amount: "45.000đ", status: "success" },
    { id: "LG-8818", user: "@lananh98", product: "Gold 6 Tháng", amount: "220.000đ", status: "processing" },
    { id: "LG-8817", user: "@duongctv", product: "Gold 1 Tháng", amount: "38.000đ", status: "success" },
  ];

  const statusMap: Record<string, string> = {
    success: "badge-success",
    pending: "badge-warning",
    processing: "badge-info",
    failed: "badge-danger",
  };
  const statusLabel: Record<string, string> = {
    success: "Thành công",
    pending: "Chờ TT",
    processing: "Đang xử lý",
    failed: "Thất bại",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Tổng quan</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">Thống kê hoạt động hệ thống</p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
            <p className="text-2xl font-semibold mt-1.5 tracking-tight">{s.value}</p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="text-sm font-medium">Đơn hàng gần đây</h2>
          <a href="/admin/orders" className="text-xs text-[var(--accent)] hover:underline">
            Xem tất cả
          </a>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>User</th>
                <th>Sản phẩm</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="font-mono text-xs text-[var(--accent)]">{o.id}</td>
                  <td>{o.user}</td>
                  <td>{o.product}</td>
                  <td className="text-[var(--text)] font-medium">{o.amount}</td>
                  <td>
                    <span className={`badge ${statusMap[o.status]}`}>
                      {statusLabel[o.status]}
                    </span>
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
