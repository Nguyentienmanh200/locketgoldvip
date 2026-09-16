import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <AdminSidebar />
      <div className="ml-56 min-h-screen">
        <header className="sticky top-0 z-30 h-14 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md flex items-center justify-between px-6">
          <span className="text-sm text-[var(--text-muted)]">Bảng điều khiển</span>
          <div className="flex items-center gap-3">
            <span className="badge badge-success">Online</span>
            <div className="w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center text-xs font-bold text-black">
              A
            </div>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
