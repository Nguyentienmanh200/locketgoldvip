import { promises as fs } from "fs";
import path from "path";
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

const DATA_DIR =
  process.env.DATA_DIR ||
  (process.env.VERCEL ? "/tmp/locketgold-data" : path.join(process.cwd(), "data"));

// In-memory cache (persist across warm invocations on same instance)
const mem: Record<string, unknown> = {};

const DEFAULT_SETTINGS: Settings = {
  admin_password: process.env.ADMIN_PASSWORD || "admin123",
  zalo_bot_token: process.env.ZALO_BOT_TOKEN || "",
  zalo_secret_token: process.env.ZALO_SECRET_TOKEN || "",
  admin_zalo_id: process.env.ZALO_ADMIN_CHAT_ID || "",
  sepay_api_key: process.env.SEPAY_API_KEY || "",
  locket_api_key: process.env.LOCKET_API_KEY || "",
  locket_api_base_url:
    process.env.LOCKET_API_BASE_URL || "https://api.locket-gold.example",
  bank_name: process.env.BANK_NAME || "MB Bank",
  bank_account: process.env.BANK_ACCOUNT || "732377",
  bank_owner: process.env.BANK_OWNER || "NGUYEN TIEN MANH",
  bank_code: process.env.BANK_CODE || "MB",
  telegram_bot_token: process.env.TELEGRAM_BOT_TOKEN || "",
  telegram_bot_username: process.env.TELEGRAM_BOT_USERNAME || "",
};

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "locket_gold_1month",
    name: "Locket Gold 1 Tháng",
    price: 45000,
    stock: 100,
    api_order_enabled: true,
    description: "Locket Gold 30 ngày",
  },
  {
    id: "locket_gold_3month",
    name: "Locket Gold 3 Tháng",
    price: 120000,
    stock: 80,
    api_order_enabled: true,
  },
  {
    id: "locket_gold_6month",
    name: "Locket Gold 6 Tháng",
    price: 220000,
    stock: 40,
    api_order_enabled: true,
  },
  {
    id: "locket_gold_1year",
    name: "Locket Gold 1 Năm",
    price: 380000,
    stock: 20,
    api_order_enabled: true,
  },
];

async function ensureDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    /* ignore */
  }
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  const key = file;
  if (mem[key] !== undefined) return mem[key] as T;
  await ensureDir();
  const fp = path.join(DATA_DIR, file);
  try {
    const raw = await fs.readFile(fp, "utf8");
    const data = JSON.parse(raw) as T;
    mem[key] = data;
    return data;
  } catch {
    mem[key] = fallback;
    return fallback;
  }
}

