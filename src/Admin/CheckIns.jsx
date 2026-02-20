import React, { useEffect, useState, useMemo } from "react";
import {
  getAttendances,
  getAttendanceTimings,
} from "../Api/attendance.api";

import {
  FiClock,
  FiUser,
  FiCalendar,
  FiSearch,
  FiFilter,
  FiCheck,
  FiLogOut,
  FiImage,
  FiChevronDown,
  FiRefreshCw,
  FiTrendingUp,
  FiX,
} from "react-icons/fi";

// ─── Helpers ───────────────────────────────────────────────────────────────
const fmt = (dt) => {
  if (!dt) return null;
  const d = new Date(dt);
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  };
};

const getDurationMinutes = (log) => {
  if (!log.check_in || !log.check_out) return null;
  return Math.round((new Date(log.check_out) - new Date(log.check_in)) / 60000);
};

const formatDuration = (mins) => {
  if (mins == null) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

// ─── Status Badge ──────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = {
    checked_in:  { label: "Checked In",  cls: "bg-emerald-100 text-emerald-700" },
    checked_out: { label: "Checked Out", cls: "bg-blue-100 text-blue-700" },
    absent:      { label: "Absent",      cls: "bg-red-100 text-red-600" },
  };
  const { label, cls } = cfg[status] || { label: status, cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${cls}`}>
      {label}
    </span>
  );
};

// ─── Photo Modal ───────────────────────────────────────────────────────────
const PhotoModal = ({ photos, onClose }) => (
  <div
    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-2xl p-6 max-w-2xl w-11/12 max-h-[80vh] overflow-y-auto shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-5">
        <span className="font-bold text-gray-800 text-base">
          Attendance Photos ({photos.filter((t) => t.photo_url).length})
        </span>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-gray-500 transition-colors"
        >
          <FiX size={16} />
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {photos.map(
          (t) =>
            t.photo_url && (
              <div key={t.id}>
                <img
                  src={t.photo_url}
                  alt="attendance"
                  className="w-full aspect-square object-cover rounded-xl border-2 border-gray-100 hover:scale-105 transition-transform cursor-zoom-in"
                />
                {t.captured_at && (
                  <p className="text-center text-[11px] text-gray-400 mt-1 font-mono">
                    {fmt(t.captured_at)?.time}
                  </p>
                )}
              </div>
            )
        )}
      </div>
    </div>
  </div>
);

// ─── Stat Card ─────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, iconBg, iconColor, borderColor }) => (
  <div
    className={`bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm border-l-4 ${borderColor} hover:-translate-y-0.5 hover:shadow-md transition-all`}
  >
    <div
      className={`w-11 h-11 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}
    >
      {icon}
    </div>
    <div>
      <div className="text-2xl font-bold text-gray-800 leading-none">{value}</div>
      <div className="text-xs text-gray-500 font-medium mt-1">{label}</div>
      {sub && <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  </div>
);

