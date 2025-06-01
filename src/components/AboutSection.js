import React from "react";
import { useNavigate } from "react-router-dom";

const AboutSection = () => {
  const navigate = useNavigate();

  const handleLearnMoreClick = () => {
    navigate("/about");
  };

  return (
    <section className="py-16 bg-cream">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Flex container for the section */}
        <div className="flex flex-col lg:flex-row-reverse items-center lg:space-x-12">
          {/* Image (Top for mobile, Right for desktop) */}
          <div className="lg:w-1/2">
            <img
              src="About.png"
              alt="Kitchen"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          {/* Text Content (Bottom for mobile, Left for desktop) */}
          <div className="flex flex-col justify-center lg:w-1/2 mb-8 lg:mb-0">
            <h3 className="text-3xl lg:text-4xl font-bold text-forest my-4">
              About Boltu's Kitchen
            </h3>
            <h4 className="text-lg text-charcoal font-semibold">
              From a Passion to Your Plate
            </h4>
            <p className="text-charcoal text-base mb-6">
              Boltu's Kitchen is all about bringing fresh, homemade meals
              directly to you. With a passion for food and hospitality, we pride
              ourselves on creating dishes that are not only delicious but also
              made with love.
            </p>
            <ul className="list-disc forest-marker pl-5 text-charcoal mb-6">
              <li>Fresh and locally sourced ingredients</li>
              <li>Family-friendly atmosphere</li>
              <li>Passionate chefs and culinary experts</li>
            </ul>

            {/* Learn More Button */}
            <div className="flex justify-center sm:justify-start">
              <button
                onClick={handleLearnMoreClick}
                className="w-full sm:w-auto bg-forest hover:bg-orange text-white font-bold py-3 px-6 rounded-full text-lg transition"
              >
                Read More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
