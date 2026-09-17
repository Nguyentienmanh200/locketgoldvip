/**
 * Persistent database via GitHub Contents API
 * Files: data/users.json, products.json, orders.json, ...
 * Requires env: GITHUB_TOKEN, GITHUB_REPO (owner/repo)
 */
import type {
  User,
  Product,
  Order,
  Discount,
  Giftcode,
  Transaction,
  CtvPrice,
  CtvApplication,
  Settings,
  ZaloSession,
} from "./types";

const REPO = process.env.GITHUB_REPO || "ontopcommunity/locketgoldvip";
const TOKEN = process.env.GITHUB_TOKEN || "";
const BRANCH = process.env.GITHUB_DATA_BRANCH || "main";
const API = `https://api.github.com/repos/${REPO}/contents`;

// In-memory cache + sha for optimistic updates
const cache = new Map<string, { data: unknown; sha: string; ts: number }>();
const CACHE_TTL = 5000;

const DEFAULT_SETTINGS: Settings = {
  admin_password: process.env.ADMIN_PASSWORD || "admin123",
  zalo_bot_token: process.env.ZALO_BOT_TOKEN || "",
  zalo_secret_token: process.env.ZALO_SECRET_TOKEN || "",
  admin_zalo_id: process.env.ZALO_ADMIN_CHAT_ID || "",
  sepay_api_key: process.env.SEPAY_API_KEY || "",
  locket_api_key: process.env.LOCKET_API_KEY || "",
  locket_api_base_url: process.env.LOCKET_API_BASE_URL || "",
  bank_name: process.env.BANK_NAME || "MB Bank",
  bank_account: process.env.BANK_ACCOUNT || "732377",
  bank_owner: process.env.BANK_OWNER || "NGUYEN TIEN MANH",
  bank_code: process.env.BANK_CODE || "MB",
  telegram_bot_token: process.env.TELEGRAM_BOT_TOKEN || "",
  telegram_bot_username: process.env.TELEGRAM_BOT_USERNAME || "",
};

const DEFAULT_PRODUCTS: Product[] = [
  { id: "locket_gold_1month", name: "Locket Gold 1 Tháng", price: 45000, stock: 100, api_order_enabled: true, isGold: true, description: "Locket Gold 30 ngày" },
  { id: "locket_gold_3month", isGold: true, name: "Locket Gold 3 Tháng", price: 120000, stock: 80, api_order_enabled: true, isGold: true },
  { id: "locket_gold_6month", isGold: true, name: "Locket Gold 6 Tháng", price: 220000, stock: 40, api_order_enabled: true, isGold: true },
  { id: "locket_gold_1year", isGold: true, name: "Locket Gold 1 Năm", price: 380000, stock: 20, api_order_enabled: true, isGold: true },
];

async function ghHeaders() {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${TOKEN}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
}

async function readFile<T>(path: string, fallback: T): Promise<{ data: T; sha: string | null }> {
  const cached = cache.get(path);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return { data: cached.data as T, sha: cached.sha };
  }
  if (!TOKEN) {
    return { data: fallback, sha: null };
  }
  try {
    const res = await fetch(`${API}/data/${path}?ref=${BRANCH}`, {
      headers: await ghHeaders(),
      cache: "no-store",
    });
    if (res.status === 404) {
      cache.set(path, { data: fallback, sha: "", ts: Date.now() });
      return { data: fallback, sha: null };
    }
    if (!res.ok) {
      console.error("[db] read fail", path, res.status);
      return { data: (cached?.data as T) ?? fallback, sha: cached?.sha ?? null };
    }
    const json = await res.json();
    const content = Buffer.from(json.content.replace(/\n/g, ""), "base64").toString("utf8");
    const data = JSON.parse(content) as T;
    cache.set(path, { data, sha: json.sha, ts: Date.now() });
    return { data, sha: json.sha };
  } catch (e) {
    console.error("[db] read error", path, e);
    return { data: (cached?.data as T) ?? fallback, sha: cached?.sha ?? null };
  }
}

