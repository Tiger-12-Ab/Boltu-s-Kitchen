import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function OrderHistoryDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        console.error("User not authenticated:", authError);
        setLoading(false);
        return;
      }

      const userId = authData.user.id;

      const { data: ordersData, error: orderError } = await supabase
        .from("orders")
        .select(`
          id,
          total_amount,
          status,
          order_date,
          order_items (
            id,
            quantity,
            price,
            dish: dishes (
              id,
              title,
              image_url
            )
          )
        `)
        .eq("user_id", userId)
        .order("order_date", { ascending: false });

      if (orderError) {
        console.error("Error fetching orders:", orderError);
        setLoading(false);
        return;
      }

      const formatted = ordersData.map((order) => ({
        ...order,
        items: order.order_items.map((item) => ({
          ...item,
          title: item.dish?.title || "Unknown Dish",
          image: item.dish?.image_url || "",
        })),
      }));

      setOrders(formatted);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  const confirmDelete = (orderId, e) => {
    e.stopPropagation();
    setSelectedOrderId(orderId);
    setShowConfirm(true);
  };

  const handleDeleteConfirmed = async () => {
    const { error } = await supabase.from("orders").delete().eq("id", selectedOrderId);
    if (error) {
      console.error("Error deleting order:", error);
    } else {
      setOrders((prev) => prev.filter((order) => order.id !== selectedOrderId));
    }
    setShowConfirm(false);
    setSelectedOrderId(null);
  };

  if (loading) {
    return <div className="text-center py-10">Loading order history...</div>;
  }

  return (
    <div className="bg-cream py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-semibold text-forest mb-1">Your Order History</h3>
        <p className="text-charcoal text-sm mb-6 italic">
          Relive every bite—your past meals, beautifully preserved.
        </p>

        {orders.length === 0 ? (
          <p>No orders placed yet.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="relative border rounded bg-cream p-4 hover:ring-2 hover:ring-orange transition cursor-pointer"
                onClick={() => navigate(`/order-details/${order.id}`)}
              >
                <div className="absolute top-3 right-3 text-right">
                  <p className="text-sm text-charcoal">
                    {new Date(order.order_date).toLocaleString()}
                  </p>
                  {order.status === "pending" && (
                    <button
                      className="mt-1 flex items-center gap-1 text-red-600 text-sm hover:underline ml-auto pr-1"
                      onClick={(e) => confirmDelete(order.id, e)}
                    >
                      <Trash2 size={16} className="text-red-600" />
                      
                    </button>
                  )}
                </div>

                <div className="mt-12 space-y-4">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-wrap sm:flex-nowrap items-start gap-3"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-16 rounded object-cover"
                      />
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-gray-600">
                          ${item.price} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-right mt-4">
                  <p className="font-semibold text-lg text-forest">
                    Total: ${order.total_amount}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs space-y-4">
            <h4 className="text-lg font-semibold text-charcoal">Confirm Deletion</h4>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this order?
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-1 rounded bg-gray-300 text-sm hover:bg-gray-400"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-1 rounded bg-red-600 text-white text-sm hover:bg-red-700"
                onClick={handleDeleteConfirmed}
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
