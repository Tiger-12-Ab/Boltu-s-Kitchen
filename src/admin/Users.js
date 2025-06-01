import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { MoreVertical } from "lucide-react";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("users").select("*");
    if (!error) setUsers(data);
    setLoading(false);
  };

  const handleDeleteUser = async (id) => {
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (!error) {
      setUsers((prev) => prev.filter((user) => user.id !== id));
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="bg-cream min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-forest mb-6 text-center sm:text-left">
          All Users
        </h1>

        {loading ? (
          <p className="text-center text-charcoal">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-center text-charcoal">No users found.</p>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div
                
                className="relative bg-cream p-4 rounded-xl shadow  flex items-center gap-4 group"
              >
                {/* Avatar Image */}
                <div className="flex-shrink-0">
                  <img
                    src={
                      user.photo_url ||
                      "https://gbvubhdzxhqumusfkqmm.supabase.co/storage/v1/object/public/avatars/avatars/user.jpg"
                    }
                    alt="User"
                    className="w-24 h-24 rounded-full object-cover border"
                  />
                </div>

                {/* User Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold text-forest truncate">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-sm text-charcoal truncate">{user.email}</p>
                  <p className="text-sm text-charcoal truncate">
                    Phone: {user.phone || "N/A"}
                  </p>
                  <p className="text-sm text-charcoal truncate">
                    Address: {user.address || "N/A"}
                  </p>
                  <p className="text-sm text-charcoal">Role: {user.role}</p>
                </div>

                {/* 3-dot menu */}
                <div
                  className="relative"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenId(menuOpenId === user.id ? null : user.id);
                  }}
                >
                  <MoreVertical className="text-forest cursor-pointer" />
                  {menuOpenId === user.id && (
                    <div className="absolute right-0 mt-2 bg-white border rounded shadow-md z-10 w-32 text-sm">
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                        onClick={() => {
                          setDeleteConfirmId(user.id);
                          setMenuOpenId(null);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-4">
          <div className="bg-white p-6 rounded-xl shadow max-w-sm w-full space-y-4">
            <h2 className="text-lg font-semibold text-forest">
              Confirm Deletion
            </h2>
            <p className="text-sm text-charcoal">
              Are you sure you want to delete this user?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-1 text-sm bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirmId)}
                className="px-4 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
