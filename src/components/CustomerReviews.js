import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { supabase } from "../supabase";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const renderStars = (rating) => {
  return Array.from({ length: 5 }, (_, i) => (
    <span
      key={i}
      className={i < rating ? "text-yellow-500" : "text-charcoal"}
      aria-label={i < rating ? "filled star" : "empty star"}
    >
      ★
    </span>
  ));
};

const CustomerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select(
          `
          id, review_text, rating, created_at,
          dishes ( title ),
          users ( first_name, last_name )
        `
        )
        .in("id", [
          "a955d528-e45f-4d0e-a964-fcc81c8185d3",
          "23f869fa-13be-4db4-b9e6-6c9d7e7efccd",
          "75c71f61-0080-4a51-ab1e-b1668139805b",
          "8c49cb94-6fb7-49c8-ab1f-7dbea8c62dee",
        ])

        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching reviews:", error);
      } else {
        setReviews(data);
      }
      setLoading(false);
    };

    fetchReviews();
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 5000,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 3 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 640,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  return (
    <section className="bg-cream py-12 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-forest mb-2">
          What Our Customers Say
        </h2>
        <p className="text-charcoal mb-10">
          Real voices. Real dishes. Real joy.
        </p>

        {loading ? (
          <p className="text-charcoal">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-charcoal">No reviews to display.</p>
        ) : (
          
          <Slider {...sliderSettings}>
            {reviews.map((review) => (
              <div key={review.id} className="px-3 pb-8 flex justify-center">
                <div className="bg-cream rounded-2xl p-6 shadow hover:shadow-lg transition-all duration-300 w-full max-w-sm flex flex-col justify-between text-left">
                  {/* Dish Title & Rating */}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-forest">
                      {review.dishes?.title || "Unknown Dish"}
                    </h3>
                    <div>{renderStars(review.rating)}</div>
                  </div>

                  {/* Review Text */}
                  <p className="text-charcoal italic mb-3">
                    “{review.review_text}”
                  </p>

                  {/* User Info */}
                  <p className="text-sm font-semibold text-forest">
                    — {review.users?.first_name} {review.users?.last_name}
                  </p>

                  {/* Timestamp */}
                  <div className="text-right text-xs text-charcoal mt-auto">
                    {new Date(review.created_at).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </Slider>
          
        )}
      </div>
    </section>
  );
};

export default CustomerReviews;
