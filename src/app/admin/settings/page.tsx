export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Cài đặt hệ thống</h1>
        <p className="text-sm text-slate-400 mt-1">Zalo Bot, Sepay, Bank, Locket API, bảo mật</p>
      </div>
      <div className="glass rounded-2xl p-12 text-center text-slate-500 text-sm">
        Trang settings (API keys, bank info, admin password...) đang được hoàn thiện.
        <br />
        Secrets sẽ chỉ lưu qua Environment Variables trên Vercel.
      </div>
    </div>
  );
}