async function writeFile<T>(path: string, data: T, message: string): Promise<boolean> {
  cache.set(path, { data, sha: cache.get(path)?.sha || "", ts: Date.now() });
  if (!TOKEN) {
    console.warn("[db] No GITHUB_TOKEN — data only in memory");
    return false;
  }
  try {
    const current = await readFile<T>(path, data);
    // re-read for latest sha
    const resGet = await fetch(`${API}/data/${path}?ref=${BRANCH}`, {
      headers: await ghHeaders(),
      cache: "no-store",
    });
    let sha: string | undefined;
    if (resGet.ok) {
      const j = await resGet.json();
      sha = j.sha;
    }
    const body: Record<string, unknown> = {
      message: message.slice(0, 80),
      content: Buffer.from(JSON.stringify(data, null, 2), "utf8").toString("base64"),
      branch: BRANCH,
    };
    if (sha) body.sha = sha;
    const res = await fetch(`${API}/data/${path}`, {
      method: "PUT",
      headers: await ghHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("[db] write fail", path, res.status, err.slice(0, 200));
      return false;
    }
    const out = await res.json();
    if (out.content?.sha) {
      cache.set(path, { data, sha: out.content.sha, ts: Date.now() });
    }
    return true;
  } catch (e) {
    console.error("[db] write error", path, e);
    return false;
  }
}

// ---------- Settings ----------
export async function getSettings(): Promise<Settings> {
  const { data } = await readFile<Partial<Settings>>("settings.json", {});
  return { ...DEFAULT_SETTINGS, ...data };
}
export async function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
  const s = await getSettings();
  s[key] = value;
  await writeFile("settings.json", s, `update setting ${key}`);
  return s;
}

// ---------- Users ----------
export async function getAllUsers(): Promise<User[]> {
  const { data } = await readFile<User[]>("users.json", []);
  return data;
}
export async function saveUsers(users: User[]) {
  await writeFile("users.json", users, "update users");
}
export async function getUserById(id: number) {
  return (await getAllUsers()).find((u) => u.id === id) || null;
}
export async function getUserByUsername(username: string) {
  const u = username.toLowerCase();
  return (await getAllUsers()).find((x) => x.username.toLowerCase() === u) || null;
}
export async function getUserByZaloId(zaloId: string) {
  return (await getAllUsers()).find((u) => u.zaloId === zaloId) || null;
}
export async function getUserByTelegramId(telegramId: string) {
  return (await getAllUsers()).find((u) => u.telegramId === telegramId) || null;
}
export async function createUser(username: string, displayName = "", extra: Partial<User> = {}): Promise<User> {
  const users = await getAllUsers();
  const id = users.reduce((m, u) => Math.max(m, u.id), 0) + 1;
  const user: User = {
    id,
    username,
    displayName: displayName || username,
    walletBalance: 0,
    role: "user",
    createdAt: new Date().toISOString(),
    ...extra,
  };
  users.push(user);
  await saveUsers(users);
  return user;
}
export async function updateUser(id: number, data: Partial<User>) {
  const users = await getAllUsers();
  const i = users.findIndex((u) => u.id === id);
  if (i < 0) return null;
  users[i] = { ...users[i], ...data };
  await saveUsers(users);
  return users[i];
}
export async function updateUserBalance(userId: number, newBalance: number) {
  return updateUser(userId, { walletBalance: newBalance });
}
export async function deleteUser(id: number) {
  const users = (await getAllUsers()).filter((u) => u.id !== id);
  await saveUsers(users);
}
export async function getOrCreateUserByZalo(zaloId: string, displayName: string): Promise<User> {
  let user = await getUserByZaloId(zaloId);
  if (user) {
    if (displayName && user.displayName !== displayName) {
      await updateUser(user.id, { displayName });
      user = (await getUserById(user.id))!;
    }
    return user;
  }
  return createUser("zalo_" + zaloId.slice(0, 12), displayName, { zaloId });
}
export async function getOrCreateUserByTelegram(telegramId: string, displayName: string, telegramUsername?: string): Promise<User> {
  let user = await getUserByTelegramId(telegramId);
  if (user) {
    await updateUser(user.id, {
      displayName: displayName || user.displayName,
      telegramUsername: telegramUsername || user.telegramUsername,
    });
    return (await getUserById(user.id))!;
  }
  const username = telegramUsername ? "tg_" + telegramUsername : "tg_" + telegramId;
  return createUser(username, displayName || username, { telegramId, telegramUsername });
}
export async function getCtvList() {
  return (await getAllUsers()).filter((u) => u.role === "ctv" || u.role === "admin");
}

// ---------- Products ----------
export async function getAllProducts(): Promise<Product[]> {
  const { data } = await readFile<Product[]>("products.json", []);
  if (data.length === 0) {
    await writeFile("products.json", DEFAULT_PRODUCTS, "seed products");
    return DEFAULT_PRODUCTS;
  }
  return data;
}
export async function getProductById(id: string) {
  return (await getAllProducts()).find((p) => p.id === id) || null;
}
export async function saveProducts(products: Product[]) {
  await writeFile("products.json", products, "update products");
}
export async function createProduct(p: Product) {
  const list = await getAllProducts();
  if (list.find((x) => x.id === p.id)) return false;
  list.push({ ...p, createdAt: new Date().toISOString() });
  await saveProducts(list);
  return true;
}
export async function deleteProduct(id: string) {
  await saveProducts((await getAllProducts()).filter((p) => p.id !== id));
}
export async function updateProduct(id: string, field: string, value: unknown) {
  const list = await getAllProducts();
  const i = list.findIndex((p) => p.id === id);
  if (i < 0) return false;
  (list[i] as unknown as Record<string, unknown>)[field] = value;
  await saveProducts(list);
  return true;
}
export async function changeProductStock(id: string, delta: number) {
  const products = await getAllProducts();
  const i = products.findIndex((p) => p.id === id);
  if (i < 0) return false;
  const stock = products[i].stock;
  if (stock === -1) return -1;
  const next = stock + delta;
  if (next < 0) return false;
  products[i].stock = next;
  await saveProducts(products);
  return next;
}

