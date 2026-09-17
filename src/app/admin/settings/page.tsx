export default function SettingsPage() {
  const webhookBase = "https://locketgoldvip-nine.vercel.app";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold">Cài đặt hệ thống</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          Zalo · Sepay · Locket API · Telegram · Bank
        </p>
      </div>

      <div className="grid gap-4 max-w-2xl">
        <div className="card p-5 space-y-3">
          <h3 className="text-sm font-medium">Zalo Bot Webhook</h3>
          <code className="block text-xs bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-[var(--accent)] break-all">
            {webhookBase}/api/zalo/webhook
          </code>
          <p className="text-xs text-[var(--text-muted)]">
            Env: <b>ZALO_BOT_TOKEN</b>, <b>ZALO_SECRET_TOKEN</b>, <b>ZALO_ADMIN_CHAT_ID</b>
          </p>
        </div>

        <div className="card p-5 space-y-3">
          <h3 className="text-sm font-medium">Sepay Webhook</h3>
          <code className="block text-xs bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-[var(--accent)] break-all">
            {webhookBase}/api/sepay/webhook
          </code>
          <p className="text-xs text-[var(--text-muted)]">
            Env: <b>SEPAY_API_KEY</b> · Nội dung CK: NAP&#123;userId&#125;
          </p>
        </div>

        <div className="card p-5 space-y-3">
          <h3 className="text-sm font-medium">Locket Gold API</h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Endpoints dùng: <code>/api/v1/ctv/gold</code>, <code>/api/v1/userinfo</code>,{" "}
            <code>/api/v1/ctv/me</code>, <code>/api/v1/ctv/orders</code>
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Env: <b>LOCKET_API_BASE_URL</b>, <b>LOCKET_API_KEY</b>
          </p>
        </div>

        <div className="card p-5 space-y-3">
          <h3 className="text-sm font-medium">Telegram Login (khách hàng)</h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Trang khách: <a className="text-[var(--accent)]" href="/customer">/customer</a>
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Env: <b>TELEGRAM_BOT_TOKEN</b>, <b>TELEGRAM_BOT_USERNAME</b>
            <br />
            Domain phải được whitelist trong BotFather → Domain.
          </p>
        </div>

        <div className="card p-5 space-y-3">
          <h3 className="text-sm font-medium">Ngân hàng (VietQR)</h3>
          <p className="text-xs text-[var(--text-muted)]">
            Env: <b>BANK_NAME</b>, <b>BANK_ACCOUNT</b>, <b>BANK_OWNER</b>, <b>BANK_CODE</b>
          </p>
        </div>

        <div className="card p-5 space-y-3">
          <h3 className="text-sm font-medium">Admin</h3>
          <p className="text-xs text-[var(--text-muted)]">
            Env: <b>ADMIN_PASSWORD</b> (mặc định admin123)
          </p>
        </div>
      </div>
    </div>
  );
}
