"use client";

import { useState } from "react";

type CtvApp = {
  id: string;
  username: string;
  displayName: string;
  zaloId: string;
  phone: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

const initialApps: CtvApp[] = [
  {
    id: "1",
    username: "ctv_minh",
    displayName: "Nguyễn Văn Minh",
    zaloId: "zalo.me/minhctv",
    phone: "0912 345 678",
    reason: "Có kinh nghiệm bán digital product 2 năm, có sẵn 200 khách.",
    status: "pending",
    createdAt: "16/09/2026 10:20",
  },
  {
    id: "2",
    username: "lananh_shop",
    displayName: "Lê Lan Anh",
    zaloId: "zalo.me/lananh",
    phone: "0987 654 321",
    reason: "Muốn mở rộng kênh bán Locket Gold.",
    status: "pending",
    createdAt: "15/09/2026 18:45",
  },
  {
    id: "3",
    username: "hoangpro",
    displayName: "Trần Hoàng",
    zaloId: "zalo.me/hoangpro",
    phone: "0901 111 222",
    reason: "CTV cũ của hệ thống khác, muốn chuyển sang.",
    status: "approved",
    createdAt: "14/09/2026 09:00",
  },
];

export default function CtvPage() {
  const [apps, setApps] = useState(initialApps);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const filtered =
    filter === "all" ? apps : apps.filter((a) => a.status === filter);

  const updateStatus = (id: string, status: "approved" | "rejected") => {
    setApps((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
  };

  const statusBadge: Record<string, string> = {
    pending: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    rejected: "bg-red-500/15 text-red-400 border-red-500/20",
  };
  const statusText: Record<string, string> = {
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    rejected: "Từ chối",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">CTV & Duyệt đăng ký</h1>
        <p className="text-sm text-slate-400 mt-1">
          Quản lý cộng tác viên và phê duyệt yêu cầu đăng ký mới
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Chờ duyệt", count: apps.filter((a) => a.status === "pending").length, color: "text-amber-400" },
          { label: "Đã duyệt", count: apps.filter((a) => a.status === "approved").length, color: "text-emerald-400" },
          { label: "Từ chối", count: apps.filter((a) => a.status === "rejected").length, color: "text-red-400" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition ${
              filter === f
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                : "glass text-slate-400 hover:text-slate-200"
            }`}
          >
            {f === "all" ? "Tất cả" : statusText[f]}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="glass rounded-2xl p-12 text-center text-slate-500 text-sm">
            Không có yêu cầu nào
          </div>
        )}
        {filtered.map((app) => (
          <div key={app.id} className="glass rounded-2xl p-6 card-hover">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-white">{app.displayName}</h3>
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-medium border ${statusBadge[app.status]}`}>
                    {statusText[app.status]}
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1 text-sm text-slate-400">
                  <p>
                    <span className="text-slate-500">Username:</span>{" "}
                    <span className="text-slate-300">@{app.username}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Zalo:</span>{" "}
                    <span className="text-slate-300">{app.zaloId}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">SĐT:</span>{" "}
                    <span className="text-slate-300">{app.phone || "—"}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Ngày gửi:</span>{" "}
                    <span className="text-slate-300">{app.createdAt}</span>
                  </p>
                </div>
                {app.reason && (
                  <p className="mt-3 text-sm text-slate-400 bg-slate-900/50 rounded-xl px-4 py-3 border border-slate-800/50">
                    {app.reason}
                  </p>
                )}
              </div>

              {app.status === "pending" && (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => updateStatus(app.id, "approved")}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition"
                  >
                    ✓ Duyệt
                  </button>
                  <button
                    onClick={() => updateStatus(app.id, "rejected")}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition"
                  >
                    ✕ Từ chối
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
