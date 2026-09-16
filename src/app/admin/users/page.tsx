export default function UsersPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Người dùng</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">Quản lý tài khoản & ví</p>
      </div>
      <div className="card p-10 text-center text-sm text-[var(--text-muted)]">
        Trang user đang được kết nối database. Sẽ hiển thị danh sách user, số dư, role (user/ctv/admin).
      </div>
    </div>
  );
}
