import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { Pencil, Trash2, MoreVertical, Star } from "lucide-react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function ReviewsDashboard() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editReview, setEditReview] = useState(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(5);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      const { data: reviewsData, error } = await supabase
        .from("reviews")
        .select(
          `
          *,
          dishes ( title ),
          users ( first_name, last_name )
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching reviews:", error);
      } else {
        const merged = reviewsData.map((review) => ({
          ...review,
          dish_title: review.dishes?.title || "Unknown Dish",
          user_name: review.users
            ? `${review.users.first_name} ${review.users.last_name}`
            : "Unknown User",
        }));
        setReviews(merged);
      }

      setLoading(false);
    };

    fetchReviews();
  }, []);

  const handleEdit = (reviewId) => {
    const reviewToEdit = reviews.find((r) => r.id === reviewId);
    if (!reviewToEdit) return;

    setEditReview(reviewToEdit);
    setEditText(reviewToEdit.review_text);
    setEditRating(reviewToEdit.rating);
    setIsEditing(true);
  };

  const handleUpdateReview = async () => {
    if (!editReview) return;

    const { error } = await supabase
      .from("reviews")
      .update({ review_text: editText, rating: editRating })
      .eq("id", editReview.id);

    if (error) {
      console.error("Error updating review:", error);
      return;
    }

    setReviews((prev) =>
      prev.map((r) =>
        r.id === editReview.id
          ? { ...r, review_text: editText, rating: editRating }
          : r
      )
    );

    setIsEditing(false);
    setEditReview(null);
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", deleteTargetId);

    if (error) {
      console.error("Error deleting review:", error);
    } else {
      setReviews((prev) => prev.filter((review) => review.id !== deleteTargetId));
    }

    setShowDeleteModal(false);
    setDeleteTargetId(null);
  };

  const reviewSliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToShow: 1,
    responsive: [{ breakpoint: 768, settings: { slidesToShow: 1 } }],
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={16}
        className={`inline ${
          index < rating ? "text-yellow-400" : "text-gray-300"
        }`}
        fill={index < rating ? "#FBBF24" : "none"}
      />
    ));
  };

  if (loading) {
    return <div className="text-center py-10">Loading reviews...</div>;
  }

  return (
    <div className="bg-cream py-8 px-4 pb-20">
      <div className="max-w-3xl mx-auto">
        <section>
          <h3 className="text-2xl font-semibold text-forest mb-4">Your Reviews</h3>
          {reviews.length === 0 ? (
            <p>No reviews submitted yet.</p>
          ) : (
            <Slider {...reviewSliderSettings}>
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="relative border p-4 rounded-md bg-cream shadow-sm max-w-[90%] mx-auto"
                >
                  {/* Star rating and Action Menu top-right */}
                  <div className="absolute top-3 right-3 flex items-start gap-2">
                    <div className="flex gap-1">{renderStars(review.rating)}</div>

                    <div className="relative group">
                      <MoreVertical className="cursor-pointer" />
                      <div className="hidden group-hover:flex flex-col bg-white border rounded shadow p-1 absolute top-6 right-0 z-10">
                        <button
                          onClick={() => handleEdit(review.id)}
                          className="flex items-center gap-2 text-sm px-2 py-1 hover:bg-gray-100"
                        >
                          <Pencil size={16} /> Edit
                        </button>
                        <button
                          onClick={() => {
                            setShowDeleteModal(true);
                            setDeleteTargetId(review.id);
                          }}
                          className="flex items-center gap-2 text-sm px-2 py-1 hover:bg-gray-100 text-red-600"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-lg font-semibold text-forest mb-2">
                    {review.dish_title}
                  </p>
                  <p className="text-charcoal mb-2">{review.review_text}</p>
                  <p className="text-sm text-orange mb-4">
                    – {review.user_name}
                  </p>
                  <p className="text-xs text-right text-gray-500">
                    {new Date(review.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </Slider>
          )}
        </section>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Edit Review</h2>

            <label className="block mb-2">
              <span className="text-sm font-medium">Review Text</span>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full mt-1 p-2 border rounded"
              />
            </label>

            <label className="block mb-4">
              <span className="text-sm font-medium">Rating (1–5)</span>
              <input
                type="number"
                min="1"
                max="5"
                value={editRating}
                onChange={(e) => setEditRating(Number(e.target.value))}
                className="w-full mt-1 p-2 border rounded"
              />
            </label>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateReview}
                className="px-4 py-2 text-sm bg-forest text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Delete Review</h2>
            <p className="mb-4">Are you sure you want to delete this review?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded"
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
