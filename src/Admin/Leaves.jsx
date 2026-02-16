import React, { useEffect, useState } from "react";
import { getLeaves, updateLeave } from "../Api/leaves.api";
import { getUsers } from "../Api/users.api";

const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [leaveRes, userRes] = await Promise.all([
        getLeaves(),
        getUsers(),
      ]);

      const leaveList = Array.isArray(leaveRes.data)
        ? leaveRes.data
        : leaveRes.data.data || [];

      const userList = Array.isArray(userRes.data)
        ? userRes.data
        : userRes.data.data || [];

      setLeaves(leaveList);
      setUsers(userList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    if (!window.confirm(`Mark as ${newStatus}?`)) return;
    await updateLeave(id, { status: newStatus });
    fetchData();
  };

  const filtered = leaves.filter((l) =>
    status ? l.status === status : true
  );

  if (loading) return <div className="p-6">Loading leaves...</div>;

  return (
    <div className="p-6">
      {/* Header */}
      <h1 className="text-2xl font-semibold mb-6">Leave Requests</h1>

      {/* Filter */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <select
          className="border p-2 rounded"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">From</th>
              <th className="p-3 text-left">To</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Reason</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500">
                  No leave requests
                </td>
              </tr>
            ) : (
              filtered.map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="p-3">
                    {users.find((u) => u.id === l.user_id)?.name ||
                      l.user_id}
                  </td>
                  <td className="p-3">{l.from_date}</td>
                  <td className="p-3">{l.to_date}</td>
                  <td className="p-3 capitalize">{l.type}</td>
                  <td className="p-3">{l.reason || "—"}</td>
                  <td className="p-3 capitalize">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        l.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : l.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    {l.status === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            handleStatusChange(l.id, "approved")
                          }
                          className="text-green-600 hover:underline"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(l.id, "rejected")
                          }
                          className="text-red-600 hover:underline"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaves;
