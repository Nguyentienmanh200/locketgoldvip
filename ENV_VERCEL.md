# Hướng dẫn gắn Environment Variables trên Vercel

Tài liệu này giúp bạn cấu hình **toàn bộ key / biến môi trường** cho dự án **Locket Gold VIP** trên Vercel, để website, app khách, Firebase, nạp tiền và bot hoạt động đúng.

Sau khi gắn xong env, **bắt buộc Redeploy** một lần để cấu hình có hiệu lực.

---

## 1. Giới thiệu nhanh

| Mục | Giải thích |
|-----|------------|
| **Env là gì?** | Biến môi trường chứa key API, mật khẩu, cấu hình bank… **không** hard-code trong source. |
| **Vì sao cần?** | Bảo mật hơn, đổi key không phải sửa code, tách môi trường production / preview. |
| **Gắn ở đâu?** | Vercel Dashboard → Project → **Settings** → **Environment Variables**. |
| **Sau khi gắn** | **Deployments** → … trên bản mới nhất → **Redeploy** (hoặc push commit mới). |

Domain hiện tại (tham khảo): `https://locketgoldvip-kappa.vercel.app`

---

## 2. Cách gắn env trên Vercel (chi tiết)

### Bước 1 — Vào project

1. Đăng nhập [https://vercel.com](https://vercel.com)
2. Chọn team / account đúng
3. Mở project **`locketgoldvip`**

### Bước 2 — Mở Environment Variables

1. Tab **Settings**
2. Menu trái chọn **Environment Variables**
3. (Tuỳ UI) có thể thấy **Project Settings → Environment Variables**

### Bước 3 — Thêm từng biến

Với **mỗi** key trong bảng mục 3:

1. **Key** = tên biến (ví dụ `ADMIN_PASSWORD`)
2. **Value** = giá trị thật (không để khoảng trắng thừa)
3. **Environments** — tick cả:
   - Production  
   - Preview  
   - Development  
   (hoặc ít nhất **Production** nếu chỉ chạy live)
4. Bấm **Save**

Lặp lại đến hết danh sách.

### Bước 4 — Redeploy

1. Tab **Deployments**
2. Bản deployment mới nhất → menu **⋯**
3. **Redeploy** → xác nhận  
   *(Không cần “Use existing Build Cache” nếu vừa đổi env quan trọng)*

### Bước 5 — Kiểm tra

- Mở site → **Đăng nhập** app: `/app`
- Admin (nếu có role admin trong Firebase): vào **Tài khoản** → nút **Admin**
- Webhook (khi đã có token):  
  - Zalo: `https://<domain>/api/zalo/webhook`  
  - Sepay: `https://<domain>/api/sepay/webhook`

---

## 3. Danh sách toàn bộ biến môi trường

### 3.1. Bắt buộc / nên có ngay

| Key | Ví dụ / giá trị | Mô tả |
|-----|------------------|--------|
| `ADMIN_PASSWORD` | `admin123` | Mật khẩu gọi API admin (`x-admin-password`) và trang `/login` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSy...` | Firebase API key (public) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `mini-1351d.firebaseapp.com` | Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `mini-1351d` | Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `mini-1351d.firebasestorage.app` | Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `631711542810` | Messaging sender |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:631711542810:web:...` | App ID |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL` | `https://mini-1351d-default-rtdb.firebaseio.com` | Realtime DB URL (nếu dùng) |

> Biến bắt đầu bằng `NEXT_PUBLIC_` sẽ được bundle ra phía trình duyệt — **chỉ** dùng cho config Firebase public, không đặt secret bot/token vào đây.

### 3.2. Ngân hàng & nạp tiền (VietQR + Sepay)

| Key | Ví dụ | Mô tả |
|-----|--------|--------|
| `BANK_NAME` | `MB Bank` | Tên ngân hàng hiển thị |
| `BANK_ACCOUNT` | `732377` | Số tài khoản |
| `BANK_OWNER` | `NGUYEN TIEN MANH` | Chủ tài khoản |
| `BANK_CODE` | `MB` | Mã bank cho VietQR (`img.vietqr.io`) |
| `SEPAY_API_KEY` | `pandagold01` | Key xác thực webhook Sepay |

Nội dung chuyển khoản app dùng dạng: **`NAP {telegramId}`**.

Webhook Sepay (cấu hình trên Sepay):

```text
https://locketgoldvip-kappa.vercel.app/api/sepay/webhook
```

### 3.3. Locket API (kích hoạt Gold)

| Key | Ví dụ | Mô tả |
|-----|--------|--------|
| `LOCKET_API_BASE_URL` | `https://api.example.com` | Base URL API CTV Locket (không slash cuối) |
| `LOCKET_API_KEY` | *(key CTV thật)* | API key / Bearer khi gọi kích hoạt Gold |

Endpoints hệ thống gọi (theo code):

- `POST {BASE}/api/v1/ctv/gold` — kích hoạt  
- `GET {BASE}/api/v1/userinfo` — check user (fallback)  
- Tra cứu UI khách ưu tiên: `locketuser.com` qua `/api/customer/check`

### 3.4. Zalo Bot

| Key | Ví dụ | Mô tả |
|-----|--------|--------|
| `ZALO_BOT_TOKEN` | *(access token OA)* | Token gửi tin nhắn Zalo |
| `ZALO_SECRET_TOKEN` | *(chuỗi bí mật)* | Xác thực header webhook (nếu bật) |
| `ZALO_ADMIN_CHAT_ID` | *(user id admin)* | Chat ID nhận thông báo đơn / nạp |

Webhook Zalo:

```text
https://locketgoldvip-kappa.vercel.app/api/zalo/webhook
```

### 3.5. Telegram (login widget — tuỳ chọn)

| Key | Ví dụ | Mô tả |
|-----|--------|--------|
| `TELEGRAM_BOT_TOKEN` | *(từ BotFather)* | Verify Login Widget |
| `TELEGRAM_BOT_USERNAME` | `TenBot` | Username bot (không có `@`) |

App hiện tại đăng nhập chính bằng **Telegram ID + mật khẩu** (Firebase). Hai biến trên chỉ cần nếu dùng thêm Telegram Login Widget.

### 3.6. GitHub (lưu JSON phụ / store cũ)

| Key | Ví dụ | Mô tả |
|-----|--------|--------|
| `GITHUB_TOKEN` | `ghp_...` | Personal Access Token (repo contents) |
| `GITHUB_REPO` | `Nguyentienmanh200/locketgoldvip` | `owner/repo` |
| `GITHUB_DATA_BRANCH` | `main` | Branch chứa thư mục `data/` |

> Luồng khách **users / products / orders** đang ưu tiên **Firebase**.  
> GitHub `data/*.json` dùng cho lớp store phụ (settings, một số API admin cũ). Vẫn nên gắn đúng token repo hiện tại.

---

## 4. Giá trị mẫu đã dùng trên project (tham chiếu)

Chỉ mang tính **tham chiếu cấu hình hiện có** — production nên đổi mật khẩu / key khi cần:

```env
ADMIN_PASSWORD=admin123

NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=mini-1351d.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=mini-1351d
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=mini-1351d.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=631711542810
NEXT_PUBLIC_FIREBASE_APP_ID=1:631711542810:web:9484d0be6239a8d5fe2ba3
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://mini-1351d-default-rtdb.firebaseio.com

BANK_NAME=MB Bank
BANK_ACCOUNT=732377
BANK_OWNER=NGUYEN TIEN MANH
BANK_CODE=MB
SEPAY_API_KEY=pandagold01

GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_REPO=Nguyentienmanh200/locketgoldvip
GITHUB_DATA_BRANCH=main

# Điền khi có
LOCKET_API_BASE_URL=
LOCKET_API_KEY=
ZALO_BOT_TOKEN=
ZALO_SECRET_TOKEN=
ZALO_ADMIN_CHAT_ID=
TELEGRAM_BOT_TOKEN=
TELEGRAM_BOT_USERNAME=
```

---

## 5. Gắn bằng Vercel CLI (tuỳ chọn)

Cài CLI và đăng nhập:

```bash
npm i -g vercel
vercel login
cd /path/to/locket-gold-secure
vercel link
```

Thêm một biến (production):

```bash
vercel env add ADMIN_PASSWORD production
# dán giá trị khi được hỏi
```

Hoặc dùng API (token Vercel):

```bash
curl -X POST "https://api.vercel.com/v10/projects/<PROJECT_ID>/env" \
  -H "Authorization: Bearer <VERCEL_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "ADMIN_PASSWORD",
    "value": "admin123",
    "type": "encrypted",
    "target": ["production", "preview", "development"]
  }'
```

---

## 6. Checklist sau khi gắn

- [ ] Đã Save đủ biến mục **3.1** và **3.2**
- [ ] Đã Redeploy production
- [ ] `/app` đăng nhập được bằng Telegram ID
- [ ] Tài khoản `role: admin` trên Firebase thấy nút **Admin** trong tab Tài khoản
- [ ] (Nếu dùng) Sepay / Zalo trỏ đúng URL webhook domain Vercel
- [ ] (Nếu dùng) `LOCKET_API_*` đã là key/URL thật — không để placeholder

---

## 7. Lưu ý bảo mật

1. **Không** commit file `.env` chứa secret lên Git public.  
2. Token GitHub / Vercel / Sepay / Zalo coi như mật khẩu — lộ thì **rotate ngay**.  
3. `NEXT_PUBLIC_*` ai cũng xem được trong bundle web — không nhét secret vào đó.  
4. Nên đổi `ADMIN_PASSWORD` mặc định trước khi mở công khai.

---

## 8. Hỗ trợ nhanh lỗi thường gặp

| Hiện tượng | Hướng xử lý |
|------------|-------------|
| Đổi env mà site vẫn cũ | Chưa Redeploy |
| Login app lỗi / không đọc user | Sai `NEXT_PUBLIC_FIREBASE_*` hoặc rules Firestore |
| QR sai STK / tên | Sai `BANK_*` |
| Sepay không cộng tiền | Sai URL webhook, sai `SEPAY_API_KEY`, hoặc nội dung CK không khớp `NAP {telegramId}` |
| Mua Gold không kích hoạt | Chưa điền `LOCKET_API_BASE_URL` / `LOCKET_API_KEY` |
| Bot Zalo không trả lời | Chưa `ZALO_BOT_TOKEN` hoặc webhook OA chưa trỏ đúng |

---

*Tài liệu đi kèm repo `Nguyentienmanh200/locketgoldvip` — cập nhật khi đổi domain hoặc nhà cung cấp API.*
