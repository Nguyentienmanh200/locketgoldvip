export type Role = "user" | "ctv" | "agent" | "admin";

export interface User {
  id: number;
  username: string;
  displayName: string;
  zaloId?: string;
  telegramId?: string;
  telegramUsername?: string;
  passwordHash?: string;
  customPrices?: Record<string, number>;
  walletBalance: number;
  role: Role;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  stock: number; // -1 = unlimited
  api_order_enabled?: boolean;
  api_url?: string;
  api_key?: string;
  isGold?: boolean;
  ctvPrice?: number;
  createdAt?: string;
}

export interface Order {
  orderId: string;
  userId: number;
  productId: string;
  productName: string;
  qty: number;
  customerInput: string;
  price: number;
  discountCode?: string | null;
  discountAmount?: number;
  totalAmount: number;
  status: "pending" | "success" | "failed" | "processing" | "refunded";
  createdAt: string;
  source?: "zalo" | "telegram" | "admin" | "web";
}

export interface Discount {
  code: string;
  value: number;
  type: "percent" | "fixed";
  max_uses: number;
  used: number;
  createdAt?: string;
}

export interface Giftcode {
  code: string;
  reward: number;
  max_uses: number;
  used: number;
  createdAt?: string;
}

export interface Transaction {
  id: number;
  userId: number;
  type: string;
  amount: number;
  note: string;
  balanceAfter: number;
  createdAt: string;
}

export interface CtvPrice {
  userId: number;
  productId: string;
  price: number;
}

export interface CtvApplication {
  id: string;
  username: string;
  displayName: string;
  zaloId: string;
  phone?: string;
  reason?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Settings {
  admin_password: string;
  zalo_bot_token: string;
  zalo_secret_token: string;
  admin_zalo_id: string;
  sepay_api_key: string;
  locket_api_key: string;
  locket_api_base_url: string;
  bank_name: string;
  bank_account: string;
  bank_owner: string;
  bank_code: string;
  telegram_bot_token: string;
  telegram_bot_username: string;
}

export interface ZaloSession {
  step: string;
  productId?: string;
  customerInput?: string;
  price?: number;
  finalPrice?: number;
  discountCode?: string | null;
  discountAmount?: number;
  [key: string]: unknown;
}

export type Collection =
  | "users"
  | "products"
  | "orders"
  | "discounts"
  | "giftcodes"
  | "transactions"
  | "ctv_prices"
  | "ctv_applications"
  | "settings"
  | "sessions";
