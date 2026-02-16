import React, { useEffect, useState } from "react";
import {
  getShifts,
  createShift,
  updateShift,
  deleteShift,
} from "../Api/shifts.api";

const emptyForm = {
  name: "",
  start_time: "",
};

const Shifts = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchShifts = async () => {
    try {
      const res = await getShifts();
      const list = Array.isArray(res.data)
        ? res.data
        : res.data.data || [];
      setShifts(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const openAdd = () => {
    setIsEdit(false);
    setCurrentId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (shift) => {
    setIsEdit(true);
    setCurrentId(shift.id);
setForm({
  name: shift.name,
  start_time: shift.start_time,
});
;
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    isEdit
      ? await updateShift(currentId, form)
      : await createShift(form);

    setOpen(false);
    fetchShifts();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this shift?")) return;
    await deleteShift(id);
    fetchShifts();
  };

  if (loading) return <div className="p-6">Loading shifts...</div>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Shifts</h1>
        <button
          onClick={openAdd}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          + Add Shift
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
<thead className="bg-gray-100 text-gray-600">
  <tr>
    <th className="p-3 text-left">Name</th>
    <th className="p-3 text-left">Start</th>
    <th className="p-3 text-right">Actions</th>
  </tr>
</thead>


          <tbody>
            {shifts.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No shifts found
                </td>
              </tr>
            ) : (
              shifts.map((s) => (
<tr key={s.id} className="border-t">
  <td className="p-3">{s.name}</td>
  <td className="p-3">{s.start_time}</td>
  <td className="p-3 text-right space-x-3">
    <button
      onClick={() => openEdit(s)}
      className="text-indigo-600 hover:underline"
    >
      Edit
    </button>
    <button
      onClick={() => handleDelete(s.id)}
      className="text-red-600 hover:underline"
    >
      Delete
    </button>
  </td>
</tr>

              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white w-full max-w-md p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">
              {isEdit ? "Edit Shift" : "Add Shift"}
            </h2>

<form onSubmit={handleSubmit} className="space-y-4">
  <input
    className="w-full border p-2 rounded"
    placeholder="Shift Name"
    value={form.name}
    onChange={(e) =>
      setForm({ ...form, name: e.target.value })
    }
    required
  />

  <input
    type="time"
    className="w-full border p-2 rounded"
    value={form.start_time}
    onChange={(e) =>
      setForm({ ...form, start_time: e.target.value })
    }
    required
  />

  <div className="flex justify-end gap-3 pt-4">
    <button
      type="button"
      onClick={() => setOpen(false)}
      className="border px-4 py-2 rounded"
    >
      Cancel
    </button>
    <button
      type="submit"
      className="bg-indigo-600 text-white px-4 py-2 rounded"
    >
      {isEdit ? "Update" : "Create"}
    </button>
  </div>
</form>

          </div>
        </div>
      )}
    </div>
  );
};

export default Shifts;
