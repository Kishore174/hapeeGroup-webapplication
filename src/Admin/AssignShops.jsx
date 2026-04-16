import React, { useEffect, useState, useMemo } from "react";
import { getUsers } from "../Api/users.api";
import { getShops } from "../Api/shops.api";
import { axiosInstance } from "../Api/config";
import {
  FiSearch,
  FiX,
  FiCheck,
  FiShoppingBag,
  FiUser,
  FiRefreshCw,
  FiChevronRight,
  FiMapPin,
} from "react-icons/fi";

// ─── Helpers ───────────────────────────────────────────────────────────────
const Avatar = ({ name, size = "md" }) => {
  const initials = name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "??";
  const palettes = [
    ["#6366f1", "#818cf8"], ["#10b981", "#34d399"], ["#f59e0b", "#fbbf24"],
    ["#3b82f6", "#60a5fa"], ["#ec4899", "#f472b6"], ["#8b5cf6", "#a78bfa"],
    ["#14b8a6", "#2dd4bf"], ["#f97316", "#fb923c"],
  ];
  const [a, b] = palettes[initials.charCodeAt(0) % palettes.length];
  const sz = size === "lg" ? "w-12 h-12 text-sm" : "w-10 h-10 text-xs";
  return (
    <div
      className={`${sz} rounded-2xl text-white font-bold flex items-center justify-center shrink-0 shadow-sm`}
      style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
    >
      {initials}
    </div>
  );
};

const ShopBadge = ({ name, onRemove }) => (
  <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-indigo-100">
    <FiShoppingBag size={9} />
    {name}
    {onRemove && (
      <button onClick={onRemove} className="ml-0.5 hover:text-red-500 transition-colors">
        <FiX size={10} />
      </button>
    )}
  </span>
);

// ─── Assign Modal ──────────────────────────────────────────────────────────
const AssignModal = ({ user, shops, onClose, onAssigned }) => {
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingAssigned, setLoadingAssigned] = useState(true);

  useEffect(() => {
    const fetchAssigned = async () => {
      setLoadingAssigned(true);
      try {
        const res = await axiosInstance.get(`/shops/employee/${user.id}`);
        const assigned = res.data?.data || res.data || [];
        setSelected(assigned.map((s) => String(s.id)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAssigned(false);
      }
    };
    fetchAssigned();
  }, [user]);

  const toggle = (id) => {
    const sid = String(id);
    setSelected((prev) =>
      prev.includes(sid) ? prev.filter((s) => s !== sid) : [...prev, sid]
    );
  };

  const filtered = useMemo(() =>
    shops.filter((s) => s.shop_name.toLowerCase().includes(search.toLowerCase())),
    [shops, search]
  );

  const selectedShops = shops.filter((s) => selected.includes(String(s.id)));

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        selected.map((shopId) =>
          axiosInstance.post(`/shops/${shopId}/assign`, { employee_id: user.id })
        )
      );
      onAssigned();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col"
        style={{ height: "min(90vh, 680px)" }}
      >

        {/* ── Header ── */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={user.name} size="lg" />
              <div>
                <h2 className="text-base font-black text-gray-800">{user.name}</h2>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-gray-400 transition-all"
            >
              <FiX size={15} />
            </button>
          </div>
        </div>

        {/* ── Body: Two columns ── */}
        <div className="flex flex-1 min-h-0 divide-x divide-gray-100">

          {/* LEFT — Selected shops panel */}
          <div className="w-[200px] shrink-0 flex flex-col bg-indigo-50/30">
            <div className="px-4 py-3 border-b border-gray-100 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Selected
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  selected.length > 0
                    ? "bg-indigo-100 text-indigo-600"
                    : "bg-gray-100 text-gray-400"
                }`}>
                  {selected.length}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-2">
              {selectedShops.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-300 py-8">
                  <FiShoppingBag size={22} className="opacity-40" />
                  <p className="text-[11px] text-center leading-relaxed">
                    Select shops from the right
                  </p>
                </div>
              ) : (
                selectedShops.map((shop) => (
                  <div
                    key={shop.id}
                    className="flex items-center justify-between gap-1.5 bg-white border border-indigo-100 rounded-xl px-2.5 py-2 mb-1.5 group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-5 h-5 rounded-lg bg-indigo-500 text-white flex items-center justify-center shrink-0">
                        <FiShoppingBag size={9} />
                      </div>
                      <span className="text-[11px] font-bold text-indigo-700 truncate">
                        {shop.shop_name}
                      </span>
                    </div>
                    <button
                      onClick={() => toggle(shop.id)}
                      className="shrink-0 w-4 h-4 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 text-gray-300 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                    >
                      <FiX size={8} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Clear all */}
            {selectedShops.length > 0 && (
              <div className="px-3 pb-3 shrink-0">
                <button
                  onClick={() => setSelected([])}
                  className="w-full py-1.5 rounded-xl text-[11px] font-bold text-red-400 bg-red-50 hover:bg-red-500 hover:text-white border border-red-100 hover:border-red-500 transition-all"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* RIGHT — Shop picker */}
          <div className="flex-1 flex flex-col min-w-0">

            {/* Search */}
            <div className="px-4 py-3 border-b border-gray-100 shrink-0">
              <div className="relative">
                <FiSearch size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search shops…"
                  className="w-full pl-9 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-gray-300"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                  >
                    <FiX size={13} />
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-gray-300 font-semibold">
                  {filtered.length} shop{filtered.length !== 1 ? "s" : ""}
                </span>
                {filtered.length > 0 && (
                  <button
                    onClick={() => {
                      const allIds = filtered.map((s) => String(s.id));
                      const allSelected = allIds.every((id) => selected.includes(id));
                      if (allSelected) {
                        setSelected((prev) => prev.filter((id) => !allIds.includes(id)));
                      } else {
                        setSelected((prev) => [...new Set([...prev, ...allIds])]);
                      }
                    }}
                    className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors"
                  >
                    {filtered.every((s) => selected.includes(String(s.id)))
                      ? "Deselect all"
                      : "Select all"}
                  </button>
                )}
              </div>
            </div>

            {/* Shop list */}
            <div className="flex-1 overflow-y-auto px-3 py-2">
              {loadingAssigned ? (
                <div className="flex items-center justify-center h-full gap-3 text-gray-300">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-indigo-500 animate-spin" />
                  <span className="text-sm">Loading…</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-300 py-8">
                  <FiShoppingBag size={28} className="opacity-40" />
                  <p className="text-sm">No shops found</p>
                </div>
              ) : (
                filtered.map((shop) => {
                  const active = selected.includes(String(shop.id));
                  return (
                    <div
                      key={shop.id}
                      onClick={() => toggle(shop.id)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl mb-1 cursor-pointer transition-all select-none ${
                        active
                          ? "bg-indigo-50 border border-indigo-200"
                          : "hover:bg-gray-50 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                          active ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-400"
                        }`}>
                          <FiShoppingBag size={13} />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-bold truncate transition-colors ${
                            active ? "text-indigo-700" : "text-gray-700"
                          }`}>
                            {shop.shop_name}
                          </p>
                          {shop.address && (
                            <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                              <FiMapPin size={8} /> {shop.address}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ml-2 ${
                        active
                          ? "bg-indigo-500 border-indigo-500 text-white"
                          : "border-gray-200"
                      }`}>
                        {active && <FiCheck size={9} strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex items-center gap-3">
          <div className="flex-1 text-xs text-gray-400">
            {selected.length > 0
              ? <span><span className="font-black text-indigo-600">{selected.length}</span> shop{selected.length !== 1 ? "s" : ""} will be assigned</span>
              : "No shops selected"}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || selected.length === 0}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <FiCheck size={14} strokeWidth={2.5} />
                Save ({selected.length})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── User Card ─────────────────────────────────────────────────────────────
