import React, { useEffect, useState, useMemo } from "react";
import { getLeaves, updateLeave } from "../Api/leaves.api";
import { getUsers } from "../Api/users.api";
import {
  FiCheck,
  FiX,
  FiChevronDown,
  FiFilter,
  FiCalendar,
  FiRefreshCw,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
} from "react-icons/fi";
import { MdOutlineEventBusy } from "react-icons/md";

// ─── Helpers ───────────────────────────────────────────────────────────────
const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const daysBetween = (from, to) => {
  if (!from || !to) return null;
  const diff = new Date(to) - new Date(from);
  return Math.round(diff / 86400000) + 1;
};

const LEAVE_TYPE = {
  sick:       { label: "Sick",       color: "#ef4444", bg: "#fef2f2" },
  casual:     { label: "Casual",     color: "#3b82f6", bg: "#eff6ff" },
  annual:     { label: "Annual",     color: "#8b5cf6", bg: "#f5f3ff" },
  maternity:  { label: "Maternity",  color: "#ec4899", bg: "#fdf2f8" },
  paternity:  { label: "Paternity",  color: "#0891b2", bg: "#ecfeff" },
  unpaid:     { label: "Unpaid",     color: "#78716c", bg: "#f5f5f4" },
};

const STATUS_CFG = {
  pending:  { label: "Pending",  bg: "bg-amber-50",   text: "text-amber-600",  dot: "bg-amber-400",  icon: FiClock },
  approved: { label: "Approved", bg: "bg-emerald-50", text: "text-emerald-600",dot: "bg-emerald-500", icon: FiCheckCircle },
  rejected: { label: "Rejected", bg: "bg-red-50",     text: "text-red-500",    dot: "bg-red-400",    icon: FiXCircle },
};

// ─── Avatar ────────────────────────────────────────────────────────────────
const Avatar = ({ name }) => {
  const initials = name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "??";
  const palettes = [
    ["#6366f1","#818cf8"],["#10b981","#34d399"],["#f59e0b","#fbbf24"],
    ["#3b82f6","#60a5fa"],["#ec4899","#f472b6"],["#8b5cf6","#a78bfa"],
  ];
  const [a, b] = palettes[initials.charCodeAt(0) % palettes.length];
  return (
    <div
      className="w-9 h-9 rounded-2xl text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-sm"
      style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
    >
      {initials}
    </div>
  );
};

