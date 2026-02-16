import React, { useEffect, useState } from "react";
import {
  getUsers,
  getAttendance,
  getLeaves,
} from "../Api/dashboard.api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    present: 0,
    absent: 0,
    pendingLeaves: 0,
    todayCheckins: 0,
  });

  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, attRes, leaveRes] =
          await Promise.all([
            getUsers(),
            getAttendance(),
            getLeaves(),
          ]);

        // ✅ Correct parsing
        const users =
          usersRes.data?.data || [];

        const attendance =
          attRes.data?.data?.data || [];

        const leaves =
          leaveRes.data?.data || [];

        // Today's attendance
        const todayAttendance = attendance.filter(
          (a) =>
            a.check_in &&
            a.check_in.startsWith(today)
        );

        setStats({
          users: users.length,

          present: todayAttendance.filter(
            (a) => a.status === "checked_out"
          ).length,

          absent:
            users.length -
            todayAttendance.length,

          pendingLeaves: leaves.filter(
            (l) => l.status === "pending"
          ).length,

          todayCheckins: todayAttendance.length,
        });
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return <div className="p-6">Loading dashboard...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">
        Dashboard
      </h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <Card title="Total Users" value={stats.users} />
        <Card
          title="Present Today"
          value={stats.present}
          color="green"
        />
        <Card
          title="Absent Today"
          value={stats.absent}
          color="red"
        />
        <Card
          title="Pending Leaves"
          value={stats.pendingLeaves}
          color="yellow"
        />
        <Card
          title="Today Check-ins"
          value={stats.todayCheckins}
          color="indigo"
        />
      </div>
    </div>
  );
};

const Card = ({ title, value, color = "gray" }) => {
  const colors = {
    gray: "bg-gray-100 text-gray-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
    indigo: "bg-indigo-100 text-indigo-700",
  };

  return (
    <div className="bg-white shadow rounded-lg p-5">
      <p className="text-sm text-gray-500">
        {title}
      </p>
      <p
        className={`mt-2 text-3xl font-semibold ${colors[color]} px-3 py-1 rounded inline-block`}
      >
        {value}
      </p>
    </div>
  );
};

export default Dashboard;
