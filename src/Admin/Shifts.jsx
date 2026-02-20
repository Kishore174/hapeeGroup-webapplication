import React, { useEffect, useState } from "react";
import {
  getShifts,
  createShift,
  updateShift,
  deleteShift,
} from "../Api/shifts.api";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiClock,
  FiSun,
  FiMoon,
  FiSunrise,
  FiX,
  FiSearch,
  FiAlertTriangle,
} from "react-icons/fi";

const emptyForm = { name: "", start_time: "" };

// ─── Helpers ───────────────────────────────────────────────────────────────
const getShiftMeta = (timeStr) => {
  if (!timeStr) return { label: "—", icon: FiClock, accent: "#94a3b8", bg: "#f8fafc" };
  const [h] = timeStr.split(":").map(Number);
  if (h >= 5 && h < 12)  return { label: "Morning",   icon: FiSunrise, accent: "#f59e0b", bg: "#fffbeb" };
  if (h >= 12 && h < 17) return { label: "Afternoon",  icon: FiSun,    accent: "#3b82f6", bg: "#eff6ff" };
  if (h >= 17 && h < 21) return { label: "Evening",    icon: FiSunrise, accent: "#8b5cf6", bg: "#f5f3ff" };
  return                          { label: "Night",      icon: FiMoon,   accent: "#1e293b", bg: "#f1f5f9" };
};

const fmt12 = (t) => {
  if (!t) return "—";
  const [hRaw, m] = t.split(":");
  const h = parseInt(hRaw, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
};

// ─── Shift Card ────────────────────────────────────────────────────────────
const ShiftCard = ({ shift, onEdit, onDelete, deleting }) => {
  const { label, icon: ShiftIcon, accent, bg } = getShiftMeta(shift.start_time);

  return (
    <div className="bg-white rounded-3xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.09)] transition-all group">
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: bg, color: accent }}
        >
          <ShiftIcon size={20} />
        </div>
        <span
          className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
          style={{ background: bg, color: accent }}
        >
          {label}
        </span>
      </div>

      {/* Name */}
      <h3 className="text-base font-black text-gray-900 leading-tight mb-1">{shift.name}</h3>

      {/* Time */}
      <div className="flex items-center gap-1.5 mb-5">
        <FiClock size={12} className="text-gray-300" />
        <span className="text-sm font-bold" style={{ color: accent }}>
          {fmt12(shift.start_time)}
        </span>
        <span className="text-xs text-gray-300 ml-1">start time</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(shift)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white transition-all"
        >
          <FiEdit2 size={12} /> Edit
        </button>
        <button
          onClick={() => onDelete(shift.id)}
          disabled={deleting === shift.id}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-red-400 bg-red-50 hover:bg-red-500 hover:text-white transition-all disabled:opacity-40"
        >
          {deleting === shift.id
            ? <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
            : <><FiTrash2 size={12} /> Delete</>
          }
        </button>
      </div>
    </div>
  );
};

// ─── Confirm Modal ─────────────────────────────────────────────────────────
const ConfirmModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center">
      <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <FiAlertTriangle size={22} className="text-red-500" />
      </div>
      <h3 className="text-base font-black text-gray-900 mb-1">Delete Shift?</h3>
      <p className="text-sm text-gray-400 mb-5">This action cannot be undone.</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ─── Shift Modal ───────────────────────────────────────────────────────────
const ShiftModal = ({ isEdit, form, setForm, onSubmit, onClose }) => {
  const { icon: PreviewIcon, accent, bg, label } = getShiftMeta(form.start_time);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-black text-gray-900">{isEdit ? "Edit Shift" : "New Shift"}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{isEdit ? "Update shift details" : "Create a new time shift"}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-gray-400 transition-colors"
          >
            <FiX size={15} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
              Shift Name
            </label>
            <input
              className="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              placeholder="e.g. Morning Shift"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
              Start Time
            </label>
            <input
              type="time"
              className="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              required
            />
          </div>

          {/* Live preview */}
          {form.start_time && (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: bg }}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${accent}22`, color: accent }}>
                <PreviewIcon size={15} />
              </div>
              <div>
                <p className="text-xs font-black" style={{ color: accent }}>{label} Shift</p>
                <p className="text-xs text-gray-400">Starts at {fmt12(form.start_time)}</p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all"
            >
              {isEdit ? "Save Changes" : "Create Shift"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main ──────────────────────────────────────────────────────────────────
const Shifts = () => {
  const [shifts, setShifts]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [open, setOpen]           = useState(false);
  const [isEdit, setIsEdit]       = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [deleting, setDeleting]   = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const fetchShifts = async () => {
    try {
      const res  = await getShifts();
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setShifts(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShifts(); }, []);

  const openAdd = () => {
    setIsEdit(false); setCurrentId(null);
    setForm(emptyForm); setOpen(true);
  };

  const openEdit = (shift) => {
    setIsEdit(true); setCurrentId(shift.id);
    setForm({ name: shift.name, start_time: shift.start_time });
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    isEdit ? await updateShift(currentId, form) : await createShift(form);
    setOpen(false);
    fetchShifts();
  };

  const handleDelete = (id) => setConfirmId(id);

  const confirmDelete = async () => {
    setDeleting(confirmId);
    setConfirmId(null);
    await deleteShift(confirmId);
    await fetchShifts();
    setDeleting(null);
  };

  const filtered = shifts.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Group by period
  const groups = {
    Morning:   filtered.filter((s) => { const h = parseInt(s.start_time); return h >= 5 && h < 12; }),
    Afternoon: filtered.filter((s) => { const h = parseInt(s.start_time); return h >= 12 && h < 17; }),
    Evening:   filtered.filter((s) => { const h = parseInt(s.start_time); return h >= 17 && h < 21; }),
    Night:     filtered.filter((s) => { const h = parseInt(s.start_time); return h < 5 || h >= 21; }),
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      {/* ── Top bar ── */}
      <div className="bg-white border-b border-gray-100 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Shifts</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {loading ? "—" : `${shifts.length} shift${shifts.length !== 1 ? "s" : ""} configured`}
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-2xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all"
          >
            <FiPlus size={15} />
            Add Shift
          </button>
        </div>
      </div>

      <div className="px-8 py-6 max-w-7xl">
        {/* Search */}
        <div className="relative max-w-sm mb-6">
          <FiSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
          <input
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-gray-300"
            placeholder="Search shifts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-4 py-20 text-gray-300">
            <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-indigo-500 animate-spin" />
            <p className="text-sm">Loading shifts…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-gray-300">
            <FiClock size={32} className="mb-3 opacity-50" />
            <p className="text-sm">No shifts found</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groups).map(([period, list]) => {
              if (list.length === 0) return null;
              const { icon: PIcon, accent, bg } = getShiftMeta(list[0]?.start_time);
              return (
                <div key={period}>
                  {/* Group label */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: bg, color: accent }}>
                      <PIcon size={13} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest" style={{ color: accent }}>
                      {period}
                    </span>
                    <span className="text-xs text-gray-300 font-semibold">· {list.length}</span>
                    <div className="flex-1 h-px bg-gray-100 ml-1" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {list.map((s) => (
                      <ShiftCard
                        key={s.id}
                        shift={s}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                        deleting={deleting}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {open && (
        <ShiftModal
          isEdit={isEdit}
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          onClose={() => setOpen(false)}
        />
      )}

      {confirmId && (
        <ConfirmModal
          onConfirm={confirmDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
};

export default Shifts;