// ─── Status Badge ──────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status] || { label: status, bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ─── Leave Type Chip ───────────────────────────────────────────────────────
const TypeChip = ({ type }) => {
  const cfg = LEAVE_TYPE[type] || { label: type, color: "#6b7280", bg: "#f3f4f6" };
  return (
    <span
      className="text-[11px] font-bold px-2.5 py-1 rounded-full capitalize"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
};

// ─── Confirm Modal ─────────────────────────────────────────────────────────
const ConfirmModal = ({ action, name, onConfirm, onCancel }) => {
  const isApprove = action === "approved";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isApprove ? "bg-emerald-50" : "bg-red-50"}`}>
          {isApprove
            ? <FiCheck size={22} className="text-emerald-500" />
            : <FiAlertTriangle size={22} className="text-red-500" />
          }
        </div>
        <h3 className="text-base font-black text-gray-900 mb-1">
          {isApprove ? "Approve Leave?" : "Reject Leave?"}
        </h3>
        <p className="text-sm text-gray-400 mb-5">
          {isApprove
            ? `This will approve ${name}'s leave request.`
            : `This will reject ${name}'s leave request.`
          }
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors
              ${isApprove ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"}`}
          >
            {isApprove ? "Approve" : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main ──────────────────────────────────────────────────────────────────
const Leaves = () => {
  const [leaves, setLeaves]       = useState([]);
  const [users, setUsers]         = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating]   = useState(null);
  const [confirm, setConfirm]     = useState(null); // { id, action, name }

  const fetchData = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const [leaveRes, userRes] = await Promise.all([getLeaves(), getUsers()]);
      setLeaves(Array.isArray(leaveRes.data) ? leaveRes.data : leaveRes.data?.data || []);
      setUsers(Array.isArray(userRes.data) ? userRes.data : userRes.data?.data || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const userMap = useMemo(() => {
    const m = {};
    users.forEach((u) => { m[u.id] = u; });
    return m;
  }, [users]);

  const filtered = useMemo(() =>
    leaves.filter((l) => (statusFilter ? l.status === statusFilter : true)),
    [leaves, statusFilter]
  );

  const stats = useMemo(() => ({
    total:    leaves.length,
    pending:  leaves.filter((l) => l.status === "pending").length,
    approved: leaves.filter((l) => l.status === "approved").length,
    rejected: leaves.filter((l) => l.status === "rejected").length,
  }), [leaves]);

  const triggerAction = (id, action, name) => setConfirm({ id, action, name });

  const confirmAction = async () => {
    const { id, action } = confirm;
    setConfirm(null);
    setUpdating(id);
    await updateLeave(id, { status: action });
    await fetchData();
    setUpdating(null);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc]">

      {/* ── Top bar ── */}
      <div className="bg-white border-b border-gray-100 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Leave Requests</h1>
            <p className="text-xs text-gray-400 mt-0.5">Review and manage employee leave</p>
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-indigo-600 disabled:opacity-40 transition-colors"
          >
            <FiRefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Mini stats */}
        <div className="flex items-center gap-6 mt-4 flex-wrap">
          {[
            { icon: MdOutlineEventBusy, label: "Total",    value: stats.total,    color: "text-indigo-500" },
            { icon: FiClock,            label: "Pending",  value: stats.pending,  color: "text-amber-500" },
            { icon: FiCheckCircle,      label: "Approved", value: stats.approved, color: "text-emerald-500" },
            { icon: FiXCircle,          label: "Rejected", value: stats.rejected, color: "text-red-400" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon size={13} className={color} />
              <span className="text-xs text-gray-400">{label}</span>
              <span className="text-xs font-black text-gray-700">{loading ? "—" : value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-8 py-6 max-w-7xl">

        {/* ── Filter bar ── */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative">
            <FiFilter size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
            <FiChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
            <select
              className="appearance-none pl-9 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 font-medium outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Pending alert pill */}
          {stats.pending > 0 && !statusFilter && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-bold text-amber-600">
                {stats.pending} pending review
              </span>
            </div>
          )}

          <span className="text-xs text-gray-300 font-semibold ml-auto">
            {filtered.length} request{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-3xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-300">
              <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-indigo-500 animate-spin" />
              <p className="text-sm">Loading leave requests…</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Employee","Duration","Dates","Type","Reason","Status","Action"].map((h) => (
                      <th key={h} className={`px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-300 ${h === "Action" ? "text-right" : "text-left"}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <MdOutlineEventBusy size={28} className="mx-auto text-gray-200 mb-3" />
                        <p className="text-sm text-gray-400">No leave requests found</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((l) => {
                      const user = userMap[l.user_id];
                      const days = daysBetween(l.from_date, l.to_date);
                      const isUpdating = updating === l.id;

                      return (
                        <tr key={l.id} className="border-b border-gray-50 hover:bg-indigo-50/20 transition-colors last:border-0">

                          {/* Employee */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar name={user?.name} />
                              <div>
                                <p className="text-sm font-bold text-gray-800 leading-tight">
                                  {user?.name || `User #${l.user_id}`}
                                </p>
                                <p className="text-[11px] text-gray-400 mt-0.5">{user?.email || ""}</p>
                              </div>
                            </div>
                          </td>

                          {/* Duration */}
                          <td className="px-6 py-4">
                            {days != null ? (
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-gray-800">{days}</span>
                                <span className="text-[11px] text-gray-400">day{days !== 1 ? "s" : ""}</span>
                              </div>
                            ) : <span className="text-gray-300">—</span>}
                          </td>

                          {/* Dates */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5">
                                <FiCalendar size={11} className="text-gray-300" />
                                <span className="text-xs text-gray-600 font-medium">{fmtDate(l.from_date)}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <FiCalendar size={11} className="text-gray-300" />
                                <span className="text-xs text-gray-600 font-medium">{fmtDate(l.to_date)}</span>
                              </div>
                            </div>
                          </td>

                          {/* Type */}
                          <td className="px-6 py-4">
                            <TypeChip type={l.type} />
                          </td>

                          {/* Reason */}
                          <td className="px-6 py-4 max-w-[180px]">
                            <p className="text-sm text-gray-500 truncate" title={l.reason}>
                              {l.reason || <span className="text-gray-300">—</span>}
                            </p>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <StatusBadge status={l.status} />
                          </td>

                          {/* Action */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              {isUpdating ? (
                                <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
                              ) : l.status === "pending" ? (
                                <>
                                  <button
                                    onClick={() => triggerAction(l.id, "approved", user?.name || `User #${l.user_id}`)}
                                    className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all"
                                    title="Approve"
                                  >
                                    <FiCheck size={14} />
                                  </button>
                                  <button
                                    onClick={() => triggerAction(l.id, "rejected", user?.name || `User #${l.user_id}`)}
                                    className="w-8 h-8 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"
                                    title="Reject"
                                  >
                                    <FiX size={14} />
                                  </button>
                                </>
                              ) : (
                                <span className="text-xs text-gray-300 font-medium">—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Confirm Modal ── */}
      {confirm && (
        <ConfirmModal
          action={confirm.action}
          name={confirm.name}
          onConfirm={confirmAction}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
};

export default Leaves;