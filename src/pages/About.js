import React from "react";
import { useNavigate } from 'react-router-dom';


const AboutPage = () => {
  const navigate = useNavigate();
  return (
    <div className=" bg-cream w-full">
      {/* Banner */}
      <section className="relative w-full h-[300px] md:h-[400px]">
        <img
          src="/AboutPage.jpg"
          alt="About Boltu's Kitchen"
          className="w-full h-full object-fill"
        />
      </section>

      {/* Our Story */}
      <section className="bg-cream max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold mb-6 text-forest">Our Story</h2>
        <p className="text-lg mb-4 text-charcoal">
          Boltu’s Kitchen began as a humble home kitchen with a big dream —
          bringing the love of home-cooked meals to every doorstep. Inspired by
          the comforting flavors of childhood and the joy of cooking with heart,
          Boltu (our cartoon chef!) turned that dream into a full-flavored
          reality.
        </p>
        <p className="text-lg text-charcoal">
          From the careful selection of ingredients to the final garnish on
          every dish, we pour passion into every bite. Whether you’re craving a
          warm bowl of comfort or something adventurous, we have a dish that
          feels just like home.
        </p>
      </section>

      {/* Mission & Values */}
      <section className="bg-cream py-12 px-4">
        <div className="max-w-6xl mx-auto text-charcoal">
          <h3 className="text-forest text-3xl font-bold mb-6">
            Our Mission & Values
          </h3>
          <ul className="space-y-4 text-lg list-disc pl-5">
            <li>Deliver warm, freshly made dishes full of flavor and love.</li>
            <li>Support local farms and fresh ingredients.</li>
            <li>Celebrate food as a shared experience and cultural joy.</li>
            <li>
              Operate with integrity, sustainability, and community focus.
            </li>
          </ul>
        </div>
      </section>

      {/* Meet Boltu */}
      <section className="py-12 px-4 bg-cream">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <img
            src="/ChefAniation.gif"
            alt="Boltu the Chef"
            className="w-64 h-auto"
          />
          <div className="text-charcoal">
            <h3 className="text-forest text-3xl font-bold mb-4">Meet Boltu</h3>
            <p className="text-lg">
              Boltu is the heart and soul of our kitchen. He’s not just a logo —
              he’s the embodiment of our values: warmth, care, and joy in every
              plate. Inspired by real chefs and food lovers, Boltu brings a
              smile to your screen and flavor to your table.
            </p>
          </div>
        </div>
      </section>

      {/* What Makes Us Special */}
      <section className="bg-cream text-charcoal py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-6 text-forest">
            What Makes Us Special
          </h3>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div>
              <h4 className="text-xl font-bold mb-2 text-forest">
                Home-Cooked Style
              </h4>
              <p>Every dish tastes like it came from your grandma’s kitchen.</p>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-2 text-forest">
                Made Fresh Daily
              </h4>
              <p>We cook everything from scratch, every single day.</p>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-2 text-forest">
                Locally Sourced
              </h4>
              <p>We support local farmers and pick the freshest ingredients.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-cream py-12 px-4">
        <div className="max-w-6xl mx-auto text-charcoal">
          <h3 className="text-3xl font-bold mb-6 text-center text-forest">
            What Our Customers Say
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <blockquote className="border-l-4 border-orange-500  pl-4 italic">
              “Boltu’s food reminds me of home. Comforting, flavorful, and
              always fresh. A must-try!”
              <span className="block mt-2 font-semibold text-orange">
                – Rina A.
              </span>
            </blockquote>
            <blockquote className="border-l-4 border-orange-500 pl-4 italic">
              “The care they put into every order is unmatched. I order weekly!”
              <span className="block mt-2 font-semibold text-orange">
                – Tanvir M.
              </span>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-cream py-12 text-center">
        <h3 className="text-3xl font-bold mb-4 text-forest">
          Ready to Taste the Love?
        </h3>
        <p className="text-lg mb-6 text-charcoal">
          Explore our full menu and find your next favorite dish.
        </p>

        <button
          onClick={() => navigate("/menu")}
          className="bg-forest text-white px-6 py-3 rounded-xl font-medium hover:bg-orange transition"
        >
          Explore Our Menu
        </button>
      </section>
    </div>
  );
};

export default AboutPage;
