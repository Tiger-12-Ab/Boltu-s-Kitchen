import React from "react";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom" 
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function HeroSection() {
     const navigate = useNavigate();
  const dishes = [
    {
      image: "/Chickencurry.png",  
      name: "Spicy Chicken Curry",
      description: "A fiery and flavorful curry made with tender chicken pieces."
    },
    {
      image: "/CreamyPasta.png",
      name: "Creamy Pasta",
      description: "Deliciously creamy pasta loaded with rich flavors and herbs."
    },
    {
      image: "/GrilledSkewers.png",
      name: "Grilled Veggie Skewers",
      description: "Colorful and healthy skewers grilled to perfection."
    },
    {
      image: "/Chocolatecake.png",
      name: "Chocolate Lava Cake",
      description: "Rich chocolate cake with a molten center, baked fresh."
    },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    arrows: false,
    centerMode: false,
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between min-h-screen bg-cream px-8 md:px-12 lg:px-20">
      {/* Left: Text Content */}
      <div className="flex-1 text-center md:text-left mb-10 md:mb-0">
        <h1 className="text-4xl md:text-6xl font-bold text-forest mb-6">
          Fresh. Homemade. Unforgettable.
        </h1>
        <p className="text-lg md:text-2xl text-charcoal mb-8">
          Bringing the kitchen magic to your doorstep.
        </p>
        <button onClick={() => navigate("/menu")} className="bg-forest hover:bg-orange text-white font-bold py-3 px-6 rounded-full text-lg transition">
          Order Now
        </button>
      </div>

      {/* Right: Carousel */}
      <div className="flex-1 flex flex-col items-center">
        <div className="w-72 md:w-96">
          <Slider {...settings}>
            {dishes.map((dish, index) => (
              <div key={index} className="flex flex-col items-center ">
                {/* Circular Image */}
                <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden shadow-lg mx-auto mb-4">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Text below image */}
                <h2 className="text-2xl font-bold text-forest text-center">{dish.name}</h2>
                <p className="text-charcoal text-sm text-center px-4">{dish.description}</p>
              </div>
            ))}
          </Slider>
        </div>
      </div>

    </div>
  );
}