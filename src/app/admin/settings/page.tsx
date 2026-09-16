export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Cài đặt hệ thống</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">Zalo Bot · Sepay · Bank · Locket API</p>
      </div>

      <div className="grid gap-4 max-w-2xl">
        <div className="card p-5 space-y-3">
          <h3 className="text-sm font-medium">Zalo Bot</h3>
          <p className="text-xs text-[var(--text-muted)]">
            Webhook URL (dán vào Zalo OA):
          </p>
          <code className="block text-xs bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-[var(--accent)] break-all">
            https://locketgoldvip-nine.vercel.app/api/zalo/webhook
          </code>
          <p className="text-xs text-[var(--text-secondary)]">
            Cần điền <strong>ZALO_BOT_TOKEN</strong> và <strong>ZALO_SECRET_TOKEN</strong> vào Environment Variables trên Vercel.
          </p>
        </div>

        <div className="card p-5 space-y-3">
          <h3 className="text-sm font-medium">Sepay / Ngân hàng</h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Webhook thanh toán: <code className="text-[var(--accent)]">/api/sepay/webhook</code>
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Điền SEPAY_API_KEY, BANK_ACCOUNT, BANK_OWNER trên Vercel Env.
          </p>
        </div>

        <div className="card p-5 space-y-3">
          <h3 className="text-sm font-medium">Locket API</h3>
          <p className="text-xs text-[var(--text-muted)]">
            LOCKET_API_BASE_URL + LOCKET_API_KEY để kích hoạt Gold tự động sau thanh toán.
          </p>
        </div>
      </div>
    </div>
  );
}
