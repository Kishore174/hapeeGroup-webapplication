import React, { useEffect, useState } from "react";
import { getUsers } from "../Api/users.api";
import { getShops } from "../Api/shops.api";
import { axiosInstance } from "../Api/config";

const AssignShops = () => {
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
const [userShops, setUserShops] = useState({});
const fetchData = async () => {
  try {
    const [uRes, sRes] = await Promise.all([
      getUsers(),
      getShops(),
    ]);

    const usersList = uRes.data?.data || uRes.data || [];
    setUsers(usersList);
    setShops(sRes.data?.data || sRes.data || []);

    // 🔥 NEW
    fetchUserShops(usersList);

  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};
const fetchUserShops = async (usersList) => {
  try {
    const results = await Promise.all(
      usersList.map(async (u) => {
        try {
          const res = await axiosInstance.get(
            `/shops/employee/${u.id}`
          );

          const shops = res.data?.data || res.data || [];

          return { userId: u.id, shops };
        } catch {
          return { userId: u.id, shops: [] };
        }
      })
    );

    const map = {};
    results.forEach((r) => {
      map[r.userId] = r.shops;
    });

    setUserShops(map);
  } catch (err) {
    console.error(err);
  }
};
  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">Assign Shops</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
{users.map((u) => {
  const assigned = userShops[u.id] || [];

  return (
    <div
      key={u.id}
      className="bg-white p-4 rounded-xl shadow"
    >
      <h2 className="font-semibold">{u.name}</h2>
      <p className="text-sm text-gray-400">{u.email}</p>

      {/* ✅ Assigned Shops */}
      <div className="flex flex-wrap gap-2 mt-2">
        {assigned.length === 0 ? (
          <span className="text-xs text-gray-300">
            No shops assigned
          </span>
        ) : (
          assigned.map((shop) => (
            <span
              key={shop.id}
              className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full"
            >
              {shop.shop_name}
            </span>
          ))
        )}
      </div>

      <button
        onClick={() => setSelectedUser(u)}
        className="mt-3 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg"
      >
        Assign Shops
      </button>
    </div>
  );
})}
      </div>

      {selectedUser && (
      <AssignModal
  user={selectedUser}
  shops={shops}
  onClose={() => setSelectedUser(null)}
  onAssigned={() => fetchUserShops(users)}   // ✅ ADD THIS
/>
      )}
    </div>
  );
};

export default AssignShops;
const AssignModal = ({ user, shops, onClose,onAssigned  }) => {
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");

  // 🔥 Load already assigned shops
  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        const res = await axiosInstance.get(
          `/shops/employee/${user.id}`
        );

        const assigned = res.data?.data || res.data || [];

        setSelected(assigned.map((s) => String(s.id)));
      } catch (err) {
        console.error(err);
      }
    };

    fetchAssigned();
    
    
  }, [user]);

  const toggle = (id) => {
    if (selected.includes(String(id))) {
      setSelected(selected.filter((s) => s !== String(id)));
    } else {
      setSelected([...selected, String(id)]);
    }
  };

  const filtered = shops.filter((s) =>
    s.shop_name.toLowerCase().includes(search.toLowerCase())
  );

const handleSave = async () => {
  try {
    await Promise.all(
      selected.map((shopId) =>
        axiosInstance.post(`/shops/${shopId}/assign`, {
          employee_id: user.id,
        })
      )
    );

    alert("Shops assigned successfully");

    onAssigned();   // ✅ REFRESH USER SHOP LIST
    onClose();      // ✅ CLOSE MODAL

  } catch (err) {
    console.error(err);
  }
};
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-5">
        <h2 className="font-bold mb-3">
          Assign Shops → {user.name}
        </h2>

        {/* Selected chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {selected.map((id) => {
            const shop = shops.find((s) => String(s.id) === id);
            if (!shop) return null;

            return (
              <span
                key={id}
                className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full"
              >
                {shop.shop_name}
              </span>
            );
          })}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search shops..."
          className="w-full mb-3 p-2 border rounded-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* List */}
        <div className="max-h-60 overflow-y-auto border rounded-lg">
          {filtered.map((shop) => {
            const active = selected.includes(String(shop.id));

            return (
              <div
                key={shop.id}
                onClick={() => toggle(shop.id)}
                className={`p-2 cursor-pointer flex justify-between ${
                  active ? "bg-indigo-100" : ""
                }`}
              >
                {shop.shop_name}
                {active && "✓"}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};