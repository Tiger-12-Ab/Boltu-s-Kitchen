import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { MoreVertical } from "lucide-react";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);

  // Fetch orders 
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("order_date", { ascending: false });

      if (ordersError) throw ordersError;

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const orderIds = ordersData.map((order) => order.id);

      // Fetch all order_items 
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", orderIds);

      if (itemsError) throw itemsError;
        console.log("Order IDs:", orderIds);
console.log("Fetched order_items:", itemsData);

      // Combine order_items with their respective orders
      const ordersWithItems = ordersData.map((order) => ({
        ...order,
        order_items: itemsData.filter((item) => item.order_id === order.id),
      }));

      setOrders(ordersWithItems);
    } catch (error) {
      console.error("Error fetching orders and items:", error);
      setOrders([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete = async (id) => {
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (!error) {
      setOrders((prev) => prev.filter((o) => o.id !== id));
      setDeleteConfirmId(null);
    }
  };

  const handleStatusUpdate = async () => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", editingOrderId);
    if (!error) {
      await fetchOrders();
      setEditingOrderId(null);
      setNewStatus("");
    }
  };

  return (
    <div className="bg-cream min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-forest mb-6 text-center sm:text-left">Manage Orders</h1>
        {loading ? (
          <div className="text-center py-10">Loading orders...</div>
        ) : (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <p className="text-center text-charcoal">No orders found.</p>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="relative bg-cream rounded-xl shadow p-4 space-y-2"
                >
                  {/* Three-dot dropdown */}
                  <div className="absolute top-4 right-4">
                    <button onClick={() => setMenuOpenId(menuOpenId === order.id ? null : order.id)}>
                      <MoreVertical className="text-forest" />
                    </button>
                    {menuOpenId === order.id && (
                      <div className="absolute right-0 mt-2 bg-white border rounded shadow-md z-10 w-32 text-sm">
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-gray-100"
                          onClick={() => {
                            setEditingOrderId(order.id);
                            setNewStatus(order.status);
                            setMenuOpenId(null);
                          }}
                        >
                          Edit Status
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                          onClick={() => {
                            setDeleteConfirmId(order.id);
                            setMenuOpenId(null);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-lg font-semibold text-forest">Order #{order.id}</p>
                  <p className="text-sm text-charcoal">Placed on: {new Date(order.order_date).toLocaleDateString()}</p>
                  <p className="text-charcoal text-sm">Status: <span className="font-medium text-forest">{order.status}</span></p>

                  <div className="text-sm text-charcoal">
                    <p><strong>Name:</strong> {order.first_name} {order.last_name}</p>
                    <p><strong>Email:</strong> {order.email}</p>
                    <p><strong>Phone:</strong> {order.phone}</p>
                    <p><strong>Address:</strong> {order.address}</p>
                  </div>

                  <div className="mt-2">
                    <h3 className="text-sm font-semibold text-forest">Items:</h3>
                    <ul className="text-sm text-charcoal list-disc pl-5 space-y-1">
                      {order.order_items && order.order_items.length > 0 ? (
                        order.order_items.map((item) => (
                          <li key={item.id}>
                            {item.title} × {item.quantity} — ${item.price}
                          </li>
                        ))
                      ) : (
                        <li>No items found for this order.</li>
                      )}
                    </ul>
                  </div>

                  <p className="mt-2 font-semibold text-right text-forest">
                    Total: ${order.total_amount.toFixed(2)}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingOrderId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-4">
          <div className="bg-white p-6 rounded-xl shadow max-w-sm w-full space-y-4">
            <h2 className="text-lg font-semibold text-forest">Edit Order Status</h2>
            <select
              className="w-full border rounded p-2 text-sm"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingOrderId(null)}
                className="px-4 py-1 text-sm bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                className="px-4 py-1 text-sm bg-forest text-white rounded hover:bg-orange"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-4">
          <div className="bg-white p-6 rounded-xl shadow max-w-sm w-full space-y-4">
            <h2 className="text-lg font-semibold text-forest">Confirm Deletion</h2>
            <p className="text-sm text-charcoal">Are you sure you want to delete this order?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-1 text-sm bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
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
