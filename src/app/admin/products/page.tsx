export default function ProductsPage() {
  const products = [
    { id: "locket-1m", name: "Locket Gold 1 Tháng", price: 45000, stock: 120, apiEnabled: true },
    { id: "locket-3m", name: "Locket Gold 3 Tháng", price: 120000, stock: 85, apiEnabled: true },
    { id: "locket-6m", name: "Locket Gold 6 Tháng", price: 220000, stock: 40, apiEnabled: true },
    { id: "locket-1y", name: "Locket Gold 1 Năm", price: 380000, stock: 15, apiEnabled: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sản phẩm</h1>
          <p className="text-sm text-slate-400 mt-1">Quản lý sản phẩm Locket Gold</p>
        </div>
        <button className="btn-gold px-5 py-2.5 rounded-xl text-sm font-semibold">
          + Thêm sản phẩm
        </button>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {products.map((p) => (
          <div key={p.id} className="glass rounded-2xl p-6 card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 border border-amber-500/20 flex items-center justify-center text-xl">
                💎
              </div>
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                  p.apiEnabled
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                    : "bg-slate-500/15 text-slate-400 border-slate-500/20"
                }`}
              >
                {p.apiEnabled ? "API ON" : "API OFF"}
              </span>
            </div>
            <h3 className="font-semibold text-white mb-1">{p.name}</h3>
            <p className="text-xs text-slate-500 font-mono mb-4">{p.id}</p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xl font-bold text-gold-gradient">
                  {p.price.toLocaleString("vi-VN")}đ
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Tồn kho: {p.stock}</p>
              </div>
              <button className="text-xs text-amber-400 hover:text-amber-300 font-medium">
                Chỉnh sửa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
