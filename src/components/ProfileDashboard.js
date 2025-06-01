import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { Pencil, Trash2, MoreVertical } from "lucide-react";

export default function ProfileDashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    photo_url: "",
    email: "",
  });
  const [showMenu, setShowMenu] = useState(false);
  const [dishes, setDishes] = useState([]);
  const [selectedDish, setSelectedDish] = useState("");
  const [rating, setRating] = useState(0);
  const [newReview, setNewReview] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

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

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session?.user) return navigate("/login");
        setUser(session.user);
        fetchData(session.user.id);
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [navigate]);

  const fetchData = async (userId) => {
    try {
      const { data: profileData } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      setProfile(profileData);

      const { data: dishList } = await supabase
        .from("dishes")
        .select("id, title");

      setDishes(dishList || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = async () => {
    const updatedProfile = {
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      phone: profile.phone || "",
      address: profile.address || "",
      photo_url: profile.photo_url || "",
      email: profile.email || "",
    };

    const { error } = await supabase
      .from("users")
      .update(updatedProfile)
      .eq("id", user.id);

    if (!error) {
      setShowEditModal(false);
      fetchData(user.id);
    } else {
      console.error("Update failed", error);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await supabase.from("users").delete().eq("id", user.id);
      await supabase.auth.signOut();
      navigate("/");
    } catch {
      console.error("Delete failed");
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

    if (uploadError) return;

    const { data: publicData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const publicUrl = publicData?.publicUrl;

    const { error: dbError } = await supabase
      .from("users")
      .update({ photo_url: publicUrl })
      .eq("id", user.id);

    if (!dbError) {
      setProfile({ ...profile, photo_url: publicUrl });
    }
  };

  const handleReviewSubmit = async () => {
    if (!selectedDish || rating === 0 || !newReview.trim()) {
      return;
    }

    const { error } = await supabase.from("reviews").insert([
      {
        user_id: user.id,
        dish_id: selectedDish,
        rating,
        review_text: newReview,
      },
    ]);

    if (!error) {
      setNewReview("");
      setSelectedDish("");
      setRating(0);
      setReviewSuccess(true);
      fetchData(user.id);
      setShowReviewForm(false);
      setTimeout(() => setReviewSuccess(false), 3000);
    }
  };

  return (
    <div className="bg-cream py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl text-forest font-bold mb-6">
          Welcome back, {profile.first_name || "User"}
        </h2>

        <section className="relative bg-cream p-6 mb-6 flex flex-col md:flex-row items-start gap-6">
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

          <div className="flex-1 w-full relative">
            <div className="absolute top-0 right-0">
              <button onClick={() => setShowMenu(!showMenu)}>
                <MoreVertical className="text-charcoal hover:text-orange" />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg z-10">
                  <button
                    onClick={() => {
                      setShowEditModal(true);
                      setShowMenu(false);
                    }}
                    className="flex items-center px-4 py-2 hover:bg-gray-100 w-full"
                  >
                    <Pencil size={16} className="mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteModal(true);
                      setShowMenu(false);
                    }}
                    className="flex items-center px-4 py-2 hover:bg-gray-100 w-full text-red-600"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl text-forest font-semibold mb-1">
                {profile.first_name} {profile.last_name}
              </h3>
              <p>Email : {profile.email || "N/A"}</p>
              <p>Phone: {profile.phone || "N/A"}</p>
              <p>Address: {profile.address || "N/A"}</p>
            </div>
          </div>
        </section>

        <div className="flex gap-4 mb-6 justify-end">
          <button
            onClick={() => navigate("/menu")}
            className="bg-forest text-white px-4 py-2 rounded hover:bg-orange"
          >
            Order Now
          </button>
          <button
            className="bg-forest text-white px-4 py-2 rounded hover:bg-orange"
            onClick={() => setShowReviewForm((prev) => !prev)}
          >
            Submit Review
          </button>
        </div>

        {showReviewForm && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            onClick={() => setShowReviewForm(false)}
          >
            <div
              className="bg-cream p-6 rounded shadow-lg w-96"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl mb-4 text-forest font-bold">
                Submit a Review
              </h3>
              <label className="block mb-2">
                Dish:
                <select
                  value={selectedDish}
                  onChange={(e) => setSelectedDish(e.target.value)}
                  className="w-full p-2 border rounded mt-1"
                >
                  <option value="">Select a dish</option>
                  {dishes.map((dish) => (
                    <option key={dish.id} value={dish.id}>
                      {dish.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block mb-2">
                Rating:
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full p-2 border rounded mt-1"
                >
                  <option value={0}>Select rating</option>
                  {[1, 2, 3, 4, 5].map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block mb-4">
                Review:
                <textarea
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  rows={3}
                  className="w-full p-2 border rounded mt-1"
                />
              </label>
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleReviewSubmit}
                  className="bg-forest text-white px-4 py-2 rounded"
                >
                  Submit
                </button>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 rounded border bg-gray-300 hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-cream p-6 rounded shadow-lg w-96">
              <h3 className="text-xl font-bold mb-4 text-forest">
                Edit Profile
              </h3>

              <label
                className="block mb-1 font-semibold text-forest"
                htmlFor="photo"
              >
                Profile Photo
              </label>
              <input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="mb-4"
              />

              <label
                className="block mb-1 font-semibold text-forest"
                htmlFor="firstName"
              >
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                placeholder="First Name"
                value={profile.first_name}
                onChange={(e) =>
                  setProfile({ ...profile, first_name: e.target.value })
                }
                className="w-full mb-2 p-2 border rounded"
              />

              <label
                className="block mb-1 font-semibold text-forest"
                htmlFor="lastName"
              >
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                placeholder="Last Name"
                value={profile.last_name}
                onChange={(e) =>
                  setProfile({ ...profile, last_name: e.target.value })
                }
                className="w-full mb-2 p-2 border rounded"
              />

              <label
                className="block mb-1 font-semibold text-forest"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Email"
                value={profile.email || ""}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                className="w-full mb-4 p-2 border rounded"
              />

              <label
                className="block mb-1 font-semibold text-forest"
                htmlFor="phone"
              >
                Phone
              </label>
              <input
                id="phone"
                type="text"
                placeholder="Phone"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                className="w-full mb-2 p-2 border rounded"
              />

              <label
                className="block mb-1 font-semibold text-forest"
                htmlFor="address"
              >
                Address
              </label>
              <input
                id="address"
                type="text"
                placeholder="Address"
                value={profile.address}
                onChange={(e) =>
                  setProfile({ ...profile, address: e.target.value })
                }
                className="w-full mb-4 p-2 border rounded"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={handleUpdate}
                  className="bg-forest text-white px-4 py-2 rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-300 px-4 py-2 rounded border"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-cream p-6 rounded shadow-lg w-96">
              <h3 className="text-xl font-bold text-red-600 mb-4">
                Confirm Account Deletion
              </h3>
              <p className="mb-4">
                Are you sure you want to permanently delete your account?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleDeleteUser}
                  className="bg-red-600 text-white px-4 py-2 rounded"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded border"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
