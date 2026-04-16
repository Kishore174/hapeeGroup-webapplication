import React, { useEffect, useState, useMemo } from "react";
import { getAttendances } from "../Api/attendance.api";
import { getUsers } from "../Api/users.api";
import * as XLSX from "xlsx"; // npm i xlsx
import {
  FiCalendar,
  FiUser,
  FiX,
  FiSearch,
  FiClock,
  FiUserCheck,
  FiFilter,
  FiChevronDown,
  FiRefreshCw,
  FiDownload,
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
  const pct = Math.min((parsed.minutes / 480) * 100, 100);
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

// ─── Export Dialog ─────────────────────────────────────────────────────────
const ExportDialog = ({ onClose, onExport }) => {
  const today = new Date().toISOString().slice(0, 10);
  const [expFrom, setExpFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [expTo, setExpTo] = useState(today);
  const [activeChip, setActiveChip] = useState("last30");

  const setQuick = (preset) => {
    setActiveChip(preset);
    const now = new Date();
    const fmt = (d) => d.toISOString().slice(0, 10);
    let from = new Date(now);
    if (preset === "today")  { /* same day */ }
    else if (preset === "week")   { from.setDate(now.getDate() - now.getDay()); }
    else if (preset === "month")  { from = new Date(now.getFullYear(), now.getMonth(), 1); }
    else if (preset === "last30") { from.setDate(now.getDate() - 30); }
    else if (preset === "last90") { from.setDate(now.getDate() - 90); }
    setExpFrom(fmt(from));
    setExpTo(fmt(now));
  };

  const chips = [
    { key: "today",  label: "Today" },
    { key: "week",   label: "This week" },
    { key: "month",  label: "This month" },
    { key: "last30", label: "Last 30 days" },
    { key: "last90", label: "Last 90 days" },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center">
              <FiDownload size={17} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-800">Export to Excel</h2>
              <p className="text-xs text-gray-400 mt-0.5">Choose a date range</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-gray-400 transition-colors"
          >
            <FiX size={14} />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* Quick chips */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-2">Quick select</p>
            <div className="flex flex-wrap gap-1.5">
              {chips.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setQuick(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    activeChip === key
                      ? "bg-indigo-500 text-white border-indigo-500"
                      : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Date pickers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-1.5 block">
                From
              </label>
              <div className="relative">
                <FiCalendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                <input
                  type="date"
                  value={expFrom}
                  onChange={(e) => { setExpFrom(e.target.value); setActiveChip(""); }}
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-1.5 block">
                To
              </label>
              <div className="relative">
                <FiCalendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                <input
                  type="date"
                  value={expTo}
                  onChange={(e) => { setExpTo(e.target.value); setActiveChip(""); }}
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Info chip */}
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 text-xs">
            <FiCalendar size={12} />
            Exports name, status, check-in, check-out &amp; duration
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => onExport(expFrom, expTo)}
              className="flex-[2] py-2.5 rounded-xl text-sm font-semibold bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-2 transition-all"
            >
              <FiDownload size={14} /> Download Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main ──────────────────────────────────────────────────────────────────
const Attendance = () => {
  const [records, setRecords]       = useState([]);
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [date, setDate]             = useState("");
  const [userId, setUserId]         = useState("");
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage]   = useState(1);
  const [exportOpen, setExportOpen]     = useState(false); // ← new
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

  const summary = useMemo(() => ({
    total:      filtered.length,
    checkedOut: filtered.filter((r) => r.status === "checked_out").length,
    checkedIn:  filtered.filter((r) => r.status === "checked_in").length,
    leave:      filtered.filter((r) => r.status === "leave").length,
  }), [filtered]);

  const hasFilters = date || userId || statusFilter || search;
  const clearAll = () => { setDate(""); setUserId(""); setStatusFilter(""); setSearch(""); };

  useEffect(() => { setCurrentPage(1); }, [date, userId, statusFilter, search]);

  // ─── Export handler ──────────────────────────────────────────────────────
  const handleExport = (from, to) => {
    const range = filtered.filter((r) => {
      const d = getDateStr(r.check_in);
      return d >= from && d <= to;
    });

    const data = range.map((r) => {
      const user = userMap[r.user_id];
      const dur  = parseDuration(r.work_duration);
      return {
        "Name":       user?.name || `User #${r.user_id}`,
        "Email":      user?.email || "",
        "Date":       fmtDate(r.check_in),
        "Check In":   fmtTime(r.check_in)  || "—",
        "Check Out":  fmtTime(r.check_out) || "—",
        "Status":     STATUS[r.status]?.label || r.status,
        "Duration":   dur?.display || "—",
      };
    });

    if (!data.length) {
      alert("No records found for the selected date range.");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(data);

    // Auto column widths
    const colWidths = Object.keys(data[0]).map((key) => ({
      wch: Math.max(key.length, ...data.map((row) => String(row[key] || "").length)) + 2,
    }));
    ws["!cols"] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `attendance_${from}_to_${to}.xlsx`);
    setExportOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc]">

      {/* ── Top bar ── */}
      <div className="bg-white border-b border-gray-100 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Attendance</h1>
            <p className="text-xs text-gray-400 mt-0.5">Full attendance history &amp; records</p>
          </div>

          {/* ── Button row ── */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-indigo-600 disabled:opacity-40 transition-colors"
            >
              <FiRefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>

            {/* Export button */}
            <button
              onClick={() => setExportOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl text-sm font-semibold text-green-700 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all"
            >
              <FiDownload size={14} />
              Export Excel
            </button>
          </div>
        </div>

        {/* Summary mini-stats */}
        <div className="flex items-center gap-6 mt-4 flex-wrap">
          {[
            { icon: FiClock,            label: "Total",       value: summary.total,      color: "text-indigo-500" },
            { icon: FiUserCheck,        label: "Checked Out", value: summary.checkedOut, color: "text-emerald-500" },
            { icon: FiUserCheck,        label: "Checked In",  value: summary.checkedIn,  color: "text-blue-500" },
            { icon: MdOutlineEventBusy, label: "On Leave",    value: summary.leave,      color: "text-amber-500" },
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
            <div className="relative flex-1 min-w-[180px]">
              <FiSearch size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              <input
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-gray-300"
                placeholder="Search by name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="relative">
              <FiCalendar size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              <input
                type="date"
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
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
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-gray-700">{fmtDate(r.check_in)}</span>
                          </td>
                          <td className="px-6 py-4">
                            {fmtTime(r.check_in)
                              ? <span className="font-mono text-sm font-semibold text-gray-700">{fmtTime(r.check_in)}</span>
                              : <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-6 py-4">
                            {fmtTime(r.check_out)
                              ? <span className="font-mono text-sm font-semibold text-gray-700">{fmtTime(r.check_out)}</span>
                              : <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={r.status} />
                          </td>
                          <td className="px-6 py-4">
                            <DurationBar dur={r.work_duration} />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <span className="text-xs text-gray-400 font-medium">
                  Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-40"
                  >
                    Prev
                  </button>
                  {(() => {
                    const pages = [];
                    const start = Math.max(1, currentPage - 2);
                    const end   = Math.min(totalPages, currentPage + 2);
                    for (let i = start; i <= end; i++) pages.push(i);
                    return pages.map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                          currentPage === page
                            ? "bg-indigo-500 text-white"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {page}
                      </button>
                    ));
                  })()}
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

      {/* ── Export Dialog ── */}
      {exportOpen && (
        <ExportDialog
          onClose={() => setExportOpen(false)}
          onExport={handleExport}
        />
      )}
    </div>
  );
};

export default Attendance;