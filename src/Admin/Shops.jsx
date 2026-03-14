import React, { useEffect, useState, useMemo } from "react";
import {
  getShops,
  createShop,
  updateShop,
  deleteShop,
} from "../Api/shops.api";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiSearch,
  FiMapPin,
  FiPhone,
  FiUser,
  FiShoppingBag,
  FiAlertTriangle,
  FiX,
} from "react-icons/fi";
import { MdStorefront } from "react-icons/md";

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

// ─── Delete Confirm Modal ──────────────────────────────────────────────────
const DeleteModal = ({ shopName, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-red-50">
        <FiAlertTriangle size={22} className="text-red-500" />
      </div>
      <h3 className="text-base font-black text-gray-900 mb-1">Delete Shop?</h3>
      <p className="text-sm text-gray-400 mb-5">
        <span className="font-semibold text-gray-600">{shopName}</span> will be permanently removed.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors">
          Cancel
        </button>
        <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors">
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ─── Shop Form Modal ───────────────────────────────────────────────────────
const emptyForm = { shop_name: "", address: "", shopkeeper_name: "", phone_no: "", latitude: "", longitude: "" };

const ShopModal = ({ isEdit, form, setForm, onSubmit, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
            <MdStorefront size={20} className="text-indigo-500" />
          </div>
          <h2 className="text-base font-black text-gray-900">
            {isEdit ? "Edit Shop" : "Add New Shop"}
          </h2>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
          <FiX size={14} className="text-gray-500" />
        </button>
      </div>

      <div className="space-y-3">
        {/* Shop Name */}
        <div>
          <label className="text-[11px] font-black uppercase tracking-widest text-gray-300 block mb-1.5">Shop Name</label>
          <div className="relative">
            <FiShoppingBag size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
            <input
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              placeholder="e.g. Sunrise Grocery"
              value={form.shop_name}
              onChange={(e) => setForm({ ...form, shop_name: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="text-[11px] font-black uppercase tracking-widest text-gray-300 block mb-1.5">Address</label>
          <div className="relative">
            <FiMapPin size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
            <input
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              placeholder="e.g. 123 Main Street"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Shopkeeper */}
        <div>
          <label className="text-[11px] font-black uppercase tracking-widest text-gray-300 block mb-1.5">Shopkeeper Name</label>
          <div className="relative">
            <FiUser size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
            <input
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              placeholder="e.g. John Doe"
              value={form.shopkeeper_name}
              onChange={(e) => setForm({ ...form, shopkeeper_name: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="text-[11px] font-black uppercase tracking-widest text-gray-300 block mb-1.5">Phone Number</label>
          <div className="relative">
            <FiPhone size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
            <input
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              placeholder="e.g. +91 98765 43210"
              value={form.phone_no}
              onChange={(e) => setForm({ ...form, phone_no: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Lat / Lng */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-gray-300 block mb-1.5">Latitude</label>
            <input
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              placeholder="28.6139"
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-gray-300 block mb-1.5">Longitude</label>
            <input
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              placeholder="77.2090"
              value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors">
          Cancel
        </button>
        <button
          onClick={onSubmit}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          {isEdit ? "Update Shop" : "Create Shop"}
        </button>
      </div>
    </div>
  </div>
);

// ─── Main ──────────────────────────────────────────────────────────────────
const Shops = () => {
  const [shops, setShops]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]     = useState("");
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10;
  const [open, setOpen]         = useState(false);
  const [isEdit, setIsEdit]     = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [form, setForm]         = useState(emptyForm);

  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }

  const fetchShops = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const res = await getShops();
      setShops(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
      setShops([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchShops(); }, []);

  const filtered = useMemo(() =>
    shops.filter((s) =>
      !search ||
      s.shop_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.shopkeeper_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.address?.toLowerCase().includes(search.toLowerCase())
    ),
    [shops, search]
  );
const totalPages = Math.ceil(filtered.length / itemsPerPage);

const paginatedData = useMemo(() => {
  const start = (currentPage - 1) * itemsPerPage;
  return filtered.slice(start, start + itemsPerPage);
}, [filtered, currentPage]);
  const openAdd = () => { setForm(emptyForm); setIsEdit(false); setOpen(true); };
  const openEdit = (shop) => { setIsEdit(true); setCurrentId(shop.id); setForm(shop); setOpen(true); };

  const handleSubmit = async () => {
    if (isEdit) await updateShop(currentId, form);
    else await createShop(form);
    setOpen(false);
    fetchShops();
  };

  const confirmDelete = async () => {
    await deleteShop(deleteTarget.id);
    setDeleteTarget(null);
    fetchShops();
  };
useEffect(() => {
  setCurrentPage(1);
}, [search]);
  return (
    <div className="min-h-screen bg-[#f8f9fc]">

      {/* ── Top bar ── */}
      <div className="bg-white border-b border-gray-100 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Shops</h1>
            <p className="text-xs text-gray-400 mt-0.5">Manage all registered shop locations</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchShops(true)}
              disabled={refreshing}
              className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-indigo-600 disabled:opacity-40 transition-colors"
            >
              <FiRefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-indigo-200"
            >
              <FiPlus size={15} />
              Add Shop
            </button>
          </div>
        </div>

        {/* Mini stats */}
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <MdStorefront size={13} className="text-indigo-500" />
            <span className="text-xs text-gray-400">Total Shops</span>
            <span className="text-xs font-black text-gray-700">{loading ? "—" : shops.length}</span>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 max-w-7xl">

        {/* ── Search bar ── */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative">
            <FiSearch size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
            <input
              className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 font-medium outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.04)] w-64"
              placeholder="Search shops..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="text-xs text-gray-300 font-semibold ml-auto">
            {filtered.length} shop{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-3xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-300">
              <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-indigo-500 animate-spin" />
              <p className="text-sm">Loading shops…</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Shop","Address","Shopkeeper","Phone","Actions"].map((h) => (
                      <th key={h} className={`px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-300 ${h === "Actions" ? "text-right" : "text-left"}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <MdStorefront size={28} className="mx-auto text-gray-200 mb-3" />
                        <p className="text-sm text-gray-400">No shops found</p>
                      </td>
                    </tr>
                  ) : (
                   paginatedData.map((shop) => (
                      <tr key={shop.id} className="border-b border-gray-50 hover:bg-indigo-50/20 transition-colors last:border-0">

                        {/* Shop Name */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={shop.shop_name} />
                            <p className="text-sm font-bold text-gray-800">{shop.shop_name}</p>
                          </div>
                        </td>

                        {/* Address */}
                        <td className="px-6 py-4 max-w-[200px]">
                          <div className="flex items-center gap-1.5">
                            <FiMapPin size={11} className="text-gray-300 shrink-0" />
                            <p className="text-sm text-gray-500 truncate" title={shop.address}>{shop.address}</p>
                          </div>
                        </td>

                        {/* Shopkeeper */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <FiUser size={11} className="text-gray-300 shrink-0" />
                            <p className="text-sm text-gray-600 font-medium">{shop.shopkeeper_name}</p>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <FiPhone size={11} className="text-gray-300 shrink-0" />
                            <p className="text-sm text-gray-500">{shop.phone_no}</p>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEdit(shop)}
                              className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white flex items-center justify-center transition-all"
                              title="Edit"
                            >
                              <FiEdit2 size={13} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ id: shop.id, name: shop.shop_name })}
                              className="w-8 h-8 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"
                              title="Delete"
                            >
                              <FiTrash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {/* Pagination */}
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

    {/* 5 Page Buttons */}
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
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {open && (
        <ShopModal
          isEdit={isEdit}
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          onClose={() => setOpen(false)}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          shopName={deleteTarget.name}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default Shops;