import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { Trash2 } from "lucide-react";

export default function OrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone,
          address,
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
        .eq("id", orderId)
        .single();

      if (error) {
        console.error("Error fetching order:", error);
      } else {
        const formatted = {
          ...data,
          items: data.order_items.map((item) => ({
            ...item,
            title: item.dish?.title || "Unknown Dish",
            image: item.dish?.image_url || "",
          })),
        };
        setOrder(formatted);
      }
      setLoading(false);
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleDelete = async () => {
    const { error } = await supabase.from("orders").delete().eq("id", order.id);
    if (error) {
      console.error("Error deleting order:", error);
    } else {
      navigate("/dashboard");
    }
  };

  if (loading)
    return <div className="text-center py-10">Loading order details...</div>;

  if (!order)
    return <div className="text-center py-10">Order not found.</div>;

  return (
    <div className="bg-cream min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto relative">
        {/* Delete Button */}
        {order.status === "pending" && (
          <button
            className="absolute top-4 right-4 text-red-600 hover:underline flex items-center gap-1"
            onClick={() => setShowConfirm(true)}
          >
            <Trash2 size={18} />
          </button>
        )}

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-bold text-forest mb-2 text-center sm:text-left">
          A Closer Look at Your Order
        </h2>
        <p className="text-sm sm:text-base text-charcoal italic mb-4 text-center sm:text-left">
          "Thank you for choosing Boltu’s Kitchen — here’s everything you ordered."
        </p>

        {/* User Info */}
        <div className="bg-cream p-4 sm:p-6 rounded-lg shadow-sm space-y-2 sm:space-y-3 mb-6">
          <p><strong className="text-forest">Name:</strong> {order.first_name} {order.last_name}</p>
          <p><strong className="text-forest">Email:</strong> {order.email}</p>
          <p><strong className="text-forest">Phone:</strong> {order.phone}</p>
          <p><strong className="text-forest">Address:</strong> {order.address}</p>
          <p className="text-sm text-charcoal italic">
            Order placed on: {new Date(order.order_date).toLocaleString()}
          </p>
        </div>

        {/* Ordered Items */}
        <div className="space-y-4">
          {order.items.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-cream p-3 rounded shadow-sm"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-24 h-24 sm:w-16 sm:h-16 rounded object-cover"
              />
              <div>
                <p className="font-medium text-forest">{item.title}</p>
                <p className="text-sm text-charcoal">
                  ${item.price} × {item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="text-right mt-6">
          <p className="font-semibold text-lg sm:text-xl text-forest">
            Total: ${order.total_amount}
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs space-y-4">
            <h4 className="text-lg font-semibold text-forest">Confirm Deletion</h4>
            <p className="text-sm text-charcoal">
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
                onClick={handleDelete}
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
