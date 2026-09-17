import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCMvRgJOQYGkNIOEnpvtDu3pcZ_WOp1SeE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mini-1351d.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://mini-1351d-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mini-1351d",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mini-1351d.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "631711542810",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:631711542810:web:9484d0be6239a8d5fe2ba3",
};

function getFirebaseApp() {
  if (getApps().length) return getApp();
  return initializeApp(firebaseConfig);
}

export function getDb() {
  return getFirestore(getFirebaseApp());
}

export type FbUser = {
  telegramId: string;
  role?: string;
  walletBalance?: number;
  password?: string;
  displayName?: string;
  customPrices?: Record<string, number>;
  createdAt?: unknown;
};

export type FbProduct = {
  id: string;
  name: string;
  price: number;
  ctvPrice?: number;
  isGold?: boolean;
  isActive?: boolean;
  stock?: number;
  description?: string;
  [key: string]: unknown;
};

export type FbOrder = {
  id: string;
  telegramId?: string;
  orderId?: string;
  productName?: string;
  productId?: string;
  qty?: number;
  totalAmount?: number;
  status?: string;
  customerInput?: string;
  createdAt?: unknown;
  [key: string]: unknown;
};

export async function fbGetUser(telegramId: string): Promise<FbUser | null> {
  const db = getDb();
  const snap = await getDoc(doc(db, "users", String(telegramId)));
  if (!snap.exists()) return null;
  return { telegramId: String(telegramId), ...snap.data() } as FbUser;
}

export async function fbCreateUser(telegramId: string, data: Partial<FbUser> = {}) {
  const db = getDb();
  const payload = {
    telegramId: String(telegramId),
    role: data.role || "customer",
    walletBalance: data.walletBalance ?? 0,
    password: data.password || "123456",
    displayName: data.displayName || "User " + telegramId,
    customPrices: data.customPrices || {},
    createdAt: serverTimestamp(),
  };
  await setDoc(doc(db, "users", String(telegramId)), payload, { merge: true });
  return { ...payload, telegramId: String(telegramId) } as FbUser;
}

export async function fbUpdateUser(telegramId: string, data: Record<string, unknown>) {
  const db = getDb();
  await updateDoc(doc(db, "users", String(telegramId)), data);
}

export async function fbGetProducts(): Promise<FbProduct[]> {
  const db = getDb();
  // isActive == true like original
  try {
    const q = query(collection(db, "products"), where("isActive", "==", true));
    const snap = await getDocs(q);
    const list: FbProduct[] = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() } as FbProduct));
    if (list.length > 0) return list;
  } catch {
    /* fallback all */
  }
  const snap = await getDocs(collection(db, "products"));
  const list: FbProduct[] = [];
  snap.forEach((d) => {
    const data = d.data();
    if (data.isActive === false) return;
    list.push({ id: d.id, ...data } as FbProduct);
  });
  return list;
}

export async function fbGetProduct(id: string): Promise<FbProduct | null> {
  const db = getDb();
  const snap = await getDoc(doc(db, "products", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as FbProduct;
}

export async function fbGetOrders(telegramId: string): Promise<FbOrder[]> {
  const db = getDb();
  try {
    const q = query(
      collection(db, "orders"),
      where("telegramId", "==", String(telegramId))
    );
    const snap = await getDocs(q);
    const list: FbOrder[] = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() } as FbOrder));
    list.sort((a, b) => {
      const ta = (a.createdAt as { seconds?: number })?.seconds || 0;
      const tb = (b.createdAt as { seconds?: number })?.seconds || 0;
      return tb - ta;
    });
    return list;
  } catch {
    return [];
  }
}

export async function fbCreateOrder(data: Record<string, unknown>) {
  const db = getDb();
  const ref = await addDoc(collection(db, "orders"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function fbGetDiscount(code: string) {
  const db = getDb();
  const q = query(collection(db, "discounts"), where("code", "==", code));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

export { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, serverTimestamp };
