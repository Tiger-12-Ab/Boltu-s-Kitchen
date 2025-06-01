import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { Pencil, Trash2, MoreVertical } from "lucide-react";
import OrderHistoryDashboard from "../components/OrderHistoryDashboard";
import ReviewsDashboard from "../components/ReviewsDashboard";


export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    photo_url: "",
  });
  const [editing, setEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return navigate("/login");
      setUser(session.user);
      fetchData(session.user.id);
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) return navigate("/login");
      setUser(session.user);
      fetchData(session.user.id);
    });

    return () => listener?.subscription.unsubscribe();
  }, [navigate]);

  const fetchData = async (userId) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);
    } catch (err) {
      console.error("Error fetching profile:", err.message);
    }
  };

  const handleUpdate = async () => {
    const updatedProfile = {
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      phone: profile.phone || "",
      address: profile.address || "",
      photo_url: profile.photo_url || "",
    };

    const { error } = await supabase
      .from("users")
      .update(updatedProfile)
      .eq("id", user.id);

    if (error) {
      alert("Failed to save profile.");
    } else {
      alert("Profile saved.");
      setEditing(false);
      fetchData(user.id);
    }
  };

  const handleDeleteUser = async () => {
    if (!window.confirm("Are you sure? This will permanently delete your account.")) return;
    try {
      await supabase.from("users").delete().eq("id", user.id);
      await supabase.auth.signOut();
      alert("Account deleted.");
      navigate("/");
    } catch {
      alert("Failed to delete account.");
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) return alert("Image upload failed.");

    const { data: publicData } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const publicUrl = publicData?.publicUrl;

    const { error: dbError } = await supabase
      .from("users")
      .update({ photo_url: publicUrl })
      .eq("id", user.id);

    if (dbError) return alert("Failed to update profile photo.");
    setProfile({ ...profile, photo_url: publicUrl });
    alert("Photo uploaded and saved.");
  };

  return (
    <div className="bg-cream py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl text-forest font-bold mb-6">
          Welcome back, {profile.first_name || "Admin"}
        </h2>

        {/* Profile Section */}
        <section className="relative bg-cream p-6 mb-8 flex flex-col md:flex-row items-start gap-6">
          {/* Profile photo */}
          <div>
            <img
              src={
                profile.photo_url ||
                "https://gbvubhdzxhqumusfkqmm.supabase.co/storage/v1/object/public/avatars/avatars/user.jpg"
              }
              alt="User"
              className="w-24 h-24 rounded-full object-cover border"
            />
          </div>

          {/* Profile info */}
          <div className="flex-1 w-full relative">
            {/* Three-dot menu */}
            <div className="absolute top-0 right-0">
              <button onClick={() => setShowMenu(!showMenu)}>
                <MoreVertical className="text-charcoal hover:text-orange" />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg z-10">
                  <button
                    onClick={() => {
                      setEditing(true);
                      setShowMenu(false);
                    }}
                    className="flex items-center px-4 py-2 hover:bg-gray-100 w-full"
                  >
                    <Pencil size={16} className="mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteUser}
                    className="flex items-center px-4 py-2 hover:bg-gray-100 w-full text-red-600"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>

            {editing ? (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="mt-2"
                />
                <input
                  type="text"
                  placeholder="First Name"
                  value={profile.first_name}
                  onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                  className="w-full mb-2 p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={profile.last_name}
                  onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                  className="w-full mb-2 p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full mb-2 p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="w-full mb-2 p-2 border rounded"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleUpdate}
                    className="bg-forest hover:bg-orange text-white px-4 py-2 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="bg-gray-400 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p>
                  <strong className="text-forest">Name:</strong> {profile.first_name || "Not set"} {profile.last_name || "Not set"}
                </p>
                <p>
                  <strong className="text-forest">Phone:</strong> {profile.phone || "Not set"}
                </p>
                <p>
                  <strong className="text-forest">Address:</strong> {profile.address || "Not set"}
                </p>
              </div>
            )}

            {/* Admin Action Buttons */}
            <div className="mt-8 flex flex-wrap gap-4 justify-end">
              <button
                className="bg-forest text-white px-4 py-2 rounded-lg shadow hover:bg-orange transition"
                onClick={() => navigate("/dishes")}
              >
                Upload Dishes
              </button>
              <button
                className="bg-forest text-white px-4 py-2 rounded-lg shadow hover:bg-orange transition"
                onClick={() => navigate("/reviews")}
              >
                Manage Reviews
              </button>
              <button
                className="bg-forest text-white px-4 py-2 rounded-lg shadow hover:bg-orange transition"
                onClick={() => navigate("/order")}
              >
                Manage Orders
              </button>
              <button
                className="bg-forest text-white px-4 py-2 rounded-lg shadow hover:bg-orange transition"
                onClick={() => navigate("/users")}
              >
                Manage Users
              </button>
            </div>
          </div>
        </section>
      </div>
      <OrderHistoryDashboard />
      <ReviewsDashboard />
    </div>
  );
}
