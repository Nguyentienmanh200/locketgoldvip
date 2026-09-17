"use client";

import { useCallback, useEffect, useState } from "react";

type User = {
  id: number;
  username: string;
  displayName: string;
  telegramId?: string;
  walletBalance: number;
  role: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
};

type Order = {
  orderId: string;
  productName: string;
  qty: number;
  totalAmount: number;
  status: string;
  customerInput: string;
  createdAt: string;
};

const money = (n: number) => n.toLocaleString("vi-VN") + "đ";

export default function CustomerApp() {
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<"shop" | "orders" | "recharge" | "password" | "support">("shop");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [loginId, setLoginId] = useState("");
  const [loginPw, setLoginPw] = useState("123456");
  const [loginErr, setLoginErr] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Buy modal
  const [buyProduct, setBuyProduct] = useState<Product | null>(null);
  const [buyQty, setBuyQty] = useState(1);
  const [buyLocket, setBuyLocket] = useState("");
  const [buyDiscount, setBuyDiscount] = useState("");
  const [buying, setBuying] = useState(false);

  // Recharge
  const [rechargeAmt, setRechargeAmt] = useState(50000);
  const [qrUrl, setQrUrl] = useState("");
  const [bankInfo, setBankInfo] = useState<{ bank_name: string; account: string; owner: string; content?: string } | null>(null);

  // Password
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  // Check gold
  const [checkUser, setCheckUser] = useState("");
  const [checkResult, setCheckResult] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const loadMe = useCallback(async () => {
    try {
      const res = await fetch("/api/customer/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "me" }),
      });
      const data = await res.json();
      if (data.user) setUser(data.user);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  const loadProducts = useCallback(async () => {
    const res = await fetch("/api/customer?action=products");
    const data = await res.json();
    setProducts(data.products || []);
  }, []);

  const loadOrders = useCallback(async () => {
    const res = await fetch("/api/customer?action=orders");
    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders || []);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  useEffect(() => {
    if (user) {
      loadProducts();
      if (tab === "orders") loadOrders();
      if (tab === "recharge") {
        fetch("/api/customer?action=bank")
          .then((r) => r.json())
          .then((d) => setBankInfo(d.bank));
      }
    }
  }, [user, tab, loadProducts, loadOrders]);

  const handleLogin = async () => {
    setLoginErr("");
    setLoginLoading(true);
    try {
      const res = await fetch("/api/customer/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          telegramId: loginId.trim(),
          password: loginPw,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginErr(data.error || "Đăng nhập thất bại");
      } else {
        setUser(data.user);
        showToast("Đăng nhập thành công!");
      }
    } catch {
      setLoginErr("Lỗi kết nối");
    }
    setLoginLoading(false);
  };

  const handleBuy = async () => {
    if (!buyProduct || !buyLocket.trim()) {
      showToast("Nhập username Locket");
      return;
    }
    setBuying(true);
    try {
      const res = await fetch("/api/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "buy",
          productId: buyProduct.id,
          customerInput: buyLocket.trim(),
          qty: buyQty,
          discountCode: buyDiscount || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.ok === false) {
        showToast(data.error || "Mua thất bại");
      } else {
        showToast("Đặt hàng thành công: " + data.orderId);
        setUser((u) => (u ? { ...u, walletBalance: data.balance } : u));
        setBuyProduct(null);
        setBuyLocket("");
        setBuyDiscount("");
        setBuyQty(1);
      }
    } catch {
      showToast("Lỗi kết nối");
    }
    setBuying(false);
  };

  const genQr = async () => {
    const res = await fetch(`/api/customer?action=qr&amount=${rechargeAmt}`);
    const data = await res.json();
    if (data.qr) {
      setQrUrl(data.qr);
      setBankInfo({ ...data.bank, content: data.content });
    }
  };

  const changePassword = async () => {
    if (newPw !== confirmPw) {
      showToast("Mật khẩu xác nhận không khớp");
      return;
    }
    const res = await fetch("/api/customer/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "change_password",
        telegramId: user?.telegramId,
        currentPassword: curPw,
        newPassword: newPw,
      }),
    });
    const data = await res.json();
    if (!res.ok) showToast(data.error || "Lỗi");
    else {
      showToast("Đổi mật khẩu thành công");
      setCurPw("");
      setNewPw("");
      setConfirmPw("");
    }
  };

  const doCheckGold = async () => {
    if (!checkUser.trim()) return;
    setCheckResult("Đang kiểm tra...");
    const res = await fetch(
      `/api/customer?action=check_gold&user=${encodeURIComponent(checkUser.trim())}`
    );
    const data = await res.json();
    if (data.success) {
      setCheckResult(
        `${data.username} · ${data.displayName || ""}\nGold: ${data.isGold ? "✅ Có" : "❌ Không"}`
      );
    } else {
      setCheckResult(data.error || "Không kiểm tra được");
    }
  };

  const logout = async () => {
    await fetch("/api/customer/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b]">
        <div className="text-sm text-zinc-500">Đang tải...</div>
      </div>
    );
  }

  // LOGIN SCREEN
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] px-4">
        <div className="w-full max-w-sm rounded-2xl border border-amber-500/30 bg-[#141416] p-6 shadow-xl">
          <div className="text-center mb-5">
            <div className="text-lg font-semibold text-amber-400">🔐 Xác thực bảo mật</div>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Nhập Telegram ID và mật khẩu để tiếp tục.
              <br />
              (Mật khẩu mặc định: <b>123456</b>)
            </p>
          </div>
          {loginErr && (
            <div className="mb-3 text-center text-sm text-red-400 bg-red-500/10 rounded-lg py-2">
              {loginErr}
            </div>
          )}
          <label className="block text-xs text-zinc-400 mb-1">Telegram ID</label>
          <input
            className="w-full mb-3 px-3 py-2.5 rounded-xl bg-[#0a0a0b] border border-zinc-700 text-white text-sm focus:border-amber-500 outline-none"
            placeholder="Nhập ID của bạn..."
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
          />
          <label className="block text-xs text-zinc-400 mb-1">Mật khẩu</label>
          <input
            type="password"
            className="w-full mb-4 px-3 py-2.5 rounded-xl bg-[#0a0a0b] border border-zinc-700 text-white text-sm focus:border-amber-500 outline-none"
            placeholder="Nhập mật khẩu..."
            value={loginPw}
            onChange={(e) => setLoginPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <button
            onClick={handleLogin}
            disabled={loginLoading}
            className="w-full py-3 rounded-xl font-semibold text-sm text-black bg-gradient-to-r from-amber-400 to-orange-500 hover:opacity-90 disabled:opacity-50"
          >
            {loginLoading ? "Đang đăng nhập..." : "Đăng nhập & Lưu thiết bị"}
          </button>
        </div>
      </div>
    );
  }

  // MAIN APP
  return (
    <div className="min-h-screen bg-[#0a0a0b] flex justify-center px-3 py-6">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="w-full max-w-md">
        {/* Header card */}
        <div className="rounded-2xl border border-amber-500/25 bg-[#141416] p-4 mb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-base font-semibold text-amber-400">🪐 Locket Gold VIP</div>
              <div className="text-xs text-zinc-400 mt-1">
                ID: {user.telegramId || user.id} | Vai trò:{" "}
                <span className="inline-block px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  {user.role}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-black text-xs font-bold">
                💰 {money(user.walletBalance)}
              </div>
              <button onClick={logout} className="text-[10px] text-zinc-500 hover:text-zinc-300">
                Đổi ID
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-4 grid grid-cols-5 gap-1 bg-[#0a0a0b] rounded-xl p-1">
            {(
              [
                ["shop", "🛒", "Shop"],
                ["orders", "📋", "Đơn hàng"],
                ["recharge", "💳", "Nạp tiền"],
                ["password", "🔑", "Mật khẩu"],
                ["support", "💬", "Hỗ trợ"],
              ] as const
            ).map(([id, icon, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex flex-col items-center gap-0.5 py-2 rounded-lg text-[10px] transition ${
                  tab === id
                    ? "bg-gradient-to-b from-amber-400/20 to-amber-600/10 text-amber-400"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <span className="text-base">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="rounded-2xl border border-zinc-800 bg-[#141416] p-4 min-h-[320px]">
          {tab === "shop" && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-amber-400 border-l-2 border-amber-400 pl-2">
                📦 Danh sách sản phẩm
              </h2>

              {/* Check gold */}
              <div className="rounded-xl border border-zinc-800 p-3 space-y-2">
                <div className="text-xs font-medium text-amber-400/90">👑 Tra cứu Locket Gold</div>
                <div className="flex gap-2">
                  <input
                    className="flex-1 px-3 py-2 rounded-lg bg-[#0a0a0b] border border-zinc-700 text-sm text-white outline-none focus:border-amber-500"
                    placeholder="Nhập username..."
                    value={checkUser}
                    onChange={(e) => setCheckUser(e.target.value)}
                  />
                  <button
                    onClick={doCheckGold}
                    className="px-3 py-2 rounded-lg bg-amber-500 text-black text-xs font-semibold"
                  >
                    Tra cứu
                  </button>
                </div>
                {checkResult && (
                  <pre className="text-xs text-zinc-400 whitespace-pre-wrap">{checkResult}</pre>
                )}
              </div>

              {products.length === 0 ? (
                <p className="text-center text-sm text-zinc-500 py-8">Chưa có sản phẩm nào.</p>
              ) : (
                <div className="space-y-2">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 p-3"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-white truncate">{p.name}</div>
                        <div className="text-xs text-amber-400 mt-0.5">{money(p.price)}</div>
                        <div className="text-[10px] text-zinc-500">
                          Kho: {p.stock === -1 ? "∞" : p.stock}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setBuyProduct(p);
                          setBuyQty(1);
                        }}
                        disabled={p.stock === 0}
                        className="shrink-0 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-black text-xs font-bold disabled:opacity-40"
                      >
                        Mua
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "orders" && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-amber-400 border-l-2 border-amber-400 pl-2">
                📋 Lịch sử đơn hàng
              </h2>
              <p className="text-[11px] text-zinc-500">
                Nhấn vào đơn để xem chi tiết.
              </p>
              {orders.length === 0 ? (
                <p className="text-center text-sm text-zinc-500 py-8">Chưa có đơn hàng nào.</p>
              ) : (
                orders.map((o) => (
                  <div key={o.orderId} className="rounded-xl border border-zinc-800 p-3 text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="font-mono text-xs text-amber-400">{o.orderId}</span>
                      <span className="text-xs text-zinc-400">{o.status}</span>
                    </div>
                    <div className="text-white mt-1">{o.productName} ×{o.qty}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      {o.customerInput} · {money(o.totalAmount)}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "recharge" && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-amber-400 border-l-2 border-amber-400 pl-2">
                💳 Nạp tiền tài khoản
              </h2>
              {bankInfo && (
                <div className="text-xs text-zinc-300 space-y-1 rounded-xl border border-zinc-800 p-3">
                  <p>Ngân hàng: <b>{bankInfo.bank_name}</b></p>
                  <p>Số tài khoản: <b>{bankInfo.account}</b></p>
                  <p>Chủ tài khoản: <b>{bankInfo.owner}</b></p>
                </div>
              )}
              <label className="block text-xs text-zinc-400">Nhập số tiền cần nạp:</label>
              <input
                type="number"
                className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0b] border border-zinc-700 text-white text-sm outline-none focus:border-amber-500"
                value={rechargeAmt}
                onChange={(e) => setRechargeAmt(Number(e.target.value) || 0)}
              />
              <button
                onClick={genQr}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black text-sm font-semibold"
              >
                ✨ Tạo mã QR chuyển khoản
              </button>
              {qrUrl && (
                <div className="text-center space-y-2 pt-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrUrl} alt="QR" className="mx-auto rounded-xl max-w-[220px]" />
                  {bankInfo?.content && (
                    <p className="text-xs text-zinc-400">
                      Nội dung CK: <b className="text-amber-400">{bankInfo.content}</b>
                    </p>
                  )}
                  <p className="text-[11px] text-zinc-500">
                    Hệ thống tự động cộng tiền khi chuyển khoản đúng nội dung.
                  </p>
                </div>
              )}
            </div>
          )}

          {tab === "password" && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-amber-400 border-l-2 border-amber-400 pl-2">
                🔑 Đổi mật khẩu tài khoản
              </h2>
              <input
                type="password"
                className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0b] border border-zinc-700 text-white text-sm outline-none focus:border-amber-500"
                placeholder="Mật khẩu hiện tại..."
                value={curPw}
                onChange={(e) => setCurPw(e.target.value)}
              />
              <input
                type="password"
                className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0b] border border-zinc-700 text-white text-sm outline-none focus:border-amber-500"
                placeholder="Mật khẩu mới (tối thiểu 6 ký tự)..."
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
              />
              <input
                type="password"
                className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0b] border border-zinc-700 text-white text-sm outline-none focus:border-amber-500"
                placeholder="Nhập lại mật khẩu mới..."
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
              />
              <button
                onClick={changePassword}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black text-sm font-semibold"
              >
                💾 Lưu mật khẩu mới
              </button>
            </div>
          )}

          {tab === "support" && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-amber-400 border-l-2 border-amber-400 pl-2">
                💬 Kênh Hỗ Trợ & Liên Hệ Admin
              </h2>
              <a
                href="https://t.me/manhmuzan"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl border border-zinc-800 p-3 hover:border-amber-500/40 transition"
              >
                <span className="text-xl">✈️</span>
                <div>
                  <div className="text-sm text-white">Telegram Admin</div>
                  <div className="text-xs text-zinc-500">Nhắn tin trực tiếp với @manhmuzan</div>
                </div>
              </a>
              <a
                href="https://zalo.me/0326353220"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl border border-zinc-800 p-3 hover:border-amber-500/40 transition"
              >
                <span className="text-xl">💬</span>
                <div>
                  <div className="text-sm text-white">Zalo Admin</div>
                  <div className="text-xs text-zinc-500">Hỗ trợ nhanh qua Zalo: 0326353220</div>
                </div>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Buy Modal */}
      {buyProduct && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-[#141416] p-5 space-y-3">
            <h3 className="font-semibold text-white">Mua {buyProduct.name}</h3>
            <p className="text-xs text-amber-400">{money(buyProduct.price)} / sản phẩm</p>
            <label className="block text-xs text-zinc-400">Số lượng</label>
            <input
              type="number"
              min={1}
              className="w-full px-3 py-2 rounded-lg bg-[#0a0a0b] border border-zinc-700 text-white text-sm"
              value={buyQty}
              onChange={(e) => setBuyQty(Math.max(1, Number(e.target.value) || 1))}
            />
            <label className="block text-xs text-zinc-400">Username Locket</label>
            <input
              className="w-full px-3 py-2 rounded-lg bg-[#0a0a0b] border border-zinc-700 text-white text-sm"
              placeholder="VD: manhmuzan hoặc https://locket.cam/..."
              value={buyLocket}
              onChange={(e) => setBuyLocket(e.target.value)}
            />
            <label className="block text-xs text-zinc-400">Mã giảm giá (nếu có)</label>
            <input
              className="w-full px-3 py-2 rounded-lg bg-[#0a0a0b] border border-zinc-700 text-white text-sm"
              placeholder="Nhập mã..."
              value={buyDiscount}
              onChange={(e) => setBuyDiscount(e.target.value)}
            />
            <p className="text-sm text-white">
              Tổng: <b className="text-amber-400">{money(buyProduct.price * buyQty)}</b>
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setBuyProduct(null)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-sm text-zinc-300"
              >
                Hủy
              </button>
              <button
                onClick={handleBuy}
                disabled={buying}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black text-sm font-semibold disabled:opacity-50"
              >
                {buying ? "Đang xử lý..." : "Xác nhận mua"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
