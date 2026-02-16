import React, { useEffect, useState, useMemo } from "react";
import { getAttendances } from "../Api/attendance.api";
import { getUsers } from "../Api/users.api";

const Attendance = () => {
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState("");
  const [userId, setUserId] = useState("");

  const fetchData = async () => {
    try {
      const [attRes, userRes] = await Promise.all([
        getAttendances(),
        getUsers(),
      ]);

      // ✅ FIXED RESPONSE EXTRACTION
      const attendanceList =
        attRes.data?.data?.data || [];

      const userList =
        userRes.data?.data || [];

      setRecords(attendanceList);
      setUsers(userList);
    } catch (err) {
      console.error("Attendance fetch error:", err);
      setRecords([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* Build fast user lookup map */
  const userMap = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      map[u.id] = u.name;
    });
    return map;
  }, [users]);

  /* Helpers */
  const getDate = (dt) =>
    dt ? new Date(dt).toISOString().split("T")[0] : "";

  const durationToMinutes = (duration) => {
    if (!duration) return "—";
    const [h, m] = duration.split(":").map(Number);
    return h * 60 + m;
  };

  /* Filtering */
  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (date && getDate(r.check_in) !== date) return false;
      if (userId && String(r.user_id) !== userId) return false;
      return true;
    });
  }, [records, date, userId]);

  if (loading)
    return <div className="p-6">Loading attendance...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">
        Attendance
      </h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4 flex-wrap">
        <input
          type="date"
          className="border p-2 rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        >
          <option value="">All Users</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setDate("");
            setUserId("");
          }}
          className="px-4 py-2 border rounded"
        >
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Working (min)</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  No records found
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">
                    {userMap[r.user_id] || r.user_id}
                  </td>

                  <td className="p-3">
                    {getDate(r.check_in)}
                  </td>

                  <td className="p-3 capitalize">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        r.status === "checked_in"
                          ? "bg-blue-100 text-blue-700"
                          : r.status === "checked_out"
                          ? "bg-green-100 text-green-700"
                          : r.status === "leave"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {r.status.replace("_", " ")}
                    </span>
                  </td>

                  <td className="p-3">
                    {durationToMinutes(r.work_duration)}
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

export default Attendance;
