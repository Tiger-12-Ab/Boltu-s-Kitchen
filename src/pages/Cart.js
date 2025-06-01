import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState({
    visible: false,
    dishId: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartItems = async () => {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("carts")
        .select(
          `
          quantity,
          dish: dishes (
            id,
            title,
            price,
            image_url
          )
        `
        )
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching cart:", error);
      } else {
        setCartItems(data);
      }

      setLoading(false);
    };

    fetchCartItems();
  }, [navigate]);

  const updateQuantity = async (dishId, newQuantity) => {
    if (newQuantity < 1) return;

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return;

    const { error } = await supabase
      .from("carts")
      .update({ quantity: newQuantity })
      .eq("user_id", user.id)
      .eq("dish_id", dishId);

    if (error) {
      console.error("Error updating quantity:", error);
    } else {
      const updatedCart = cartItems.map((item) =>
        item.dish.id === dishId ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updatedCart);
    }
  };

  const confirmRemoveItem = (dishId) => {
    setConfirmDelete({ visible: true, dishId });
  };

  const handleRemoveConfirmed = async () => {
    const dishId = confirmDelete.dishId;
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return;

    const { error } = await supabase
      .from("carts")
      .delete()
      .eq("user_id", user.id)
      .eq("dish_id", dishId);

    if (error) {
      console.error("Error removing item:", error);
    } else {
      const updatedCart = cartItems.filter((item) => item.dish.id !== dishId);
      setCartItems(updatedCart);
      setConfirmDelete({ visible: false, dishId: null });
    }
  };

  const handleCancelRemove = () => {
    setConfirmDelete({ visible: false, dishId: null });
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.dish.price,
    0
  );

  if (loading)
    return (
      <div className="text-center py-10 bg-cream min-h-screen">
        Loading cart...
      </div>
    );

  if (cartItems.length === 0)
    return (
      <div className="text-center py-10 bg-cream min-h-screen">
        Your cart is empty.
      </div>
    );

  return (
    <div className="bg-cream min-h-screen pt-10 pb-10">
      <div className="max-w-4xl mx-auto p-6 bg-cream rounded ">
        <h2 className="text-3xl font-bold mb-1 text-forest">
          Your Handpicked Delights
        </h2>
        <p className="text-base text-charcoal mb-6 italic">
          Everything you've chosen — fresh, warm, and ready to delight.
        </p>

        <div className="space-y-4">
          {cartItems.map(({ dish, quantity }) => (
            <div
              key={dish.id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 border-b pb-6"
            >
              <img
                src={dish.image_url}
                alt={dish.title}
                className="w-full sm:w-24 h-40 sm:h-20 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-semibold">
                  {dish.title}
                </h3>
                <p className="text-sm sm:text-base">
                  ${dish.price.toFixed(2)} each
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <button
                  onClick={() => updateQuantity(dish.id, quantity - 1)}
                  className="px-2 py-1 bg-forest text-white rounded hover:bg-orange"
                >
                  -
                </button>
                <span>{quantity}</span>
                <button
                  onClick={() => updateQuantity(dish.id, quantity + 1)}
                  className="px-2 py-1 bg-forest text-white rounded hover:bg-orange"
                >
                  +
                </button>
              </div>
              <div className="w-full sm:w-24 text-right font-semibold mt-2 sm:mt-0">
                ${(dish.price * quantity).toFixed(2)}
              </div>
              <button
                onClick={() => confirmRemoveItem(dish.id)}
                className="ml-auto sm:ml-4 text-red-600 hover:text-red-800 mt-2 sm:mt-0"
                aria-label="Remove"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-6 text-right text-2xl font-bold text-forest">
          Total: ${totalPrice.toFixed(2)}
        </div>
        <div className="mt-6 text-right">
          <button
            onClick={() => navigate("/checkout")}
            className="bg-forest text-white px-6 py-3 rounded hover:bg-orange"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmDelete.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Remove Item</h3>
            <p className="mb-6">
              Are you sure you want to remove this item from your cart?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCancelRemove}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveConfirmed}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
