import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

const DishDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const [modal, setModal] = useState({ show: false, message: "" });

  const showModal = (message) => {
    setModal({ show: true, message });
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error.message);
        return;
      }
      setUserId(user?.id);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchDish = async () => {
      const { data, error } = await supabase
        .from("dishes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching dish:", error);
      } else {
        setDish(data);
      }

      setLoading(false);
    };

    fetchDish();
  }, [id]);

  const handleAddToCart = async () => {
    if (!userId) {
      showModal("You must be logged in to add items to your cart.");
      return;
    }

    const { error } = await supabase
      .from("carts")
      .upsert(
        {
          user_id: userId,
          dish_id: dish.id,
          quantity: 1
        },
        {
          onConflict: ["user_id", "dish_id"]
        }
      );

    if (error) {
      console.error("Error adding to cart:", error.message);
      showModal("Failed to add to cart. Try again.");
    } else {
      showModal("Added to cart!");
    }
  };

  const handleOrderNow = async () => {
    await handleAddToCart();
    if (userId) navigate("/cart");
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!dish)
    return <div className="text-center py-10 text-red-500">Dish not found</div>;

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-6xl mx-auto p-6 grid md:grid-cols-2 gap-6">
        <div className="flex justify-center">
          <img
            src={dish.image_url}
            alt={dish.title}
            className="w-72 h-64 object-cover rounded-xl shadow"
          />
        </div>

        <div>
          <h1 className="text-4xl font-bold text-forest mb-2">{dish.title}</h1>
          <p className="text-lg text-charcoal italic mb-4">
            {dish.short_description}
          </p>
          <p className="text-base text-charcoal mb-6">{dish.description}</p>
          <div className="text-2xl font-semibold text-forest mb-6">
            Price: ${dish.price}
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              className="bg-forest text-white px-6 py-2 rounded-lg hover:bg-orange"
            >
              Add to Cart
            </button>
            <button
              onClick={handleOrderNow}
              className="bg-orange text-white px-6 py-2 rounded-lg hover:bg-forest"
            >
              Order Now
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm text-center shadow-xl">
            <p className="text-lg font-medium text-charcoal mb-4">
              {modal.message}
            </p>
            <button
              onClick={() => setModal({ show: false, message: "" })}
              className="px-4 py-2 bg-forest text-white rounded hover:bg-orange"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DishDetails;
