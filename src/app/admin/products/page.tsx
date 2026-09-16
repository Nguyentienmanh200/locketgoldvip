export default function ProductsPage() {
  const products = [
    { id: "locket-1m", name: "Locket Gold 1 Tháng", price: 45000, stock: 120, api: true },
    { id: "locket-3m", name: "Locket Gold 3 Tháng", price: 120000, stock: 85, api: true },
    { id: "locket-6m", name: "Locket Gold 6 Tháng", price: 220000, stock: 40, api: true },
    { id: "locket-1y", name: "Locket Gold 1 Năm", price: 380000, stock: 15, api: false },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Sản phẩm</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Quản lý sản phẩm Locket Gold</p>
        </div>
        <button className="btn btn-primary text-sm">+ Thêm sản phẩm</button>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p.id} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-medium">{p.name}</h3>
                <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">{p.id}</p>
              </div>
              <span className={`badge ${p.api ? "badge-success" : "badge-neutral"}`}>
                {p.api ? "API ON" : "API OFF"}
              </span>
            </div>
            <div className="flex items-end justify-between mt-4">
              <div>
                <p className="text-lg font-semibold text-[var(--accent)]">
                  {p.price.toLocaleString("vi-VN")}đ
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Tồn: {p.stock}</p>
              </div>
              <button className="btn btn-secondary text-xs py-1.5 px-3">Sửa</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
