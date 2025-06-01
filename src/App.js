import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { supabase } from "./supabase";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Menu from "./pages/Menu";
import Dashboard from "./pages/Dashboard";
import Cart from "./pages/Cart";
import About from "./pages/About";
import Contact from "./pages/Contact";
import DishDetails from "./pages/DishDetails";
import Checkout from "./pages/Checkout";
import OrderDetails from "./pages/OrderDetails";
//Admin ---------------------------------
import AdminDashboard from "./admin/AdminDashboard";
import Dishes from "./admin/Dishes";
import Reviews from "./admin/Reviews";
import Order from "./admin/Order";
import Users from "./admin/Users";

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserRole = async (userId) => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", userId)
          .single();

        if (error || !data) {
          setIsAdmin(false);
        } else {
          setIsAdmin(data.role === "admin");
        }
      } catch {
        setIsAdmin(false);
      }
    };

    const fetchUserAndRole = async () => {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setIsLoggedIn(true);
        await getUserRole(session.user.id);
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
      setLoading(false);
    };

    fetchUserAndRole();

    // Listen for login/logout
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        getUserRole(session.user.id);
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Toaster />
      <Router>
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/dish/:id" element={<DishDetails />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-details/:orderId" element={<OrderDetails />} />

          {/* Conditionally show admin or user dashboard */}
          <Route
            path="/dashboard"
            element={
              isLoggedIn && !isAdmin ? <Dashboard /> : <Navigate to="/" />
            }
          />

          <Route
            path="/admin"
            element={
              loading ? (
                <div>Loading...</div>
              ) : isLoggedIn && isAdmin ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/dishes"
            element={
              loading ? (
                <div>Loading...</div>
              ) : isLoggedIn && isAdmin ? (
                <Dishes />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
          path="/reviews"
          element={
            loading ? (
              <div>Loading...</div>
            ) : isLoggedIn && isAdmin ? (
              <Reviews />
            ) : (
              <Navigate to="/" />
            )
          }
        />
          <Route
          path="/order"
          element={
            loading ? (
              <div>Loading...</div>
            ) : isLoggedIn && isAdmin ? (
              <Order />
            ) : (
              <Navigate to="/" />
            )
          }
        />
          <Route
          path="/users"
          element={
            loading ? (
              <div>Loading...</div>
            ) : isLoggedIn && isAdmin ? (
              <Users />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        
        </Routes>
        

        <Footer />
      </Router>
    </>
  );
}

export default App;
