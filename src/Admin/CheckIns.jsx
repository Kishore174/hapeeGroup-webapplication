import React, { useEffect, useState } from "react";
import { getAttendances } from "../Api/attendance.api";

const CheckIns = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await getAttendances();

      // ✅ Correct response extraction
      const list =
        res.data?.data?.data || [];

      setLogs(list);
    } catch (err) {
      console.error("Attendance fetch error:", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (loading)
    return <div className="p-6">Loading attendance...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">
        Attendance Logs
      </h1>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 text-left">User ID</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Check-in</th>
              <th className="p-3 text-left">Check-out</th>
              <th className="p-3 text-left">Duration</th>
              <th className="p-3 text-center">Photos</th>
            </tr>
          </thead>

          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No attendance records found
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-t">
                  <td className="p-3">{log.user_id}</td>

                  <td className="p-3 capitalize">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        log.status === "checked_in"
                          ? "bg-blue-100 text-blue-700"
                          : log.status === "checked_out"
                          ? "bg-green-100 text-green-700"
                          : log.status === "leave"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {log.status.replace("_", " ")}
                    </span>
                  </td>

                  <td className="p-3">
                    {log.check_in
                      ? new Date(log.check_in).toLocaleString()
                      : "—"}
                  </td>

                  <td className="p-3">
                    {log.check_out
                      ? new Date(log.check_out).toLocaleString()
                      : "—"}
                  </td>

                  <td className="p-3">
                    {log.work_duration || "—"}
                  </td>

                  <td className="p-3 text-center space-x-2">
                    {log.check_in_photo && (
                      <a
                        href={log.check_in_photo}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        In
                      </a>
                    )}
                    {log.check_out_photo && (
                      <a
                        href={log.check_out_photo}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        Out
                      </a>
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

export default CheckIns;
