import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { MoreVertical, Trash2, Pencil } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const uploadImage = async (file) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const { error } = await supabase.storage
    .from("dishes")
    .upload(fileName, file);
  if (error) {
    console.error("Error uploading image:", error.message);
    throw error;
  }
  const { data: urlData } = supabase.storage
    .from("dishes")
    .getPublicUrl(fileName);
  return urlData.publicUrl;
};

const addDish = async (dish) => {
  const { error } = await supabase.from("dishes").insert([dish]);
  if (error) {
    console.error("Error inserting dish into database:", error.message);
    throw error;
  }
};

const updateDish = async (id, dish) => {
  const { error } = await supabase.from("dishes").update(dish).eq("id", id);
  if (error) {
    console.error("Error updating dish:", error.message);
    throw error;
  }
};

const fetchDishes = async () => {
  const { data, error } = await supabase
    .from("dishes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

const deleteDish = async (id) => {
  const { error } = await supabase.from("dishes").delete().eq("id", id);
  if (error) throw error;
};

export default function Dishes() {
  const [dishes, setDishes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [editingDish, setEditingDish] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    short_description: "",
    description: "",
    price: "",
    image_url: "",
    category: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showMenuId, setShowMenuId] = useState(null);

  const categories = ["Main Course", "Appetizer", "Dessert", "Drinks"];
  const categoryTaglines = {
    "Main Course": "Deliciously hearty meals to satisfy your cravings.",
    Appetizer: "Start your meal off right.",
    Dessert: "Sweet treats to finish things off.",
    Drinks: "Refreshing beverages just for you.",
  };

  useEffect(() => {
    const initialize = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData?.user) {
        toast.error("User not authenticated");
        return;
      }
      setUserId(userData.user.id);
      const data = await fetchDishes();
      setDishes(data);
    };
    initialize();
  }, []);

  const resetForm = () => {
    setFormData({
      title: "",
      short_description: "",
      description: "",
      price: "",
      image_url: "",
      category: "",
    });
    setImageFile(null);
    setEditingDish(null);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (dish) => {
    setEditingDish(dish);
    setFormData({
      title: dish.title,
      short_description: dish.short_description || "",
      description: dish.description || "",
      price: dish.price.toString(),
      image_url: dish.image_url || "",
      category: dish.category || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      let imageUrl = formData.image_url;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const dishPayload = {
        ...formData,
        image_url: imageUrl,
        price: parseFloat(formData.price),
        created_by: userId,
      };

      if (editingDish) {
        
        await updateDish(editingDish.id, dishPayload);
        toast.success("Dish updated successfully!");
      } else {
        await addDish(dishPayload);
        toast.success("Dish added successfully!");
      }

      const updatedDishes = await fetchDishes();
      setDishes(updatedDishes);
      setShowForm(false);
      resetForm();
    } catch (err) {
      toast.error(editingDish ? "Error updating dish" : "Error adding dish");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDish(deleteTargetId);
      const data = await fetchDishes();
      setDishes(data);
      toast.success("Dish deleted successfully");
    } catch (err) {
      toast.error("Failed to delete dish");
    } finally {
      setDeleteTargetId(null);
    }
  };

  const groupedDishes = dishes.reduce((acc, dish) => {
    acc[dish.category] = acc[dish.category] || [];
    acc[dish.category].push(dish);
    return acc;
  }, {});

  return (
    <div className="bg-cream min-h-screen p-4">
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-forest text-2xl font-bold">Dishes Management</h2>
        <button
          onClick={openAddForm}
          className="bg-forest hover:bg-orange text-white px-4 py-2 rounded"
        >
          Add Dish
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4 text-charcoal">
              {editingDish ? "Edit Dish" : "Add a Dish"}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                placeholder="Title"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="border p-2 rounded"
              />

              <input
                placeholder="Short Description"
                value={formData.short_description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    short_description: e.target.value,
                  })
                }
                className="border p-2 rounded"
              />
              <textarea
                placeholder="Full Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="border p-2 rounded"
              />
              <div className="relative border rounded">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  placeholder="Price"
                  required
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="pl-6 p-2 w-full rounded"
                  min="0"
                  step="0.01"
                />
              </div>
              <select
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="border p-2 rounded"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="file"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="border p-2 rounded"
              />
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="bg-forest text-white px-4 py-2 rounded"
                  disabled={loading}
                >
                  {loading ? (editingDish ? "Updating..." : "Adding...") : (editingDish ? "Update" : "Submit")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="bg-gray-400 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {Object.entries(groupedDishes).map(([category, dishesInCat]) => (
        <div key={category} className="mb-6">
          <h1 className="text-forest text-xl font-bold mb-1">{category}</h1>
          <p className="text-sm mb-3 text-charcoal">{categoryTaglines[category]}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dishesInCat.map((dish) => (
              <div
                key={dish.id}
                className="relative border rounded p-4 bg-cream shadow"
              >
                <img
                  src={dish.image_url}
                  alt={dish.title}
                  className="w-full h-40 object-cover rounded mb-2"
                />
                <h4 className="font-semibold text-forest">{dish.title}</h4>
                <p className="text-sm text-charcoal">{dish.short_description}</p>
                <p className="font-bold mt-2 text-forest">${dish.price.toFixed(2)}</p>

                <button
                  onClick={() =>
                    setShowMenuId(showMenuId === dish.id ? null : dish.id)
                  }
                  className="absolute top-2 right-2 p-1 rounded hover:bg-gray-200"
                >
                  <MoreVertical size={18} />
                </button>

                {showMenuId === dish.id && (
                  <div className="absolute top-8 right-2 bg-white border rounded shadow-md z-10">
                    <button
                      onClick={() => {
                        setShowMenuId(null);
                        openEditForm(dish);
                      }}
                      className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 w-full text-left"
                    >
                      <Pencil size={16} /> Edit
                    </button>
                    <button
                      onClick={() => {
                        setDeleteTargetId(dish.id);
                        setShowMenuId(null);
                      }}
                      className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 w-full text-left text-red-600"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4 text-charcoal">Confirm Delete</h3>
            <p>Are you sure you want to delete this dish?</p>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded"
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
