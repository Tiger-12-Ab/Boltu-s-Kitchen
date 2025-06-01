import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
    
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email,
          password,
        }
      );

      if (authError) throw authError;

      if (data?.user) {
        checkIfAdmin(data.user.id);  // Check if the user is an admin after login
      }
    } catch (err) {
      setError(handleSupabaseError(err.message));
    } finally {
      setLoading(false);
    }
  };

  // Check if the logged-in user is an admin
  const checkIfAdmin = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) throw error;

      // If the role is 'admin', redirect to the admin dashboard, else user dashboard
      if (data.role === "admin") {
        navigate("/admin"); 
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Error fetching user role. Please try again.");
    }
  };

  const handleSupabaseError = (message) => {
    switch (message) {
      case "Invalid login credentials":
        return "Incorrect email or password.";
      default:
        return "Something went wrong. Try again.";
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-cream">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4 text-center text-forest">
          Login
        </h2>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-2 border border-gray-300 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-2 border border-gray-300 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-forest text-white p-2 rounded hover:bg-orange disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        <p className="mt-4 text-center text-charcoal">
          Don't have an account?{" "}
          <Link to="/register" className="text-orange hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