// ---------- CTV prices ----------
export async function getCtvPricesAll(): Promise<CtvPrice[]> {
  const { data } = await readFile<CtvPrice[]>("ctv_prices.json", []);
  return data;
}
export async function getCtvPrice(userId: number, productId: string) {
  const row = (await getCtvPricesAll()).find((x) => x.userId === userId && x.productId === productId);
  return row ? row.price : null;
}
export async function setCtvPrice(userId: number, productId: string, price: number) {
  const list = await getCtvPricesAll();
  const i = list.findIndex((x) => x.userId === userId && x.productId === productId);
  if (i >= 0) list[i].price = price;
  else list.push({ userId, productId, price });
  await writeFile("ctv_prices.json", list, "update ctv price");
}
export async function getProductEffectivePrice(productId: string, user: User | null) {
  const product = await getProductById(productId);
  if (!product) return 0;
  // 1) Giá riêng từng user (customPrices) — như Firebase gốc
  if (user?.customPrices) {
    const key = String(productId);
    if (user.customPrices[key] != null) return Number(user.customPrices[key]);
    if (user.customPrices[productId] != null) return Number(user.customPrices[productId]);
  }
  // 2) Bảng giá CTV theo userId+product
  if (user && (user.role === "ctv" || user.role === "agent" || user.role === "admin")) {
    const ctv = await getCtvPrice(user.id, productId);
    if (ctv !== null) return ctv;
    if (product.ctvPrice != null) return Number(product.ctvPrice);
  }
  return product.price;
}

// ---------- Orders ----------
export async function getAllOrders(): Promise<Order[]> {
  const { data } = await readFile<Order[]>("orders.json", []);
  return data;
}
export async function getOrderById(orderId: string) {
  return (await getAllOrders()).find((o) => o.orderId === orderId) || null;
}
export async function getOrdersByUserId(userId: number, limit = 0) {
  let list = (await getAllOrders()).filter((o) => o.userId === userId);
  if (limit > 0) list = list.slice(0, limit);
  return list;
}
export async function createOrder(data: Omit<Order, "createdAt" | "status"> & Partial<Order>): Promise<Order> {
  const orders = await getAllOrders();
  const order: Order = {
    ...data,
    qty: data.qty ?? 1,
    discountAmount: data.discountAmount ?? 0,
    status: data.status ?? "pending",
    createdAt: data.createdAt ?? new Date().toISOString(),
  } as Order;
  orders.unshift(order);
  await writeFile("orders.json", orders, `order ${order.orderId}`);
  return order;
}
export async function updateOrderStatus(orderId: string, status: Order["status"]) {
  const orders = await getAllOrders();
  const i = orders.findIndex((o) => o.orderId === orderId);
  if (i < 0) return null;
  orders[i].status = status;
  await writeFile("orders.json", orders, `order status ${orderId}`);
  return orders[i];
}
export function generateOrderId() {
  return "LD" + Date.now() + Math.random().toString(36).slice(2, 6).toUpperCase();
}

// ---------- Discounts ----------
export async function getAllDiscounts(): Promise<Discount[]> {
  const { data } = await readFile<Discount[]>("discounts.json", []);
  return data;
}
export async function getDiscount(code: string) {
  const c = code.toLowerCase();
  return (await getAllDiscounts()).find((d) => d.code.toLowerCase() === c) || null;
}
export async function createDiscount(code: string, value: number, type: "percent" | "fixed" = "percent", maxUses = 999) {
  const list = await getAllDiscounts();
  if (list.find((d) => d.code.toLowerCase() === code.toLowerCase())) return false;
  list.push({ code, value, type, max_uses: maxUses, used: 0, createdAt: new Date().toISOString() });
  await writeFile("discounts.json", list, "add discount");
  return true;
}
export async function deleteDiscount(code: string) {
  const list = (await getAllDiscounts()).filter((d) => d.code.toLowerCase() !== code.toLowerCase());
  await writeFile("discounts.json", list, "delete discount");
}
export async function useDiscount(code: string) {
  const list = await getAllDiscounts();
  const i = list.findIndex((d) => d.code.toLowerCase() === code.toLowerCase());
  if (i < 0) return false;
  list[i].used = (list[i].used || 0) + 1;
  await writeFile("discounts.json", list, "use discount");
  return true;
}

