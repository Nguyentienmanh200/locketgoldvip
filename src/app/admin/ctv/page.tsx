"use client";

import { useState } from "react";

type App = {
  id: string;
  username: string;
  displayName: string;
  zaloId: string;
  phone: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

const initial: App[] = [
  { id: "1", username: "ctv_minh", displayName: "Nguyễn Văn Minh", zaloId: "zalo.me/minhctv", phone: "0912 345 678", reason: "Có kinh nghiệm bán digital 2 năm.", status: "pending", createdAt: "16/09 10:20" },
  { id: "2", username: "lananh_shop", displayName: "Lê Lan Anh", zaloId: "zalo.me/lananh", phone: "0987 654 321", reason: "Muốn mở rộng kênh bán.", status: "pending", createdAt: "15/09 18:45" },
  { id: "3", username: "hoangpro", displayName: "Trần Hoàng", zaloId: "zalo.me/hoangpro", phone: "0901 111 222", reason: "CTV cũ chuyển sang.", status: "approved", createdAt: "14/09 09:00" },
];

export default function CtvPage() {
  const [apps, setApps] = useState(initial);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const list = filter === "all" ? apps : apps.filter((a) => a.status === filter);
  const setStatus = (id: string, status: "approved" | "rejected") =>
    setApps((p) => p.map((a) => (a.id === id ? { ...a, status } : a)));

  const badge: Record<string, string> = {
    pending: "badge-warning", approved: "badge-success", rejected: "badge-danger",
  };
  const text: Record<string, string> = {
    pending: "Chờ duyệt", approved: "Đã duyệt", rejected: "Từ chối",
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">CTV & Duyệt đăng ký</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">Quản lý cộng tác viên</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Chờ duyệt", n: apps.filter((a) => a.status === "pending").length },
          { label: "Đã duyệt", n: apps.filter((a) => a.status === "approved").length },
          { label: "Từ chối", n: apps.filter((a) => a.status === "rejected").length },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <div className="text-2xl font-semibold">{s.n}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`btn text-xs ${filter === f ? "btn-primary" : "btn-secondary"}`}
          >
            {f === "all" ? "Tất cả" : text[f]}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {list.length === 0 && (
          <div className="card p-10 text-center text-sm text-[var(--text-muted)]">Không có yêu cầu nào</div>
        )}
        {list.map((app) => (
          <div key={app.id} className="card p-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium">{app.displayName}</h3>
                  <span className={`badge ${badge[app.status]}`}>{text[app.status]}</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-[var(--text-secondary)]">
                  <p><span className="text-[var(--text-muted)]">User:</span> @{app.username}</p>
                  <p><span className="text-[var(--text-muted)]">Zalo:</span> {app.zaloId}</p>
                  <p><span className="text-[var(--text-muted)]">SĐT:</span> {app.phone || "—"}</p>
                  <p><span className="text-[var(--text-muted)]">Ngày:</span> {app.createdAt}</p>
                </div>
                {app.reason && (
                  <p className="mt-3 text-sm text-[var(--text-secondary)] bg-[var(--bg)] rounded-lg px-3 py-2 border border-[var(--border)]">
                    {app.reason}
                  </p>
                )}
              </div>
              {app.status === "pending" && (
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setStatus(app.id, "approved")} className="btn btn-success text-xs">
                    Duyệt
                  </button>
                  <button onClick={() => setStatus(app.id, "rejected")} className="btn btn-danger text-xs">
                    Từ chối
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
