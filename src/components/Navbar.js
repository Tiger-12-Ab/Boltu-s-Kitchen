import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getSessionAndRole = async () => {
      setLoadingRole(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", currentUser.id)
          .single();

        if (!error && data) {
          setRole(data.role);
        } else {
          setRole(null);
        }
      } else {
        setRole(null);
      }

      setLoadingRole(false);
    };

    getSessionAndRole();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);

        if (currentUser) {
          supabase
            .from("users")
            .select("role")
            .eq("id", currentUser.id)
            .single()
            .then(({ data, error }) => {
              if (!error && data) {
                setRole(data.role);
              } else {
                setRole(null);
              }
              setLoadingRole(false);
            });
        } else {
          setRole(null);
          setLoadingRole(false);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error", error);
    } else {
      setUser(null);
      navigate("/");
    }
  };

  return (
    <nav className="bg-cream text-charcoal relative z-50">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        {/* Hamburger - show on lg and below */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden text-charcoal focus:outline-none z-50"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Logo */}
        <Link to="/" className="text-2xl font-bold flex items-center">
          <img
            src="Logo.png"
            alt="Boltu's Kitchen"
            className="w-16 h-16 md:w-24 md:h-24 lg:w-26 lg:h-26 object-contain"
          />
        </Link>

        {/* Desktop Links - show from lg and above */}
        <div className="hidden lg:flex space-x-6">
          <Link
            to="/"
            className="text-forest hover:bg-orange hover:text-white rounded px-4 py-2 font-bold transition"
          >
            Home
          </Link>
          <Link
            to="/menu"
            className="text-forest hover:bg-orange hover:text-white rounded px-4 py-2 font-bold transition"
          >
            Menu
          </Link>
          <Link
            to="/about"
            className=" text-forest hover:bg-orange hover:text-white rounded px-4 py-2 font-bold transition"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="text-forest hover:bg-orange hover:text-white rounded px-4 py-2 font-bold transition"
          >
            Contact
          </Link>
        </div>

        {/* Desktop Auth - show from lg and above */}
        <div className="hidden lg:flex space-x-4 items-center">
          {!user ? (
            <>
              <Link
                to="/login"
                className="bg-forest hover:bg-orange text-white py-1 px-4 rounded transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-forest hover:bg-orange text-white py-1 px-4 rounded transition"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              {/* Cart Icon */}
              <Link
                to="/cart"
                className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded transition flex items-center"
                aria-label="Cart"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4"
                  />
                  <circle cx="7" cy="21" r="1" />
                  <circle cx="17" cy="21" r="1" />
                </svg>
              </Link>

              {!loadingRole && (
                <Link
                  to={role === "admin" ? "/admin" : "/dashboard"}
                  className="bg-forest hover:bg-orange text-white py-1 px-4 rounded transition"
                >
                  Dashboard
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="bg-forest hover:bg-orange text-white py-1 px-4 rounded transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* Slider Menu for mobile & tablet - slide from left */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-cream transform transition-transform duration-300 ease-in-out z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div
          className="px-6 pt-9 space-y-6 overflow-y-auto"
          style={{ marginTop: "2.5rem" }}
        >
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="block text-forest hover:text-orange font-semibold text-lg"
          >
            Home
          </Link>
          <Link
            to="/menu"
            onClick={() => setIsOpen(false)}
            className="block text-forest hover:text-orange font-semibold text-lg"
          >
            Menu
          </Link>
          <Link
            to="/about"
            onClick={() => setIsOpen(false)}
            className="block text-forest hover:text-orange font-semibold text-lg"
          >
            About
          </Link>
          <Link
            to="/contact"
            onClick={() => setIsOpen(false)}
            className="block text-forest hover:text-orange font-semibold text-lg"
          >
            Contact
          </Link>

          {!user ? (
            <>
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block text-forest font-semibold text-lg"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="block text-forest font-semibold text-lg"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/cart"
                onClick={() => setIsOpen(false)}
                className="flex items-center text-yellow-400 font-semibold text-lg"
                aria-label="Cart"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4"
                  />
                  <circle cx="7" cy="21" r="1" />
                  <circle cx="17" cy="21" r="1" />
                </svg>
                Cart
              </Link>
              {!loadingRole && (
                <Link
                  to={role === "admin" ? "/admin" : "/dashboard"}
                  onClick={() => setIsOpen(false)}
                  className="block text-forest font-semibold text-lg"
                >
                  Dashboard
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="block text-orange font-semibold text-lg"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* Overlay when slider is open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
          aria-hidden="true"
        />
      )}
    </nav>
  );
}
