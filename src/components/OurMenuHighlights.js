import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { supabase } from "../supabase"; 
const settings = {
  dots: true,
  infinite: true,
  speed: 800,
  slidesToShow: 3,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 2500,
  arrows: false,
  centerMode: false,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 640,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    },
  ],
};

const OurMenuHighlights = () => {
  const [dishes, setDishes] = useState([]);

  useEffect(() => {
    const fetchDishes = async () => {
      const { data, error } = await supabase.from("dishes").select("*").in("id", [
          "f7c5efdd-45b0-42eb-8c79-3e774d0f61bd",
          "3bd41101-1a63-4bf4-8099-5d2c3f570e6a",
          "f5e7ce85-236d-48c8-afd1-630c184624a8",
          "975bb707-440f-4edb-8744-00fc6c3708c7",
          "5ca41e0b-64fd-434b-8016-ee43b90868e8"
        ]);
      if (error) {
        console.error("Error fetching dishes:", error.message);
      } else {
        setDishes(data);
      }
    };

    fetchDishes();
  }, []);

  return (
    <section className="py-12 bg-cream flex justify-center items-center" id="our-menu">
      <div className="max-w-6xl w-full mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-forest mb-6">
          Discover Our Dishes
        </h2>
        <p className="text-center text-lg md:text-xl text-charcoal mb-8 px-4 md:px-0">
          A handpicked selection of flavors crafted just for you.
        </p>
        <div className="carousel-container">
          <Slider {...settings}>
            {dishes.map((dish) => (
              <div key={dish.id} className="flex justify-center items-center my-3">
                <div className="w-full max-w-[14rem] bg-cream rounded-3xl shadow-lg">
                  <Link to={`/dish/${dish.id}`}>
                    <div className="w-full h-56 overflow-hidden rounded-t-3xl">
                      <img
                        src={dish.image_url}
                        alt={dish.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="text-xl font-semibold text-forest">
                        {dish.title}
                      </h3>
                      <p className="text-sm text-charcoal">{dish.short_description}</p>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};

export default OurMenuHighlights;
