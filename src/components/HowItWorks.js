import React from "react";

const HowItWorks = () => {
  return (
    <section className="px-6 py-12 bg-cream">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
        {/* Left: GIF or Animation */}
        <div className="w-full md:w-1/2 flex justify-center">
          <img
            src="ChefAniation.gif" 
            alt="Cartoon Chef Animation"
            className="w-72 h-auto object-contain"
          />
        </div>

        {/* Right: Text Content */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h2 className="text-4xl font-bold text-forest mb-4">How It Works</h2>
          <p className="text-charcoal text-lg mb-6">
            Freshly cooked meals delivered with love in a few simple steps!
          </p>

          {/* Steps */}
          <ol className="space-y-4 text-left">
            <li>
              <h4 className="text-xl font-semibold text-forest">1. Choose Dish</h4>
              <p className="text-charcoal">Select your favorite dish from our menu.</p>
            </li>
            <li>
              <h4 className="text-xl font-semibold text-forest">2. Place Order</h4>
              <p className="text-charcoal">Add to cart and proceed to checkout.</p>
            </li>
            <li>
              <h4 className="text-xl font-semibold text-forest">3. Pay Online</h4>
              <p className="text-charcoal">Complete payment using secure methods.</p>
            </li>
            <li>
              <h4 className="text-xl font-semibold text-forest">4. Get Delivered</h4>
              <p className="text-charcoal">Enjoy your freshly prepared meal at home.</p>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
