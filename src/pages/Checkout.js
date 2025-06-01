import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorModal, setErrorModal] = useState(null); 
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (!user) return navigate("/login");

      const { data: cartData, error: cartError } = await supabase
        .from("carts")
        .select("id, quantity, dish: dish_id(*)")
        .eq("user_id", user.id);

      if (cartError) {
        console.error("Error fetching cart:", cartError.message);
        return setErrorModal("Failed to load your cart. Please try again later.");
      }
      setCartItems(cartData);

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("first_name, last_name, phone, address, email")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching user profile:", profileError.message);
        return setErrorModal("Failed to load your profile. Please try again later.");
      }

      setUserInfo(profile);
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
        address: profile.address || "",
        email: profile.email || "",
      });
    };

    fetchData();
  }, [navigate]);

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.dish.price * item.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    const { first_name, last_name, phone, address, email } = formData;

    if (!first_name || !last_name || !phone || !address || !email) {
      setErrorModal("Please fill in all delivery details.");
      return;
    }

    try {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) return navigate("/login");

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            user_id: user.id,
            first_name,
            last_name,
            phone,
            address,
            email,
            total_amount: totalPrice,
            status: "pending",
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderId = orderData.id;

      const orderItems = cartItems.map(({ dish, quantity }) => ({
        user_id: user.id,
        order_id: orderId,
        dish_id: dish.id,
        title: dish.title,
        quantity,
        price: dish.price,
      }));

      const { error: orderItemsError } = await supabase
        .from("order_items")
        .insert(orderItems);
      if (orderItemsError) throw orderItemsError;

      await supabase.from("carts").delete().eq("user_id", user.id);

      setShowModal(true);

      const emailRes = await fetch("http://localhost:5000/api/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: `${first_name} ${last_name}`,
          orderId,
          total: totalPrice,
          items: cartItems.map((item) => ({
            title: item.dish.title,
            quantity: item.quantity,
            price: item.dish.price,
          })),
        }),
      });

      if (!emailRes.ok) throw new Error("Failed to send confirmation email.");
    } catch (error) {
      console.error("Order failed:", error.message);
      setErrorModal("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cream min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-forest">Checkout</h1>

        <div className="relative bg-cream p-6 rounded-xl mb-8">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="absolute top-4 right-4 text-gray-600 hover:text-forest"
            title="Edit Delivery Info"
          >
            <Pencil size={20} />
          </button>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 text-sm font-medium text-forest">First Name</label>
              <input
                type="text"
                value={formData.first_name}
                disabled={!isEditing}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full p-2 border rounded disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-forest">Last Name</label>
              <input
                type="text"
                value={formData.last_name}
                disabled={!isEditing}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full p-2 border rounded disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-forest">Phone</label>
              <input
                type="text"
                value={formData.phone}
                disabled={!isEditing}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2 border rounded disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-forest">Email</label>
              <input
                type="email"
                value={formData.email}
                disabled={!isEditing}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 border rounded disabled:bg-gray-100"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium text-forest">Address</label>
              <textarea
                value={formData.address}
                disabled={!isEditing}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2 border rounded disabled:bg-gray-100"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="bg-cream p-6 rounded-xl mb-6">
          <h2 className="text-xl font-semibold mb-4 text-forest">Order Summary</h2>
          {cartItems.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <>
              <ul className="mb-4">
                {cartItems.map(({ dish, quantity }) => (
                  <li key={dish.id} className="flex justify-between border-b py-2 text-sm">
                    <span>{dish.title} × {quantity}</span>
                    <span>${(dish.price * quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between font-semibold text-forest">
                <span className="text-forest">Total:</span>
                <span className="text-forest">${totalPrice.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        <div className="text-right">
          <button
            onClick={handlePlaceOrder}
            disabled={loading || cartItems.length === 0}
            className={`bg-forest text-white py-2 px-6 rounded hover:bg-orange ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
            <h2 className="text-2xl font-bold text-forest mb-4">Thank You!</h2>
            <p className="mb-4 text-charcoal">Your order has been placed successfully.</p>
            <button
              onClick={() => {
                setShowModal(false);
                navigate("/dashboard");
              }}
              className="bg-forest text-white py-2 px-4 rounded hover:bg-orange"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {errorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Oops!</h2>
            <p className="mb-4 text-charcoal">{errorModal}</p>
            <button
              onClick={() => setErrorModal(null)}
              className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
