import { getSettings } from "./store";

export async function getBankInfo() {
  const s = await getSettings();
  return {
    bank_name: s.bank_name,
    account: s.bank_account,
    owner: s.bank_owner,
    bank_code: s.bank_code,
  };
}

/** Tạo URL ảnh VietQR */
export async function generateVietQR(amount: number, content: string) {
  const s = await getSettings();
  const clean = content.replace(/[^A-Za-z0-9 _-]/g, "").toUpperCase();
  return (
    `https://img.vietqr.io/image/${s.bank_code}-${s.bank_account}-compact2.png` +
    `?amount=${amount}&addInfo=${encodeURIComponent(clean)}` +
    `&accountName=${encodeURIComponent(s.bank_owner)}`
  );
}
