import React from "react";

const DownloadOurApp = () => {
  return (
    <div className="bg-cream py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
        {/* Left: Phone Image */}
        <div className="flex-1 flex justify-center">
          <img
            src="/DownloadOurApp.png" 
            alt="Download App"
            className="w-[250px] md:w-[300px]"
          />
        </div>

        {/* Right: Text Content */}
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold text-forest mb-4">
            Get Boltu’s Kitchen on the Go
          </h2>
          <p className="text-lg text-charcoal mb-2 font-medium">
            Order your favorite dishes anytime, anywhere.
          </p>
          <p className="text-sm text-charcoal mb-6">
            Download our mobile app for fast and easy access to our full menu, real-time order tracking, and exclusive app-only deals.
          </p>
          <a
            href="https://play.google.com/store" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-forest text-white font-semibold px-6 py-3 rounded-xl shadow hover:bg-orange transition"
          >
            Download on Play Store
          </a>
        </div>
      </div>
    </div>
  );
};

export default DownloadOurApp;