async function writeJson<T>(file: string, data: T): Promise<void> {
  mem[file] = data;
  await ensureDir();
  const fp = path.join(DATA_DIR, file);
  try {
    await fs.writeFile(fp, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    console.warn("[store] write failed (ephemeral FS?):", e);
  }
}

// ---- Settings ----
export async function getSettings(): Promise<Settings> {
  const s = await readJson<Partial<Settings>>("settings.json", {});
  return { ...DEFAULT_SETTINGS, ...s };
}

export async function updateSetting<K extends keyof Settings>(
  key: K,
  value: Settings[K]
) {
  const s = await getSettings();
  s[key] = value;
  await writeJson("settings.json", s);
  return s;
}

// ---- Users ----
export async function getAllUsers(): Promise<User[]> {
  return readJson<User[]>("users.json", []);
}

export async function saveUsers(users: User[]) {
  await writeJson("users.json", users);
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

export async function createUser(
  username: string,
  displayName = "",
  extra: Partial<User> = {}
): Promise<User> {
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

export async function getOrCreateUserByZalo(
  zaloId: string,
  displayName: string
): Promise<User> {
  let user = await getUserByZaloId(zaloId);
  if (user) {
    if (displayName && user.displayName !== displayName) {
      await updateUser(user.id, { displayName });
      user = (await getUserById(user.id))!;
    }
    return user;
  }
  const username = "zalo_" + zaloId.slice(0, 12);
  return createUser(username, displayName, { zaloId });
}

export async function getOrCreateUserByTelegram(
  telegramId: string,
  displayName: string,
  telegramUsername?: string
): Promise<User> {
  let user = await getUserByTelegramId(telegramId);
  if (user) {
    await updateUser(user.id, {
      displayName: displayName || user.displayName,
      telegramUsername: telegramUsername || user.telegramUsername,
    });
    return (await getUserById(user.id))!;
  }
  const username = telegramUsername
    ? "tg_" + telegramUsername
    : "tg_" + telegramId;
  return createUser(username, displayName || username, {
    telegramId,
    telegramUsername,
  });
}

// ---- Products ----
export async function getAllProducts(): Promise<Product[]> {
  const list = await readJson<Product[]>("products.json", []);
  if (list.length === 0) {
    await writeJson("products.json", DEFAULT_PRODUCTS);
    return DEFAULT_PRODUCTS;
  }
  return list;
}

export async function getProductById(id: string) {
  return (await getAllProducts()).find((p) => p.id === id) || null;
}

export async function saveProducts(products: Product[]) {
  await writeJson("products.json", products);
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

// ---- CTV prices ----
export async function getCtvPrices(): Promise<CtvPrice[]> {
  return readJson("ctv_prices.json", []);
}

export async function getCtvPrice(userId: number, productId: string) {
  const list = await getCtvPrices();
  const row = list.find((x) => x.userId === userId && x.productId === productId);
  return row ? row.price : null;
}

export async function setCtvPrice(
  userId: number,
  productId: string,
  price: number
) {
  const list = await getCtvPrices();
  const i = list.findIndex(
    (x) => x.userId === userId && x.productId === productId
  );
  if (i >= 0) list[i].price = price;
  else list.push({ userId, productId, price });
  await writeJson("ctv_prices.json", list);
}

export async function getProductEffectivePrice(
  productId: string,
  user: User | null
) {
  const product = await getProductById(productId);
  if (!product) return 0;
  let price = product.price;
  if (user && (user.role === "ctv" || user.role === "admin")) {
    const ctv = await getCtvPrice(user.id, productId);
    if (ctv !== null) price = ctv;
  }
  return price;
}

// ---- Orders ----
export async function getAllOrders(): Promise<Order[]> {
  return readJson("orders.json", []);
}

export async function getOrderById(orderId: string) {
  return (await getAllOrders()).find((o) => o.orderId === orderId) || null;
}

export async function createOrder(
  data: Omit<Order, "createdAt" | "status"> & Partial<Order>
): Promise<Order> {
  const orders = await getAllOrders();
  const order: Order = {
    ...data,
    qty: data.qty ?? 1,
    discountAmount: data.discountAmount ?? 0,
    status: data.status ?? "pending",
    createdAt: data.createdAt ?? new Date().toISOString(),
  } as Order;
  orders.unshift(order);
  await writeJson("orders.json", orders);
  return order;
}

export async function updateOrderStatus(
  orderId: string,
  status: Order["status"]
) {
  const orders = await getAllOrders();
  const i = orders.findIndex((o) => o.orderId === orderId);
  if (i < 0) return null;
  orders[i].status = status;
  await writeJson("orders.json", orders);
  return orders[i];
}

export function generateOrderId() {
  return "LD" + Date.now() + Math.random().toString(36).slice(2, 6).toUpperCase();
}

// ---- Discounts / Giftcodes ----
export async function getAllDiscounts(): Promise<Discount[]> {
  return readJson("discounts.json", []);
}

export async function getDiscount(code: string) {
  const c = code.toLowerCase();
  return (await getAllDiscounts()).find((d) => d.code.toLowerCase() === c) || null;
}

export async function useDiscount(code: string) {
  const list = await getAllDiscounts();
  const i = list.findIndex((d) => d.code.toLowerCase() === code.toLowerCase());
  if (i < 0) return false;
  list[i].used = (list[i].used || 0) + 1;
  await writeJson("discounts.json", list);
  return true;
}

export async function getAllGiftcodes(): Promise<Giftcode[]> {
  return readJson("giftcodes.json", []);
}

export async function getGiftcode(code: string) {
  const c = code.toLowerCase();
  return (await getAllGiftcodes()).find((g) => g.code.toLowerCase() === c) || null;
}

export async function useGiftcode(code: string) {
  const list = await getAllGiftcodes();
  const i = list.findIndex((g) => g.code.toLowerCase() === code.toLowerCase());
  if (i < 0) return false;
  list[i].used = (list[i].used || 0) + 1;
  await writeJson("giftcodes.json", list);
  return true;
}

// ---- Transactions ----
export async function getAllTransactions(): Promise<Transaction[]> {
  return readJson("transactions.json", []);
}

export async function addTransaction(
  data: Omit<Transaction, "id" | "createdAt"> & Partial<Transaction>
) {
  const txs = await getAllTransactions();
  const id = txs.reduce((m, t) => Math.max(m, t.id), 0) + 1;
  const row: Transaction = {
    id,
    createdAt: new Date().toISOString(),
    ...data,
  } as Transaction;
  txs.unshift(row);
  await writeJson("transactions.json", txs);
  return row;
}

export async function addBalance(
  userId: number,
  amount: number,
  type: string,
  note: string
) {
  const user = await getUserById(userId);
  if (!user) return false;
  const newBalance = (user.walletBalance || 0) + amount;
  if (newBalance < 0) return false;
  await updateUserBalance(userId, newBalance);
  await addTransaction({
    userId,
    type,
    amount,
    note,
    balanceAfter: newBalance,
  });
  return true;
}

export async function refundOrder(
  orderId: string,
  userId: number,
  amount: number
) {
  await addBalance(userId, amount, "refund", `Hoàn tiền đơn ${orderId}`);
  await updateOrderStatus(orderId, "refunded");
  return true;
}

// ---- Sessions (Zalo multi-step) ----
export async function getZaloSession(
  zaloId: string
): Promise<ZaloSession | null> {
  const all = await readJson<Record<string, ZaloSession>>("sessions.json", {});
  return all[zaloId] || null;
}

export async function updateZaloSession(zaloId: string, state: ZaloSession) {
  const all = await readJson<Record<string, ZaloSession>>("sessions.json", {});
  all[zaloId] = state;
  await writeJson("sessions.json", all);
}

export async function deleteZaloSession(zaloId: string) {
  const all = await readJson<Record<string, ZaloSession>>("sessions.json", {});
  delete all[zaloId];
  await writeJson("sessions.json", all);
}

// ---- CTV applications ----
export async function getCtvApplications(): Promise<CtvApplication[]> {
  return readJson("ctv_applications.json", []);
}

export async function addCtvApplication(
  app: Omit<CtvApplication, "id" | "status" | "createdAt">
) {
  const list = await getCtvApplications();
  const row: CtvApplication = {
    ...app,
    id: "ctv_" + Date.now().toString(36),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  list.unshift(row);
  await writeJson("ctv_applications.json", list);
  return row;
}

export async function updateCtvApplication(
  id: string,
  status: CtvApplication["status"]
) {
  const list = await getCtvApplications();
  const i = list.findIndex((a) => a.id === id);
  if (i < 0) return null;
  list[i].status = status;
  await writeJson("ctv_applications.json", list);
  return list[i];
}
