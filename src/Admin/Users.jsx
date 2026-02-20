import React, { useEffect, useState } from "react";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../Api/users.api";
import {
  FiPlus,
  FiEdit2,
  FiUserX,
  FiSearch,
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiShield,
  FiUsers,
  FiUserCheck,
  FiChevronDown,
} from "react-icons/fi";

const emptyForm = { name: "", email: "", phone: "", password: "", role: "employee" };

// ─── Avatar ────────────────────────────────────────────────────────────────
const Avatar = ({ name, size = "md" }) => {
  const initials = name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "??";
  const colors = [
    ["#6366f1","#818cf8"], ["#10b981","#34d399"], ["#f59e0b","#fbbf24"],
    ["#3b82f6","#60a5fa"], ["#ec4899","#f472b6"], ["#8b5cf6","#a78bfa"],
  ];
  const [a, b] = colors[initials.charCodeAt(0) % colors.length];
  const sz = size === "md" ? "w-10 h-10 text-sm" : "w-8 h-8 text-xs";
  return (
    <div
      className={`${sz} rounded-2xl font-bold text-white flex items-center justify-center shrink-0 shadow-sm`}
      style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
    >
      {initials}
    </div>
  );
};

// ─── Role Badge ────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => (
  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider
    ${role === "admin" ? "bg-indigo-50 text-indigo-600" : "bg-gray-100 text-gray-500"}`}>
    <FiShield size={9} />
    {role}
  </span>
);

// ─── Status Badge ──────────────────────────────────────────────────────────
const StatusDot = ({ active }) => (
  <div className="flex items-center gap-2">
    <div className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-gray-300"}`} />
    <span className={`text-xs font-semibold ${active ? "text-emerald-600" : "text-gray-400"}`}>
      {active ? "Active" : "Inactive"}
    </span>
  </div>
);

// ─── Input Field ───────────────────────────────────────────────────────────
const Field = ({ icon: Icon, label, children }) => (
  <div>
    <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">{label}</label>
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
        <Icon size={14} />
      </div>
      {React.cloneElement(children, {
        className: `w-full pl-9 pr-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200
          rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
          disabled:opacity-40 disabled:cursor-not-allowed transition-all
          ${children.props.className || ""}`,
      })}
    </div>
  </div>
);

// ─── Modal ─────────────────────────────────────────────────────────────────
const UserModal = ({ isEdit, form, setForm, onSubmit, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
      {/* Modal header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-base font-black text-gray-900">{isEdit ? "Edit User" : "New User"}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{isEdit ? "Update user details" : "Add a team member"}</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-gray-400 transition-colors"
        >
          <FiX size={15} />
        </button>
      </div>

      {/* Modal body */}
      <form onSubmit={onSubmit} className="px-6 py-5 space-y-4">
        <Field icon={FiUser} label="Full Name">
          <input
            placeholder="John Doe"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </Field>

        <Field icon={FiMail} label="Email Address">
          <input
            type="email"
            placeholder="john@company.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            disabled={isEdit}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field icon={FiPhone} label="Phone">
            <input
              placeholder="+1 000 000"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </Field>

          <Field icon={FiLock} label={isEdit ? "New Password" : "Password"}>
            <input
              type="password"
              placeholder={isEdit ? "Optional" : "••••••••"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!isEdit}
            />
          </Field>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Role</label>
          <div className="relative">
            <FiShield size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
            <FiChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
            <select
              className="w-full appearance-none pl-9 pr-9 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
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
            {isEdit ? "Save Changes" : "Create User"}
          </button>
        </div>
      </form>
    </div>
  </div>
);

// ─── Main ──────────────────────────────────────────────────────────────────
const Users = () => {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit]         = useState(false);
  const [currentId, setCurrentId]   = useState(null);
  const [form, setForm]             = useState(emptyForm);
  const [deletingId, setDeletingId] = useState(null);

  const fetchUsers = async () => {
    try {
      const res  = await getUsers();
      const list = Array.isArray(res.data) ? res.data : res.data?.data;
      setUsers(list || []);
    } catch (err) {
      console.error(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openAdd = () => {
    setIsEdit(false); setCurrentId(null);
    setForm(emptyForm); setIsModalOpen(true);
  };

  const openEdit = (user) => {
    setIsEdit(true); setCurrentId(user.id);
    setForm({ name: user.name, email: user.email, phone: user.phone || "", password: "", role: user.role });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (isEdit && !payload.password) delete payload.password;
    isEdit ? await updateUser(currentId, payload) : await createUser(payload);
    setIsModalOpen(false);
    fetchUsers();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Disable this user?")) return;
    setDeletingId(id);
    await deleteUser(id);
    await fetchUsers();
    setDeletingId(null);
  };

  const filtered = users.filter((u) => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) ||
                        u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const total   = users.length;
  const active  = users.filter((u) => u.is_active).length;
  const admins  = users.filter((u) => u.role === "admin").length;

  return (
    <div className="min-h-screen bg-[#f8f9fc]">

      {/* ── Top bar ── */}
      <div className="bg-white border-b border-gray-100 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Users</h1>
            <p className="text-xs text-gray-400 mt-0.5">Manage your team members</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-2xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all"
          >
            <FiPlus size={15} />
            Add User
          </button>
        </div>

        {/* Mini stats */}
        <div className="flex items-center gap-6 mt-4">
          {[
            { icon: FiUsers,     label: "Total",  value: total,  color: "text-indigo-600" },
            { icon: FiUserCheck, label: "Active", value: active, color: "text-emerald-600" },
            { icon: FiShield,    label: "Admins", value: admins, color: "text-amber-600" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon size={14} className={color} />
              <span className="text-xs text-gray-400">{label}</span>
              <span className="text-xs font-black text-gray-700">{loading ? "—" : value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-8 py-6">
        {/* ── Controls ── */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-[220px]">
            <FiSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
            <input
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-gray-300"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="relative">
            <FiShield size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
            <FiChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
            <select
              className="appearance-none pl-9 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 font-medium outline-none focus:border-indigo-400 transition-all cursor-pointer"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <span className="text-xs text-gray-400 font-semibold ml-auto">
            {filtered.length} of {total} users
          </span>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-3xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4 text-gray-300">
              <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-indigo-500 animate-spin" />
              <p className="text-sm">Loading users…</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-gray-300">User</th>
                  <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-gray-300 hidden md:table-cell">Contact</th>
                  <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-gray-300">Role</th>
                  <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-gray-300">Status</th>
                  <th className="px-6 py-4 text-right text-[11px] font-black uppercase tracking-widest text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <FiUsers size={28} className="mx-auto text-gray-200 mb-3" />
                      <p className="text-sm text-gray-400">No users match your search</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-gray-50 hover:bg-indigo-50/20 transition-colors last:border-0"
                    >
                      {/* User cell */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} />
                          <div>
                            <p className="text-sm font-bold text-gray-800 leading-tight">{u.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4 hidden md:table-cell">
                        <p className="text-sm text-gray-500">{u.phone || <span className="text-gray-300">—</span>}</p>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <RoleBadge role={u.role} />
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <StatusDot active={u.is_active} />
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(u)}
                            className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-500 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-all"
                            title="Edit"
                          >
                            <FiEdit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            disabled={deletingId === u.id}
                            className="w-8 h-8 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all disabled:opacity-40"
                            title="Disable"
                          >
                            {deletingId === u.id
                              ? <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                              : <FiUserX size={13} />
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      {isModalOpen && (
        <UserModal
          isEdit={isEdit}
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Users;