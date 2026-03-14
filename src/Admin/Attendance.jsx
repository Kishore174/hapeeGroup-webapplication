import React, { useEffect, useState, useMemo } from "react";
import { getAttendances } from "../Api/attendance.api";
import { getUsers } from "../Api/users.api";
import {
  FiCalendar,
  FiUser,
  FiX,
  FiSearch,
  FiClock,
  FiUserCheck,
  FiUserX,
  FiFilter,
  FiChevronDown,
  FiRefreshCw,
} from "react-icons/fi";
import { MdOutlineEventBusy } from "react-icons/md";

// ─── Helpers ───────────────────────────────────────────────────────────────
const getDateStr = (dt) => (dt ? new Date(dt).toISOString().split("T")[0] : "");

const fmtDate = (dt) => {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const fmtTime = (dt) => {
  if (!dt) return null;
  return new Date(dt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

const parseDuration = (dur) => {
  if (!dur) return null;
  const [h, m] = dur.split(":").map(Number);
  const total = h * 60 + m;
  return { display: h > 0 ? `${h}h ${m}m` : `${m}m`, minutes: total };
};

const STATUS = {
  checked_in:  { label: "Checked In",  bg: "bg-blue-50",   text: "text-blue-600",   dot: "bg-blue-500" },
  checked_out: { label: "Checked Out", bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500" },
  leave:       { label: "On Leave",    bg: "bg-amber-50",  text: "text-amber-600",  dot: "bg-amber-500" },
  absent:      { label: "Absent",      bg: "bg-red-50",    text: "text-red-500",    dot: "bg-red-400" },
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
  const cfg = STATUS[status] || { label: status, bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ─── Duration Bar ──────────────────────────────────────────────────────────
const DurationBar = ({ dur }) => {
  const parsed = parseDuration(dur);
  if (!parsed) return <span className="text-gray-300 text-sm">—</span>;
  const pct = Math.min((parsed.minutes / 480) * 100, 100); // 8h = 100%
  return (
    <div className="flex items-center gap-2.5 min-w-[120px]">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-indigo-400 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-bold text-gray-600 whitespace-nowrap">{parsed.display}</span>
    </div>
  );
};

// ─── Main ──────────────────────────────────────────────────────────────────
const Attendance = () => {
  const [records, setRecords] = useState([]);
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [date, setDate]       = useState("");
  const [userId, setUserId]   = useState("");
  const [search, setSearch]   = useState("");
  const [statusFilter, setStatusFilter] = useState("");
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10;
  const fetchData = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const [attRes, userRes] = await Promise.all([getAttendances(), getUsers()]);
      setRecords(attRes.data?.data?.data || []);
      setUsers(userRes.data?.data || []);
    } catch (err) {
      console.error(err);
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

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (date && getDateStr(r.check_in) !== date) return false;
      if (userId && String(r.user_id) !== userId) return false;
      if (statusFilter && r.status !== statusFilter) return false;
      if (search) {
        const name = userMap[r.user_id]?.name?.toLowerCase() || "";
        if (!name.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [records, date, userId, statusFilter, search, userMap]);
const totalPages = Math.ceil(filtered.length / itemsPerPage);

const paginatedData = useMemo(() => {
  const start = (currentPage - 1) * itemsPerPage;
  return filtered.slice(start, start + itemsPerPage);
}, [filtered, currentPage]);
  // Summary stats from filtered
  const summary = useMemo(() => ({
    total:      filtered.length,
    checkedOut: filtered.filter((r) => r.status === "checked_out").length,
    checkedIn:  filtered.filter((r) => r.status === "checked_in").length,
    leave:      filtered.filter((r) => r.status === "leave").length,
  }), [filtered]);

  const hasFilters = date || userId || statusFilter || search;
  const clearAll = () => { setDate(""); setUserId(""); setStatusFilter(""); setSearch(""); };
useEffect(() => {
  setCurrentPage(1);
}, [date, userId, statusFilter, search]);
  return (
    <div className="min-h-screen bg-[#f8f9fc]">

      {/* ── Top bar ── */}
      <div className="bg-white border-b border-gray-100 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Attendance</h1>
            <p className="text-xs text-gray-400 mt-0.5">Full attendance history & records</p>
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

        {/* Summary mini-stats */}
        <div className="flex items-center gap-6 mt-4 flex-wrap">
          {[
            { icon: FiClock,     label: "Total",       value: summary.total,      color: "text-indigo-500" },
            { icon: FiUserCheck, label: "Checked Out", value: summary.checkedOut, color: "text-emerald-500" },
            { icon: FiUserCheck, label: "Checked In",  value: summary.checkedIn,  color: "text-blue-500" },
            { icon: MdOutlineEventBusy, label: "On Leave", value: summary.leave,  color: "text-amber-500" },
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

        {/* ── Filters ── */}
        <div className="bg-white rounded-2xl px-5 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] mb-5">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <FiSearch size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              <input
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-gray-300"
                placeholder="Search by name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Date */}
            <div className="relative">
              <FiCalendar size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              <input
                type="date"
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* User select */}
            <div className="relative">
              <FiUser size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              <FiChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              <select
                className="appearance-none pl-9 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 outline-none focus:border-indigo-400 transition-all cursor-pointer"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              >
                <option value="">All Users</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            {/* Status select */}
            <div className="relative">
              <FiFilter size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              <FiChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              <select
                className="appearance-none pl-9 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 outline-none focus:border-indigo-400 transition-all cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="checked_in">Checked In</option>
                <option value="checked_out">Checked Out</option>
                <option value="leave">On Leave</option>
                <option value="absent">Absent</option>
              </select>
            </div>

            {/* Clear */}
            {hasFilters && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-400 bg-red-50 hover:bg-red-500 hover:text-white transition-all"
              >
                <FiX size={12} /> Clear
              </button>
            )}

            <span className="text-xs text-gray-300 font-semibold ml-auto whitespace-nowrap">
              {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-3xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-300">
              <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-indigo-500 animate-spin" />
              <p className="text-sm">Loading attendance…</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-gray-300">Employee</th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-gray-300">Date</th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-gray-300">Check-in</th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-gray-300">Check-out</th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-gray-300">Status</th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-gray-300">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <FiCalendar size={28} className="mx-auto text-gray-200 mb-3" />
                        <p className="text-sm text-gray-400">No records match your filters</p>
                        {hasFilters && (
                          <button onClick={clearAll} className="mt-2 text-xs text-indigo-500 hover:underline font-semibold">
                            Clear filters
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                  paginatedData.map((r) => {
                      const user = userMap[r.user_id];
                      return (
                        <tr key={r.id} className="border-b border-gray-50 hover:bg-indigo-50/20 transition-colors last:border-0">

                          {/* Employee */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar name={user?.name} />
                              <div>
                                <p className="text-sm font-bold text-gray-800 leading-tight">
                                  {user?.name || `User #${r.user_id}`}
                                </p>
                                <p className="text-[11px] text-gray-400 mt-0.5">{user?.email || ""}</p>
                              </div>
                            </div>
                          </td>

                          {/* Date */}
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-gray-700">{fmtDate(r.check_in)}</span>
                          </td>

                          {/* Check-in */}
                          <td className="px-6 py-4">
                            {fmtTime(r.check_in)
                              ? <span className="font-mono text-sm font-semibold text-gray-700">{fmtTime(r.check_in)}</span>
                              : <span className="text-gray-300">—</span>
                            }
                          </td>

                          {/* Check-out */}
                          <td className="px-6 py-4">
                            {fmtTime(r.check_out)
                              ? <span className="font-mono text-sm font-semibold text-gray-700">{fmtTime(r.check_out)}</span>
                              : <span className="text-gray-300">—</span>
                            }
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <StatusBadge status={r.status} />
                          </td>

                          {/* Duration */}
                          <td className="px-6 py-4">
                            <DurationBar dur={r.work_duration} />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">

  <span className="text-xs text-gray-400 font-medium">
    Showing {(currentPage - 1) * itemsPerPage + 1} –
    {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
  </span>

  <div className="flex items-center gap-1">

    {/* Prev */}
    <button
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((p) => p - 1)}
      className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-40"
    >
      Prev
    </button>

    {/* Only 5 Pages */}
    {(() => {
      const pages = [];
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, currentPage + 2);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages.map((page) => (
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg
            ${currentPage === page
              ? "bg-indigo-500 text-white"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
        >
          {page}
        </button>
      ));
    })()}

    {/* Next */}
    <button
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage((p) => p + 1)}
      className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-40"
    >
      Next
    </button>

  </div>
</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;