"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type User = {
  telegramId: string;
  displayName: string;
  walletBalance: number;
  role: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  stock?: number;
  isGold?: boolean;
  description?: string;
};

type Order = {
  id: string;
  orderId?: string;
  productName?: string;
  qty?: number;
  totalAmount?: number;
  status?: string;
  customerInput?: string;
  createdAt?: { seconds?: number };
};

const money = (n: number) => (n || 0).toLocaleString("vi-VN") + "đ";

function AppInner() {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");

  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<"shop" | "orders" | "topup" | "account">("shop");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  // auth form
  const [authMode, setAuthMode] = useState<"login" | "register">(
    modeParam === "register" ? "register" : "login"
  );
  const [loginId, setLoginId] = useState("");
  const [loginPw, setLoginPw] = useState("");
  const [regName, setRegName] = useState("");
  const [authErr, setAuthErr] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // buy
  const [buyProduct, setBuyProduct] = useState<Product | null>(null);
  const [buyQty, setBuyQty] = useState(1);
  const [buyLocket, setBuyLocket] = useState("");
  const [buyDiscount, setBuyDiscount] = useState("");
  const [buying, setBuying] = useState(false);
  const [bill, setBill] = useState<Record<string, string | number> | null>(null);

  // topup
  const [rechargeAmt, setRechargeAmt] = useState(50000);
  const [qrUrl, setQrUrl] = useState("");
  const [bankInfo, setBankInfo] = useState<{
    bank_name: string;
    account: string;
    owner: string;
    content?: string;
  } | null>(null);

  // password
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  // check gold
  const [checkUser, setCheckUser] = useState("");
  const [checkResult, setCheckResult] = useState("");
  const [checking, setChecking] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3200);
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
    } catch {
      /* ignore */
    }
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
      if (tab === "topup") {
        fetch("/api/customer?action=bank")
          .then((r) => r.json())
          .then((d) => setBankInfo(d.bank));
      }
    }
  }, [user, tab, loadProducts, loadOrders]);

  const handleAuth = async () => {
    setAuthErr("");
    setAuthLoading(true);
    try {
      const res = await fetch("/api/customer/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: authMode,
          telegramId: loginId.trim(),
          password: loginPw,
          displayName: regName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthErr(data.error || "Thất bại");
      } else {
        setUser(data.user);
        showToast(authMode === "register" ? "Đăng ký thành công" : "Đăng nhập thành công");
      }
    } catch {
      setAuthErr("Không kết nối được máy chủ");
    }
    setAuthLoading(false);
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
        showToast(data.error || "Mua không thành công");
      } else {
        showToast(data.message || "Đặt hàng thành công");
        setUser((u) => (u ? { ...u, walletBalance: data.balance } : u));
        setBuyProduct(null);
        setBuyLocket("");
        setBuyDiscount("");
        setBuyQty(1);
        if (data.bill) setBill(data.bill);
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
      showToast("Đã đổi mật khẩu");
      setCurPw("");
      setNewPw("");
      setConfirmPw("");
    }
  };

  const doCheckGold = async () => {
    if (!checkUser.trim()) return;
    setChecking(true);
    setCheckResult("");
    try {
      const res = await fetch(
        `/api/customer/check?u=${encodeURIComponent(checkUser.trim())}`
      );
      const data = await res.json();
      if (data.success || data.username || data.name) {
        const goldStatus =
          data.gold_status ||
          data.status_gold ||
          (data.is_gold || data.isGold ? "Đã có Gold" : "Chưa có Gold");
        const name = data.name || data.fullname || data.displayName || "";
        const uname = data.username || checkUser.trim();
        const uid = data.uid || data.user_id || "";
        setCheckResult(
          JSON.stringify({
            name,
            uname,
            goldStatus,
            uid,
            avatar: data.avatar || data.profile_pic_url || "",
          })
        );
      } else {
        setCheckResult(JSON.stringify({ error: data.message || data.error || "Không tìm thấy" }));
      }
    } catch {
      setCheckResult(JSON.stringify({ error: "Lỗi kết nối" }));
    }
    setChecking(false);
  };

  const logout = async () => {
    await fetch("/api/customer/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    setUser(null);
    setAuthMode("login");
  };

  const isAdmin =
    user &&
    (user.role === "admin" || user.role === "Admin" || user.role === "administrator");

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0c]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
      </div>
    );
  }

  /* ========== AUTH SCREEN ========== */
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-[#0a0a0c]">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-10">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-base font-bold text-black">
                LG
              </div>
            </Link>
            <h1 className="mt-5 text-2xl font-bold text-white">
              {authMode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Dùng Telegram ID để {authMode === "login" ? "đăng nhập" : "đăng ký"}
            </p>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-6">
            {authErr && (
              <div className="mb-4 rounded-xl bg-red-500/10 px-3 py-2.5 text-center text-sm text-red-400">
                {authErr}
              </div>
            )}

            {authMode === "register" && (
              <>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Tên hiển thị
                </label>
                <input
                  className="mb-3 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-amber-500/50"
                  placeholder="Tên của bạn"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                />
              </>
            )}

            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Telegram ID
            </label>
            <input
              className="mb-3 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-amber-500/50"
              placeholder="Ví dụ: 6956722046"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
            />

            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Mật khẩu
            </label>
            <input
              type="password"
              className="mb-5 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-amber-500/50"
              placeholder={authMode === "register" ? "Tối thiểu 6 ký tự" : "Mật khẩu"}
              value={loginPw}
              onChange={(e) => setLoginPw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAuth()}
            />

            <button
              onClick={handleAuth}
              disabled={authLoading}
              className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 py-3.5 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
            >
              {authLoading
                ? "Đang xử lý..."
                : authMode === "login"
                  ? "Đăng nhập"
                  : "Đăng ký"}
            </button>

            <p className="mt-5 text-center text-sm text-zinc-500">
              {authMode === "login" ? (
                <>
                  Chưa có tài khoản?{" "}
                  <button
                    type="button"
                    className="font-medium text-amber-400 hover:underline"
                    onClick={() => {
                      setAuthMode("register");
                      setAuthErr("");
                    }}
                  >
                    Đăng ký
                  </button>
                </>
              ) : (
                <>
                  Đã có tài khoản?{" "}
                  <button
                    type="button"
                    className="font-medium text-amber-400 hover:underline"
                    onClick={() => {
                      setAuthMode("login");
                      setAuthErr("");
                    }}
                  >
                    Đăng nhập
                  </button>
                </>
              )}
            </p>
          </div>

          <p className="mt-6 text-center">
            <Link href="/" className="text-xs text-zinc-600 hover:text-zinc-400">
              ← Về trang chủ
            </Link>
          </p>
        </div>
      </div>
    );
  }

  /* ========== LOGGED IN APP ========== */
  let checkParsed: {
    name?: string;
    uname?: string;
    goldStatus?: string;
    uid?: string;
    avatar?: string;
    error?: string;
  } | null = null;
  if (checkResult) {
    try {
      checkParsed = JSON.parse(checkResult);
    } catch {
      checkParsed = { error: checkResult };
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] pb-24 text-white">
      {toast && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full border border-white/10 bg-zinc-900 px-5 py-2.5 text-sm shadow-xl">
          {toast}
        </div>
      )}

      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#0a0a0c]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <div>
            <div className="text-sm font-semibold text-white">
              {user.displayName || "Xin chào"}
            </div>
            <div className="text-[11px] text-zinc-500">ID {user.telegramId}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1.5 text-xs font-bold text-black">
              {money(user.walletBalance)}
            </div>
            {isAdmin && (
              <Link
                href="/login"
                className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300"
              >
                Admin
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pt-5">
        {tab === "shop" && (
          <div className="space-y-5">
            {/* Check gold card */}
            <section className="rounded-2xl border border-white/5 bg-gradient-to-br from-amber-500/10 to-transparent p-4">
              <h2 className="mb-3 text-sm font-semibold text-amber-300">
                Tra cứu Locket Gold
              </h2>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm outline-none placeholder:text-zinc-600 focus:border-amber-500/40"
                  placeholder="Username Locket"
                  value={checkUser}
                  onChange={(e) => setCheckUser(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && doCheckGold()}
                />
                <button
                  onClick={doCheckGold}
                  disabled={checking}
                  className="rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
                >
                  {checking ? "..." : "Tra"}
                </button>
              </div>
              {checkParsed && (
                <div className="mt-3 rounded-xl border border-white/5 bg-black/30 p-3">
                  {checkParsed.error ? (
                    <p className="text-sm text-red-400">{checkParsed.error}</p>
                  ) : (
                    <div className="flex items-center gap-3">
                      {checkParsed.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={checkParsed.avatar}
                          alt=""
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-zinc-500">
                          ?
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {checkParsed.name || checkParsed.uname}
                        </div>
                        <div className="text-xs text-zinc-500">@{checkParsed.uname}</div>
                        <div className="mt-0.5 text-xs text-amber-400">
                          {checkParsed.goldStatus}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold text-zinc-300">Sản phẩm</h2>
              {products.length === 0 ? (
                <p className="py-12 text-center text-sm text-zinc-600">
                  Chưa có sản phẩm
                </p>
              ) : (
                <div className="grid gap-3">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/10 text-lg">
                        {p.isGold ? "⭐" : "📦"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{p.name}</div>
                        <div className="mt-0.5 text-sm font-semibold text-amber-400">
                          {money(p.price)}
                          {p.originalPrice != null &&
                            p.originalPrice !== p.price && (
                              <span className="ml-2 text-xs font-normal text-zinc-500 line-through">
                                {money(p.originalPrice)}
                              </span>
                            )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setBuyProduct(p);
                          setBuyQty(1);
                        }}
                        className="shrink-0 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-amber-400"
                      >
                        Mua
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {tab === "orders" && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-zinc-300">Đơn hàng của bạn</h2>
            {orders.length === 0 ? (
              <p className="py-12 text-center text-sm text-zinc-600">Chưa có đơn nào</p>
            ) : (
              orders.map((o) => (
                <div
                  key={o.id || o.orderId}
                  className="rounded-2xl border border-white/5 bg-white/[0.03] p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium">
                        {o.productName || "Sản phẩm"} ×{o.qty || 1}
                      </div>
                      <div className="mt-0.5 text-xs text-zinc-500">
                        @{o.customerInput} · {o.orderId}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        o.status === "success"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : o.status === "pending"
                            ? "bg-amber-500/15 text-amber-400"
                            : "bg-red-500/15 text-red-400"
                      }`}
                    >
                      {o.status === "success"
                        ? "Thành công"
                        : o.status === "pending"
                          ? "Chờ xử lý"
                          : o.status || "—"}
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-semibold text-amber-400">
                    {money(o.totalAmount || 0)}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "topup" && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-zinc-300">Nạp tiền</h2>
            {bankInfo && (
              <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-sm leading-relaxed">
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500">Ngân hàng</span>
                  <span className="font-medium">{bankInfo.bank_name}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500">Số tài khoản</span>
                  <span className="font-mono font-semibold text-amber-400">
                    {bankInfo.account}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500">Chủ tài khoản</span>
                  <span className="font-medium">{bankInfo.owner}</span>
                </div>
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-xs text-zinc-500">Số tiền</label>
              <input
                type="number"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-amber-500/40"
                value={rechargeAmt}
                onChange={(e) => setRechargeAmt(Number(e.target.value) || 0)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {[50000, 100000, 200000, 500000].map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setRechargeAmt(a)}
                  className={`rounded-full px-3 py-1.5 text-xs ${
                    rechargeAmt === a
                      ? "bg-amber-400 text-black"
                      : "bg-white/5 text-zinc-400"
                  }`}
                >
                  {money(a)}
                </button>
              ))}
            </div>
            <button
              onClick={genQr}
              className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 py-3.5 text-sm font-semibold text-black"
            >
              Tạo mã QR
            </button>
            {qrUrl && (
              <div className="space-y-2 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrUrl}
                  alt="QR"
                  className="mx-auto max-w-[220px] rounded-2xl bg-white p-2"
                />
                {bankInfo?.content && (
                  <p className="text-xs text-zinc-400">
                    Nội dung:{" "}
                    <span className="font-mono font-semibold text-amber-400">
                      {bankInfo.content}
                    </span>
                  </p>
                )}
                <p className="text-[11px] text-zinc-600">
                  Chuyển đúng nội dung để được cộng tiền tự động
                </p>
              </div>
            )}
          </div>
        )}

        {tab === "account" && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xl font-bold text-black">
                {(user.displayName || "U").charAt(0).toUpperCase()}
              </div>
              <div className="mt-3 text-base font-semibold">{user.displayName}</div>
              <div className="text-xs text-zinc-500">Telegram ID: {user.telegramId}</div>
              <div className="mt-1 text-xs capitalize text-zinc-400">
                Vai trò: {user.role}
              </div>
              <div className="mt-3 text-lg font-bold text-amber-400">
                {money(user.walletBalance)}
              </div>
            </div>

            {isAdmin && (
              <Link
                href="/login"
                className="flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3.5 text-sm font-medium text-amber-300"
              >
                <span>Quản trị Admin</span>
                <span>→</span>
              </Link>
            )}

            <div className="space-y-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
              <h3 className="text-sm font-semibold text-zinc-300">Đổi mật khẩu</h3>
              <input
                type="password"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm outline-none focus:border-amber-500/40"
                placeholder="Mật khẩu hiện tại"
                value={curPw}
                onChange={(e) => setCurPw(e.target.value)}
              />
              <input
                type="password"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm outline-none focus:border-amber-500/40"
                placeholder="Mật khẩu mới"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
              />
              <input
                type="password"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm outline-none focus:border-amber-500/40"
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
              />
              <button
                onClick={changePassword}
                className="w-full rounded-xl bg-white/10 py-2.5 text-sm font-medium hover:bg-white/15"
              >
                Lưu mật khẩu
              </button>
            </div>

            <div className="space-y-2">
              <a
                href="https://t.me/manhmuzan"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm"
              >
                <span>✈️</span> Telegram hỗ trợ
              </a>
              <a
                href="https://zalo.me/0326353220"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm"
              >
                <span>💬</span> Zalo hỗ trợ
              </a>
            </div>

            <button
              onClick={logout}
              className="w-full rounded-xl border border-red-500/20 py-3 text-sm text-red-400 hover:bg-red-500/10"
            >
              Đăng xuất
            </button>
          </div>
        )}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/5 bg-[#0a0a0c]/95 backdrop-blur-xl">
        <div className="mx-auto grid max-w-lg grid-cols-4 px-2 py-2">
          {(
            [
              ["shop", "Cửa hàng", "🛍️"],
              ["orders", "Đơn hàng", "📋"],
              ["topup", "Nạp tiền", "💳"],
              ["account", "Tài khoản", "👤"],
            ] as const
          ).map(([id, label, icon]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex flex-col items-center gap-0.5 rounded-xl py-2 text-[10px] ${
                tab === id ? "text-amber-400" : "text-zinc-500"
              }`}
            >
              <span className="text-lg">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Buy sheet */}
      {buyProduct && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center">
          <div className="w-full max-w-md rounded-t-3xl border border-white/10 bg-[#121214] p-5 sm:rounded-3xl">
            <h3 className="text-base font-semibold">{buyProduct.name}</h3>
            <p className="mt-1 text-sm text-amber-400">{money(buyProduct.price)}</p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Số lượng</label>
                <input
                  type="number"
                  min={1}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm outline-none"
                  value={buyQty}
                  onChange={(e) => setBuyQty(Math.max(1, Number(e.target.value) || 1))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Username Locket</label>
                <input
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm outline-none"
                  placeholder="username hoặc link locket.cam/..."
                  value={buyLocket}
                  onChange={(e) => setBuyLocket(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Mã giảm giá</label>
                <input
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm outline-none"
                  placeholder="Không bắt buộc"
                  value={buyDiscount}
                  onChange={(e) => setBuyDiscount(e.target.value)}
                />
              </div>
              <p className="text-sm">
                Tổng:{" "}
                <span className="font-semibold text-amber-400">
                  {money(buyProduct.price * buyQty)}
                </span>
              </p>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setBuyProduct(null)}
                className="flex-1 rounded-xl border border-white/10 py-3 text-sm text-zinc-300"
              >
                Hủy
              </button>
              <button
                onClick={handleBuy}
                disabled={buying}
                className="flex-1 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 py-3 text-sm font-semibold text-black disabled:opacity-50"
              >
                {buying ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bill modal */}
      {bill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#121214] p-5">
            <h3 className="text-center text-sm font-semibold text-amber-400">
              Hóa đơn
            </h3>
            <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-dashed border-white/10 bg-black/30 p-3 text-xs leading-relaxed text-zinc-300">
              {`${bill.statusHeader}
----------------------
Mã đơn     : ${bill.orderId}
Ngày       : ${bill.createdAt}
Sản phẩm   : ${bill.productName}
Số lượng   : ${bill.qty}
Thành tiền : ${money(Number(bill.total))}
Username   : @${bill.customerInput}

${bill.footerMsg}`}
            </pre>
            <button
              onClick={() => setBill(null)}
              className="mt-4 w-full rounded-xl bg-white/10 py-2.5 text-sm"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerAppPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0c]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
        </div>
      }
    >
      <AppInner />
    </Suspense>
  );
}
