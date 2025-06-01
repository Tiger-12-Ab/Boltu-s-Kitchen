import React from "react";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-forest text-white pt-8 pb-0 px-6 md:px-20 flex flex-col">

      {/* Top Section */}
      <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">

        {/* Left: Secondary Logo */}
        <div className="text-2xl font-bold">
          BK
        </div>

        {/* Middle: Navigation Links */}
        <div className="flex space-x-6 text-sm md:text-base">
          <a href="#privacy" className="hover:text-orange transition">Privacy Policy</a>
          <a href="#terms" className="hover:text-orange transition">Terms</a>
          <a href="#careers" className="hover:text-orange transition">Careers</a>
        </div>

        {/* Right: Social Icons */}
        <div className="flex space-x-4 text-xl">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-orange transition">
            <FaFacebookF />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-orange transition">
            <FaInstagram />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-orange transition">
            <FaTwitter />
          </a>
        </div>

      </div>

      {/* Bottom Copyright */}
      <div className="mt-8 text-center text-sm text-charcoal">
        © {new Date().getFullYear()} Boltu's Kitchen. All rights reserved.
      </div>
      
    </footer>
  );
}
