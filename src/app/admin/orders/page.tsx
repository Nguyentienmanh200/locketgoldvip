export default function OrdersPage() {
  const orders = [
    { id: "LG-8821", user: "@minhnguyen", product: "Gold 1 Tháng", qty: 1, amount: 45000, status: "success", time: "16/09 14:22" },
    { id: "LG-8820", user: "@thuydung", product: "Gold 3 Tháng", qty: 1, amount: 120000, status: "pending", time: "16/09 13:55" },
    { id: "LG-8819", user: "@hoanganh", product: "Gold 1 Tháng", qty: 2, amount: 90000, status: "success", time: "16/09 12:10" },
    { id: "LG-8818", user: "@lananh98", product: "Gold 6 Tháng", qty: 1, amount: 220000, status: "processing", time: "16/09 11:40" },
    { id: "LG-8817", user: "@duongctv", product: "Gold 1 Tháng", qty: 1, amount: 38000, status: "success", time: "16/09 10:15" },
    { id: "LG-8816", user: "@trangctv", product: "Gold 3 Tháng", qty: 1, amount: 105000, status: "failed", time: "16/09 09:30" },
  ];
  const map: Record<string, string> = {
    success: "badge-success", pending: "badge-warning", processing: "badge-info", failed: "badge-danger",
  };
  const label: Record<string, string> = {
    success: "Thành công", pending: "Chờ TT", processing: "Đang xử lý", failed: "Thất bại",
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold">Đơn hàng</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Quản lý toàn bộ đơn hàng</p>
        </div>
        <button className="btn btn-primary text-sm w-full sm:w-auto">+ Tạo đơn thủ công</button>
      </div>

      <div className="flex flex-wrap gap-2">
        {["Tất cả", "Thành công", "Chờ TT", "Đang xử lý", "Thất bại"].map((f, i) => (
          <button key={f} className={`btn text-xs ${i === 0 ? "btn-primary" : "btn-secondary"}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="table-wrap">
          <table className="data min-w-[640px]">
            <thead>
              <tr>
                <th>Mã đơn</th><th>User</th><th>Sản phẩm</th><th>SL</th><th>Số tiền</th><th>Trạng thái</th><th>Thời gian</th><th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="font-mono text-xs text-[var(--accent)] whitespace-nowrap">{o.id}</td>
                  <td className="whitespace-nowrap">{o.user}</td>
                  <td className="whitespace-nowrap">{o.product}</td>
                  <td>{o.qty}</td>
                  <td className="text-[var(--text)] font-medium whitespace-nowrap">{o.amount.toLocaleString("vi-VN")}đ</td>
                  <td><span className={`badge ${map[o.status]}`}>{label[o.status]}</span></td>
                  <td className="text-xs whitespace-nowrap">{o.time}</td>
                  <td><button className="text-xs text-[var(--accent)] hover:underline">Chi tiết</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