const UserCard = ({ user, assignedShops, onAssign }) => {
  const count = assignedShops.length;
  const initials = user.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "??";
  const palettes = [
    ["#6366f1", "#818cf8"], ["#10b981", "#34d399"], ["#f59e0b", "#fbbf24"],
    ["#3b82f6", "#60a5fa"], ["#ec4899", "#f472b6"], ["#8b5cf6", "#a78bfa"],
    ["#14b8a6", "#2dd4bf"], ["#f97316", "#fb923c"],
  ];
  const [a, b] = palettes[initials.charCodeAt(0) % palettes.length];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden group flex flex-col">

      {/* ── Colored top bar (always visible, color matches avatar) ── */}
      <div
        className="h-1.5 w-full shrink-0"
        style={{ background: `linear-gradient(90deg, ${a}, ${b})` }}
      />

      <div className="p-4 sm:p-5 flex flex-col flex-1 gap-3">

        {/* ── User info row ── */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-sm"
            style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
          >
            {initials}
          </div>

          {/* Name + email */}
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-black text-gray-800 truncate leading-tight">
              {user.name}
            </h2>
            <p className="text-[11px] text-gray-400 truncate mt-0.5">{user.email}</p>
          </div>

          {/* Shop count badge */}
          <div className={`shrink-0 flex flex-col items-center justify-center w-10 h-10 rounded-xl border ${
            count > 0
              ? "bg-emerald-50 border-emerald-100 text-emerald-600"
              : "bg-gray-50 border-gray-100 text-gray-400"
          }`}>
            <span className="text-sm font-black leading-none">{count}</span>
            <span className="text-[9px] font-bold uppercase tracking-wide mt-0.5 leading-none">
              {count === 1 ? "shop" : "shops"}
            </span>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="border-t border-gray-50" />

        {/* ── Assigned shops area ── */}
        <div className="flex-1">
          {count === 0 ? (
            <div className="flex items-center gap-2.5 py-1">
              <div className="w-7 h-7 rounded-lg bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center shrink-0">
                <FiShoppingBag size={12} className="text-gray-300" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400">No shops assigned</p>
                <p className="text-[10px] text-gray-300 mt-0.5">Click below to get started</p>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              {/* Show first 3 as rows */}
              {assignedShops.slice(0, 3).map((shop) => (
                <div
                  key={shop.id}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-indigo-50/70 border border-indigo-100/80"
                >
                  <div className="w-5 h-5 rounded-md bg-indigo-500 text-white flex items-center justify-center shrink-0">
                    <FiShoppingBag size={9} />
                  </div>
                  <span className="text-[11px] font-bold text-indigo-700 truncate flex-1">
                    {shop.shop_name}
                  </span>
                  <FiCheck size={9} className="text-indigo-400 shrink-0" />
                </div>
              ))}

              {/* Overflow badge */}
              {count > 3 && (
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex -space-x-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-3.5 h-3.5 rounded-full border border-white"
                        style={{ background: `linear-gradient(135deg, ${a}99, ${b}99)` }}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-gray-500">
                    +{count - 3} more shop{count - 3 !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Action button ── */}
        <button
          onClick={() => onAssign(user)}
          className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group/btn ${
            count > 0
              ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200"
              : "bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:shadow-sm hover:shadow-indigo-200"
          }`}
        >
          <FiShoppingBag size={13} className="shrink-0" />
          <span className="flex-1 text-left">
            {count > 0 ? "Manage Shops" : "Assign Shops"}
          </span>
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
            count > 0
              ? "bg-white/20 group-hover/btn:bg-white/30"
              : "bg-indigo-100 group-hover/btn:bg-white/20"
          }`}>
            <FiChevronRight
              size={12}
              className="group-hover/btn:translate-x-0.5 transition-transform"
            />
          </div>
        </button>
      </div>
    </div>
  );
};

// ─── Main ──────────────────────────────────────────────────────────────────
const AssignShops = () => {
  const [users, setUsers]           = useState([]);
  const [shops, setShops]           = useState([]);
  const [userShops, setUserShops]   = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState("");

  const fetchUserShops = async (usersList) => {
    try {
      const results = await Promise.all(
        usersList.map(async (u) => {
          try {
            const res = await axiosInstance.get(`/shops/employee/${u.id}`);
            return { userId: u.id, shops: res.data?.data || res.data || [] };
          } catch {
            return { userId: u.id, shops: [] };
          }
        })
      );
      const map = {};
      results.forEach((r) => { map[r.userId] = r.shops; });
      setUserShops(map);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const [uRes, sRes] = await Promise.all([getUsers(), getShops()]);
      const usersList = uRes.data?.data || uRes.data || [];
      setUsers(usersList);
      setShops(sRes.data?.data || sRes.data || []);
      await fetchUserShops(usersList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredUsers = useMemo(() =>
    users.filter((u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    ),
    [users, search]
  );

  // Summary stats
  const totalAssigned = Object.values(userShops).filter((s) => s.length > 0).length;
  const totalUnassigned = users.length - totalAssigned;

  return (
    <div className="min-h-screen bg-[#f8f9fc]">

      {/* ── Top bar ── */}
      <div className="bg-white border-b border-gray-100 px-6 lg:px-8 py-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Assign Shops</h1>
            <p className="text-xs text-gray-400 mt-0.5">Manage shop assignments per employee</p>
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

        {/* Stats row */}
        {!loading && (
          <div className="flex items-center gap-6 mt-4 flex-wrap">
            {[
              { icon: FiUser,        label: "Total employees",  value: users.length,     color: "text-indigo-500" },
              { icon: FiCheck,       label: "Assigned",         value: totalAssigned,    color: "text-emerald-500" },
              { icon: FiShoppingBag, label: "Unassigned",       value: totalUnassigned,  color: "text-amber-500" },
              { icon: FiShoppingBag, label: "Total shops",      value: shops.length,     color: "text-blue-500" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon size={13} className={color} />
                <span className="text-xs text-gray-400">{label}</span>
                <span className="text-xs font-black text-gray-700">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 lg:px-8 py-6">

        {/* ── Search bar ── */}
        <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 mb-5">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <FiSearch size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              <input
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-gray-300"
                placeholder="Search employees by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                >
                  <FiX size={13} />
                </button>
              )}
            </div>
            <span className="text-xs text-gray-300 font-semibold whitespace-nowrap">
              {filteredUsers.length} employee{filteredUsers.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-300">
            <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-indigo-500 animate-spin" />
            <p className="text-sm">Loading employees…</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-300">
            <FiUser size={32} className="mb-3 opacity-50" />
            <p className="text-sm">No employees match your search</p>
            {search && (
              <button onClick={() => setSearch("")} className="mt-2 text-xs text-indigo-500 hover:underline font-semibold">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            {filteredUsers.map((u) => (
              <UserCard
                key={u.id}
                user={u}
                assignedShops={userShops[u.id] || []}
                onAssign={setSelectedUser}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {selectedUser && (
        <AssignModal
          user={selectedUser}
          shops={shops}
          onClose={() => setSelectedUser(null)}
          onAssigned={() => fetchUserShops(users)}
        />
      )}
    </div>
  );
};

export default AssignShops;