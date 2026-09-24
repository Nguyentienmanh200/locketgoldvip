# Locket Gold VIP

Hệ thống bán & kích hoạt **Locket Gold**: cửa hàng khách hàng, đăng nhập Telegram ID, nạp tiền VietQR / Sepay, tra cứu Gold, bot Zalo và khu vực admin.

- **Repo:** [Nguyentienmanh200/locketgoldvip](https://github.com/Nguyentienmanh200/locketgoldvip)
- **Demo / Production:** [https://locketgoldvip-kappa.vercel.app](https://locketgoldvip-kappa.vercel.app)
- **Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · Firebase Firestore · Vercel

---

## Mục lục

1. [Giới thiệu](#1-giới-thiệu)
2. [Tính năng chính](#2-tính-năng-chính)
3. [Cấu trúc thư mục](#3-cấu-trúc-thư-mục)
4. [Chạy local](#4-chạy-local)
5. [Luồng sử dụng](#5-luồng-sử-dụng)
6. [API & Webhook](#6-api--webhook)
7. [Gắn Environment Variables trên Vercel](#7-gắn-environment-variables-trên-vercel)
8. [Danh sách biến môi trường](#8-danh-sách-biến-môi-trường)
9. [Deploy](#9-deploy)
10. [Checklist & lỗi thường gặp](#10-checklist--lỗi-thường-gặp)

---

## 1. Giới thiệu

**Locket Gold VIP** là bản web hiện đại thay cho hệ thống PHP + Zalo bot cũ: khách đăng nhập bằng **Telegram ID**, mua gói Gold, nạp tiền qua QR; dữ liệu user / sản phẩm / đơn hàng lấy từ **Firebase Firestore** (cùng project với app gốc).

Phù hợp khi bạn cần:

- Cửa hàng mobile-friendly, không phụ thuộc giao diện cũ
- Tách **app khách** và **admin** (admin chỉ hiện với tài khoản role admin)
- Tích hợp nạp tự động (Sepay), kích hoạt qua Locket API, bot Zalo (tuỳ cấu hình)

---

## 2. Tính năng chính

### Khách hàng (`/app`)

| Tính năng | Mô tả |
|-----------|--------|
| Đăng ký / Đăng nhập | Telegram ID + mật khẩu (mặc định lần đầu có thể `123456` nếu tạo mới theo luồng login) |
| Cửa hàng | Danh sách sản phẩm từ Firebase, giá CTV / giá riêng nếu có |
| Mua hàng | Số lượng, username Locket (hoặc link `locket.cam/...`), mã giảm giá |
| Tra cứu Gold | Proxy `locketuser.com` qua `/api/customer/check` |
| Đơn hàng | Lịch sử đơn theo Telegram ID |
| Nạp tiền | VietQR + nội dung `NAP {telegramId}` |
| Tài khoản | Đổi mật khẩu, hỗ trợ Telegram/Zalo, đăng xuất |
| Admin trong app | Chỉ hiện khi `role` trên Firebase là `admin` |

### Trang chủ (`/`)

- Giới thiệu ngắn, nút **Đăng nhập** / **Đăng ký** (không còn nút Admin ngoài trang chủ)

### Admin & bot (tuỳ env)

- Đăng nhập admin: `/login` (mật khẩu `ADMIN_PASSWORD`)
- API admin: `/api/admin` (header `x-admin-password`)
- Webhook Zalo: `/api/zalo/webhook`
- Webhook Sepay: `/api/sepay/webhook`

---

## 3. Cấu trúc thư mục

```text
src/
  app/
    page.tsx                 # Trang chủ
    app/page.tsx             # App khách (shop, đơn, nạp, tài khoản)
    login/                   # Đăng nhập admin
    admin/                   # Dashboard admin
    api/
      customer/              # Auth + shop + check Gold
      admin/                 # CRUD / thao tác admin
      zalo/webhook/          # Bot Zalo
      sepay/webhook/         # Nạp tự động
  lib/
    firebase.ts              # Firestore (users, products, orders…)
    locket.ts                # Gọi API kích hoạt Gold
    bank.ts                  # VietQR
    store.ts / db.ts         # Lớp store phụ (GitHub JSON nếu dùng)
```

---

## 4. Chạy local

Yêu cầu: Node.js 18+.

```bash
git clone https://github.com/Nguyentienmanh200/locketgoldvip.git
cd locketgoldvip
npm install
cp .env.example .env.local   # nếu có; hoặc tạo tay các biến mục 8
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # kiểm tra build production
npm start
```

---

## 5. Luồng sử dụng

### Khách

1. Vào trang chủ → **Đăng ký** hoặc **Đăng nhập** (`/app`)
2. Nhập **Telegram ID** + mật khẩu
3. **Cửa hàng** → chọn gói → nhập username Locket → xác nhận (cần đủ số dư)
4. **Nạp tiền** → tạo QR → chuyển khoản đúng nội dung `NAP {telegramId}`
5. Xem **Đơn hàng**, đổi mật khẩu trong **Tài khoản**

### Admin

1. Trên Firebase, user cần có field `role: "admin"`
2. Đăng nhập app bằng Telegram ID đó → tab **Tài khoản** → nút **Admin**
3. Hoặc vào `/login` với `ADMIN_PASSWORD` để dùng khu admin / API

---

## 6. API & Webhook

| Endpoint | Mô tả |
|----------|--------|
| `POST /api/customer/auth` | `login` · `register` · `me` · `change_password` · `logout` |
| `GET /api/customer?action=products` | Danh sách SP (Firebase) |
| `GET /api/customer?action=orders` | Đơn theo session |
| `GET /api/customer?action=qr&amount=` | Tạo VietQR |
| `POST /api/customer` body `action=buy` | Đặt hàng |
| `GET /api/customer/check?u=` | Tra cứu user Locket |
| `GET/POST /api/admin` | Admin (header `x-admin-password`) |
| `POST /api/zalo/webhook` | Bot Zalo |
| `POST /api/sepay/webhook` | Cộng tiền Sepay |

**Webhook gợi ý (đổi domain nếu custom):**

```text
https://locketgoldvip-kappa.vercel.app/api/sepay/webhook
https://locketgoldvip-kappa.vercel.app/api/zalo/webhook
```

---

## 7. Gắn Environment Variables trên Vercel

Biến môi trường chứa API key, mật khẩu, bank… — **không** hard-code trong source. Sau khi gắn hoặc sửa env, **bắt buộc Redeploy**.

### Trên Dashboard

1. Đăng nhập [vercel.com](https://vercel.com) → project **`locketgoldvip`**
2. **Settings** → **Environment Variables**
3. Với mỗi key ở [mục 8](#8-danh-sách-biến-môi-trường):
   - **Key** / **Value**
   - Chọn môi trường: **Production** (nên thêm Preview & Development)
   - **Save**
4. **Deployments** → bản mới nhất → **⋯** → **Redeploy**

### Bằng Vercel CLI (tuỳ chọn)

```bash
npm i -g vercel
vercel login
vercel link
vercel env add ADMIN_PASSWORD production
```

### Bằng API

```bash
curl -X POST "https://api.vercel.com/v10/projects/<PROJECT_ID>/env" \
  -H "Authorization: Bearer <VERCEL_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "ADMIN_PASSWORD",
    "value": "your_password",
    "type": "encrypted",
    "target": ["production", "preview", "development"]
  }'
```

---

## 8. Danh sách biến môi trường

### 8.1. Firebase (bắt buộc cho app khách)

| Key | Mô tả |
|-----|--------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | App ID |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL` | Realtime Database URL |

> `NEXT_PUBLIC_*` lộ phía browser — chỉ dùng config Firebase public, **không** nhét token bot / mật khẩu.

### 8.2. Admin & bank / Sepay

| Key | Ví dụ | Mô tả |
|-----|--------|--------|
| `ADMIN_PASSWORD` | *(đổi khi public)* | Mật khẩu admin API & `/login` |
| `BANK_NAME` | `MB Bank` | Tên NH |
| `BANK_ACCOUNT` | `732377` | STK |
| `BANK_OWNER` | `NGUYEN TIEN MANH` | Chủ TK |
| `BANK_CODE` | `MB` | Mã VietQR |
| `SEPAY_API_KEY` | *(key Sepay)* | Xác thực webhook |

### 8.3. Locket API (kích hoạt Gold)

| Key | Mô tả |
|-----|--------|
| `LOCKET_API_BASE_URL` | Base URL API CTV (không slash cuối) |
| `LOCKET_API_KEY` | API key CTV thật |

### 8.4. Zalo Bot (tuỳ chọn)

| Key | Mô tả |
|-----|--------|
| `ZALO_BOT_TOKEN` | Access token OA |
| `ZALO_SECRET_TOKEN` | Secret verify webhook |
| `ZALO_ADMIN_CHAT_ID` | Chat ID nhận thông báo |

### 8.5. Telegram Widget (tuỳ chọn)

| Key | Mô tả |
|-----|--------|
| `TELEGRAM_BOT_TOKEN` | Token BotFather (verify widget) |
| `TELEGRAM_BOT_USERNAME` | Username bot, không có `@` |

### 8.6. GitHub store phụ (tuỳ chọn)

| Key | Mô tả |
|-----|--------|
| `GITHUB_TOKEN` | PAT quyền `repo` / contents |
| `GITHUB_REPO` | `owner/repo` — ví dụ `Nguyentienmanh200/locketgoldvip` |
| `GITHUB_DATA_BRANCH` | Thường là `main` |

### Mẫu file local (`.env.local`)

```env
ADMIN_PASSWORD=doi_mat_khau_manh

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=

BANK_NAME=MB Bank
BANK_ACCOUNT=
BANK_OWNER=
BANK_CODE=MB
SEPAY_API_KEY=

LOCKET_API_BASE_URL=
LOCKET_API_KEY=

ZALO_BOT_TOKEN=
ZALO_SECRET_TOKEN=
ZALO_ADMIN_CHAT_ID=

GITHUB_TOKEN=
GITHUB_REPO=Nguyentienmanh200/locketgoldvip
GITHUB_DATA_BRANCH=main
```

**Không commit** file chứa secret lên Git.

---

## 9. Deploy

### Tự động (khuyên dùng)

1. Push nhánh `main` lên GitHub  
2. Vercel project đã link repo → tự build & deploy  

### Thủ công

```bash
vercel --prod
```

Hoặc Dashboard → **Deployments** → **Redeploy** sau khi đổi env.

Framework preset: **Next.js**. Build command mặc định: `next build`.

---

## 10. Checklist & lỗi thường gặp

### Checklist

- [ ] Đã gắn đủ Firebase `NEXT_PUBLIC_*` và Redeploy  
- [ ] `/app` đăng nhập / đăng ký bằng Telegram ID  
- [ ] User admin trên Firestore có `role: "admin"` → thấy nút Admin trong app  
- [ ] Bank / Sepay đúng nếu dùng nạp tự động  
- [ ] `LOCKET_API_*` thật nếu cần kích hoạt Gold tự động  
- [ ] Webhook Sepay / Zalo trỏ đúng domain Vercel  

### Lỗi thường gặp

| Hiện tượng | Hướng xử lý |
|------------|-------------|
| Đổi env mà site không đổi | Chưa Redeploy |
| Login / không đọc user | Sai Firebase env hoặc rules Firestore |
| Không có sản phẩm | Collection `products` trống hoặc `isActive != true` |
| QR sai STK / tên | Sai `BANK_*` |
| Sepay không cộng tiền | Sai webhook URL, `SEPAY_API_KEY`, hoặc nội dung CK ≠ `NAP {telegramId}` |
| Mua Gold không kích hoạt | Thiếu / sai `LOCKET_API_BASE_URL` hoặc `LOCKET_API_KEY` |
| Bot Zalo im | Thiếu `ZALO_BOT_TOKEN` hoặc OA chưa cấu hình webhook |

---

## License & liên hệ

Repo private/public theo cấu hình GitHub của owner.  
Hỗ trợ vận hành: cấu hình trong tab **Tài khoản** trên app (Telegram / Zalo admin).

---

*Locket Gold VIP — Next.js trên Vercel · dữ liệu Firebase · cập nhật README khi đổi domain hoặc nhà cung cấp API.*
