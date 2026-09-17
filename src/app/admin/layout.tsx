import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <AdminSidebar />
      {/* pt-14 on mobile for top bar; ml-56 on desktop for sidebar */}
      <div className="pt-14 lg:pt-0 lg:ml-56 min-h-screen">
        <header className="hidden lg:flex sticky top-0 z-30 h-14 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md items-center justify-between px-6">
          <span className="text-sm text-[var(--text-muted)]">Bảng điều khiển</span>
          <div className="flex items-center gap-3">
            <span className="badge badge-success">Online</span>
            <div className="w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center text-xs font-bold text-black">
              A
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
