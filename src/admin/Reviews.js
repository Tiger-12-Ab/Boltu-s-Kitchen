import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { Star, MoreVertical } from "lucide-react";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const [showDeleteId, setShowDeleteId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        id,
        review_text,
        rating,
        created_at,
        user:users!user_id (
          first_name,
          last_name
        ),
        dish:dishes (
          title
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
    } else {
      setReviews(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (!error) {
      setReviews((prev) => prev.filter((rev) => rev.id !== id));
    }
    setShowDeleteId(null);
  };

  const handleEditSave = async () => {
    const { id, review_text, rating } = editingReview;
    const { error } = await supabase
      .from("reviews")
      .update({ review_text, rating })
      .eq("id", id);
    if (!error) {
      await fetchReviews();
      setEditingReview(null);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex flex-wrap gap-[2px]">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < rating ? "text-yellow-500" : "text-gray-300"}
            fill={i < rating ? "#facc15" : "none"}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-cream min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-forest mb-2 text-center sm:text-left">Manage Reviews</h1>
        <p className="text-charcoal italic mb-6 text-center sm:text-left">
          See what your customers are saying about Boltu’s Kitchen.
        </p>

        {loading ? (
          <div className="text-center py-10">Loading reviews...</div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-cream p-4 rounded-lg shadow relative overflow-hidden">
                {/* Top-right controls */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  {renderStars(review.rating)}
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === review.id ? null : review.id)}
                      className="hover:text-gray-600"
                    >
                      <MoreVertical size={18} />
                    </button>
                    {openMenuId === review.id && (
                      <div className="absolute right-0 mt-1 w-24 bg-white border rounded shadow z-10">
                        <button
                          onClick={() => {
                            setEditingReview(review);
                            setOpenMenuId(null);
                          }}
                          className="block w-full px-3 py-1 text-sm hover:bg-gray-100 text-left"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setShowDeleteId(review.id);
                            setOpenMenuId(null);
                          }}
                          className="block w-full px-3 py-1 text-sm hover:bg-gray-100 text-left text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dish name */}
                <p className="text-lg font-semibold text-forest mb-1">
                  {review.dish?.title || "Unknown Dish"}
                </p>

                {/* Review text */}
                <p className="text-charcoal mb-2 break-words">{review.review_text}</p>

                {/* User name */}
                <p className="text-sm text-charcoal">
                  - {review.user?.first_name || "Anonymous"} {review.user?.last_name || ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingReview && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-4">
          <div className="bg-white p-6 rounded-xl shadow max-w-sm w-full space-y-4">
            <h2 className="text-lg font-semibold text-forest">Edit Review</h2>
            <div>
              <label className="block text-sm text-charcoal mb-1">Review Text</label>
              <textarea
                className="w-full border rounded p-2 text-sm"
                rows={3}
                value={editingReview.review_text}
                onChange={(e) =>
                  setEditingReview({ ...editingReview, review_text: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm text-charcoal mb-1">Rating (1–5)</label>
              <input
                type="number"
                min={1}
                max={5}
                className="w-full border rounded p-2 text-sm"
                value={editingReview.rating}
                onChange={(e) =>
                  setEditingReview({ ...editingReview, rating: parseInt(e.target.value) })
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingReview(null)}
                className="px-4 py-1 text-sm bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="px-4 py-1 text-sm bg-forest text-white rounded hover:bg-orange"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-4">
          <div className="bg-white p-6 rounded-xl shadow max-w-sm w-full space-y-4">
            <h2 className="text-lg font-semibold text-forest">Confirm Deletion</h2>
            <p className="text-sm text-charcoal">Are you sure you want to delete this review?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteId(null)}
                className="px-4 py-1 text-sm bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteId)}
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
