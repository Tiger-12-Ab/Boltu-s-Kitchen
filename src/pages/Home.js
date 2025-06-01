import React from "react";

import HeroSection from "../components/HeroSection";
import OurMenuHighlights from "../components/OurMenuHighlights";
import AboutSection from "../components/AboutSection";
import HowItWorks from "../components/HowItWorks";
import CustomerReviews from "../components/CustomerReviews";
import DownloadOurApp from "../components/DownloadOurApp";
import NewsletterCTA from "../components/NewsletterCTA";

const Home = () => {
  return (
    <div className="bg-cream min-h-screen">
      <HeroSection />
      <OurMenuHighlights />
      <HowItWorks />
      <AboutSection />
      <CustomerReviews />
      <DownloadOurApp />
      <NewsletterCTA />
    </div>
  );
};

export default Home;