// ─── Row ──────────────────────────────────────────────────────────────────
const AttendanceRow = ({ log, timings, onViewPhotos }) => {
  const ci = fmt(log.check_in);
  const co = fmt(log.check_out);
  const mins = getDurationMinutes(log);
  const dur = log.work_duration || formatDuration(mins);
  const photoCount = timings?.filter((t) => t.photo_url).length || 0;

  return (
    <tr className="border-b border-gray-50 hover:bg-indigo-50/30 transition-colors last:border-0">
      {/* User */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-400 text-white text-xs font-bold flex items-center justify-center shrink-0 font-mono shadow-sm">
            {String(log.user_id).slice(0, 2).toUpperCase()}
          </div>
          <span className="font-mono text-sm text-gray-600 font-medium">#{log.user_id}</span>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusBadge status={log.status} />
      </td>

      {/* Check-in */}
      <td className="px-4 py-3">
        {ci ? (
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-sm font-semibold text-gray-800">{ci.time}</span>
            <span className="text-[11px] text-gray-400">{ci.date}</span>
          </div>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </td>

      {/* Check-out */}
      <td className="px-4 py-3">
        {co ? (
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-sm font-semibold text-gray-800">{co.time}</span>
            <span className="text-[11px] text-gray-400">{co.date}</span>
          </div>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </td>

      {/* Duration */}
      <td className="px-4 py-3">
        {dur ? (
          <div className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1.5 rounded-lg">
            <FiClock size={12} className="text-indigo-500" />
            {dur}
          </div>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </td>

      {/* Photos */}
      <td className="px-4 py-3 text-center">
        {photoCount > 0 ? (
          <button
            onClick={() => onViewPhotos(timings)}
            className="inline-flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-1.5 hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer"
          >
            <div className="flex items-center">
              {timings
                .slice(0, 3)
                .filter((t) => t.photo_url)
                .map((t, i) => (
                  <img
                    key={t.id}
                    src={t.photo_url}
                    alt=""
                    className="w-6 h-6 rounded-md object-cover border-2 border-white"
                    style={{ marginLeft: i > 0 ? "-6px" : 0, zIndex: 3 - i }}
                  />
                ))}
            </div>
            <span className="text-xs font-bold text-indigo-600">{photoCount}</span>
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-gray-300">
            <FiImage size={12} /> None
          </span>
        )}
      </td>
    </tr>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────
const CheckIns = () => {
  const [logs, setLogs] = useState([]);
  const [timingsMap, setTimingsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalPhotos, setModalPhotos] = useState(null);
  const [sortKey, setSortKey] = useState("check_in");
  const [sortDir, setSortDir] = useState("desc");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await getAttendances();
      const list = res.data?.data?.data || [];
      setLogs(list);
      const timingResults = await Promise.all(
        list.map((log) => getAttendanceTimings(log.id))
      );
      const map = {};
      timingResults.forEach((response, i) => {
        map[list[i].id] = response.data?.data?.data || [];
      });
      setTimingsMap(map);
    } catch (err) {
      console.error("Attendance fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const stats = useMemo(() => {
    const total = logs.length;
    const checkedIn = logs.filter((l) => l.status === "checked_in").length;
    const checkedOut = logs.filter((l) => l.status === "checked_out").length;
    const durations = logs.map(getDurationMinutes).filter(Boolean);
    const avgDur = durations.length
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : null;
    return { total, checkedIn, checkedOut, avgDur };
  }, [logs]);

  const filtered = useMemo(() => {
    let arr = [...logs];
    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter((l) => String(l.user_id).toLowerCase().includes(q));
    }
    if (statusFilter !== "all") {
      arr = arr.filter((l) => l.status === statusFilter);
    }
    arr.sort((a, b) => {
      const av = a[sortKey] ? new Date(a[sortKey]) : 0;
      const bv = b[sortKey] ? new Date(b[sortKey]) : 0;
      return sortDir === "asc" ? av - bv : bv - av;
    });
    return arr;
  }, [logs, search, statusFilter, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortIndicator = ({ col }) =>
    sortKey === col ? (
      <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>
    ) : (
      <span className="ml-1 opacity-30">↕</span>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">

      {/* ── Header ── */}
      <header className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <FiCalendar size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Attendance Logs</h1>
            <p className="text-sm text-gray-400 mt-0.5">Track check-ins, check-outs & durations</p>
          </div>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 shadow-sm hover:bg-indigo-500 hover:text-white hover:border-indigo-500 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <FiRefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </header>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<FiUser size={18} />}
          label="Total Records"
          value={stats.total}
          iconBg="bg-indigo-50" iconColor="text-indigo-600" borderColor="border-indigo-500"
        />
        <StatCard
          icon={<FiCheck size={18} />}
          label="Checked In"
          value={stats.checkedIn}
          sub="Currently active"
          iconBg="bg-emerald-50" iconColor="text-emerald-600" borderColor="border-emerald-500"
        />
        <StatCard
          icon={<FiLogOut size={18} />}
          label="Checked Out"
          value={stats.checkedOut}
          sub="Completed today"
          iconBg="bg-amber-50" iconColor="text-amber-600" borderColor="border-amber-500"
        />
        <StatCard
          icon={<FiTrendingUp size={18} />}
          label="Avg Duration"
          value={stats.avgDur ? formatDuration(stats.avgDur) : "—"}
          sub="Per session"
          iconBg="bg-blue-50" iconColor="text-blue-600" borderColor="border-blue-500"
        />
      </div>

      {/* ── Controls ── */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <FiSearch
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-gray-400"
            placeholder="Search by user ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="relative flex items-center">
          <FiFilter size={14} className="absolute left-3.5 text-gray-400 pointer-events-none" />
          <select
            className="appearance-none pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-600 font-medium cursor-pointer outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="checked_in">Checked In</option>
            <option value="checked_out">Checked Out</option>
            <option value="absent">Absent</option>
          </select>
          <FiChevronDown size={14} className="absolute right-3 text-gray-400 pointer-events-none" />
        </div>

        <span className="text-xs text-gray-400 font-semibold ml-auto whitespace-nowrap">
          {filtered.length} record{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-gray-400">
            <div className="w-9 h-9 rounded-full border-[3px] border-gray-200 border-t-indigo-500 animate-spin" />
            <p className="text-sm">Loading attendance data…</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100/80 border-b-2 border-gray-100">
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    User
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th
                    className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap cursor-pointer select-none hover:text-indigo-500 transition-colors"
                    onClick={() => toggleSort("check_in")}
                  >
                    Check-in <SortIndicator col="check_in" />
                  </th>
                  <th
                    className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap cursor-pointer select-none hover:text-indigo-500 transition-colors"
                    onClick={() => toggleSort("check_out")}
                  >
                    Check-out <SortIndicator col="check_out" />
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Duration
                  </th>
                  <th className="px-4 py-3.5 text-center text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Photos
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center text-gray-400">
                      <FiCalendar size={32} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No records match your filters</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((log) => (
                    <AttendanceRow
                      key={log.id}
                      log={log}
                      timings={timingsMap[log.id] || []}
                      onViewPhotos={setModalPhotos}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Photo Modal ── */}
      {modalPhotos && (
        <PhotoModal photos={modalPhotos} onClose={() => setModalPhotos(null)} />
      )}
    </div>
  );
};

export default CheckIns;