// ---------- Giftcodes ----------
export async function getAllGiftcodes(): Promise<Giftcode[]> {
  const { data } = await readFile<Giftcode[]>("giftcodes.json", []);
  return data;
}
export async function getGiftcode(code: string) {
  const c = code.toLowerCase();
  return (await getAllGiftcodes()).find((g) => g.code.toLowerCase() === c) || null;
}
export async function createGiftcode(code: string, reward: number, maxUses = 1) {
  const list = await getAllGiftcodes();
  if (list.find((g) => g.code.toLowerCase() === code.toLowerCase())) return false;
  list.push({ code, reward, max_uses: maxUses, used: 0, createdAt: new Date().toISOString() });
  await writeFile("giftcodes.json", list, "add giftcode");
  return true;
}
export async function deleteGiftcode(code: string) {
  const list = (await getAllGiftcodes()).filter((g) => g.code.toLowerCase() !== code.toLowerCase());
  await writeFile("giftcodes.json", list, "delete giftcode");
}
export async function useGiftcode(code: string) {
  const list = await getAllGiftcodes();
  const i = list.findIndex((g) => g.code.toLowerCase() === code.toLowerCase());
  if (i < 0) return false;
  list[i].used = (list[i].used || 0) + 1;
  await writeFile("giftcodes.json", list, "use giftcode");
  return true;
}

// ---------- Transactions ----------
export async function getAllTransactions(): Promise<Transaction[]> {
  const { data } = await readFile<Transaction[]>("transactions.json", []);
  return data;
}
export async function addTransaction(data: Omit<Transaction, "id" | "createdAt"> & Partial<Transaction>) {
  const txs = await getAllTransactions();
  const id = txs.reduce((m, t) => Math.max(m, t.id), 0) + 1;
  const row: Transaction = {
    id,
    createdAt: new Date().toISOString(),
    ...data,
  } as Transaction;
  txs.unshift(row);
  await writeFile("transactions.json", txs, "add transaction");
  return row;
}
export async function addBalance(userId: number, amount: number, type: string, note: string) {
  const user = await getUserById(userId);
  if (!user) return false;
  const newBalance = (user.walletBalance || 0) + amount;
  if (newBalance < 0) return false;
  await updateUserBalance(userId, newBalance);
  await addTransaction({ userId, type, amount, note, balanceAfter: newBalance });
  return true;
}
export async function refundOrder(orderId: string, userId: number, amount: number) {
  await addBalance(userId, amount, "refund", `Hoàn tiền đơn ${orderId}`);
  await updateOrderStatus(orderId, "refunded");
  return true;
}

// ---------- Sessions ----------
export async function getZaloSession(zaloId: string): Promise<ZaloSession | null> {
  const { data } = await readFile<Record<string, ZaloSession>>("sessions.json", {});
  return data[zaloId] || null;
}
export async function updateZaloSession(zaloId: string, state: ZaloSession) {
  const { data } = await readFile<Record<string, ZaloSession>>("sessions.json", {});
  data[zaloId] = state;
  await writeFile("sessions.json", data, "session update");
}
export async function deleteZaloSession(zaloId: string) {
  const { data } = await readFile<Record<string, ZaloSession>>("sessions.json", {});
  delete data[zaloId];
  await writeFile("sessions.json", data, "session delete");
}

// ---------- CTV applications ----------
export async function getCtvApplications(): Promise<CtvApplication[]> {
  const { data } = await readFile<CtvApplication[]>("ctv_applications.json", []);
  return data;
}
export async function addCtvApplication(app: Omit<CtvApplication, "id" | "status" | "createdAt">) {
  const list = await getCtvApplications();
  const row: CtvApplication = {
    ...app,
    id: "ctv_" + Date.now().toString(36),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  list.unshift(row);
  await writeFile("ctv_applications.json", list, "ctv apply");
  return row;
}
export async function updateCtvApplication(id: string, status: CtvApplication["status"]) {
  const list = await getCtvApplications();
  const i = list.findIndex((a) => a.id === id);
  if (i < 0) return null;
  list[i].status = status;
  await writeFile("ctv_applications.json", list, "ctv status");
  // Auto create user as ctv when approved
  if (status === "approved") {
    const app = list[i];
    let user = await getUserByUsername(app.username);
    if (!user) {
      user = await createUser(app.username, app.displayName, {
        zaloId: app.zaloId,
        role: "ctv",
      });
    } else {
      await updateUser(user.id, { role: "ctv", zaloId: app.zaloId || user.zaloId });
    }
  }
  return list[i];
}
