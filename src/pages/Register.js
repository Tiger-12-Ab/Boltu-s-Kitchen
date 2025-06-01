import React, { useState } from "react";
import { supabase } from "../supabase";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Sign up the user
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      const user = data?.user;
      if (!user) throw new Error("User registration failed.");

      // 2. Handle profile photo
      let uploadedPhotoURL = "https://gbvubhdzxhqumusfkqmm.supabase.co/storage/v1/object/public/avatars/avatars/user.jpg"; 

      if (photo) {
        const fileExt = photo.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, photo);

        if (uploadError) throw uploadError;

        const { data: publicURLData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        uploadedPhotoURL = publicURLData.publicUrl;
      }

      // 3. Insert user profile data
      const { error: dbError } = await supabase.from("users").insert([
        {
          id: user.id,
          first_name: firstName,
          last_name: lastName,
          email: user.email,
          phone,
          address,
          photo_url: uploadedPhotoURL,
        },
      ]);

      if (dbError) throw dbError;

      navigate("/dashboard");
    } catch (err) {
      console.error("Registration error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-cream">
      <form
        onSubmit={handleRegister}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center text-forest">Register</h2>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          className="w-full mb-4 p-2 border border-gray-300 rounded"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          className="w-full mb-4 p-2 border border-gray-300 rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mb-4 p-2 border border-gray-300 rounded"
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="w-full mb-4 p-2 border border-gray-300 rounded"
        />
        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          className="w-full mb-4 p-2 border border-gray-300 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full mb-4 p-2 border border-gray-300 rounded"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files[0])}
          className="w-full mb-4"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-forest text-white p-2 rounded hover:bg-orange disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="mt-4 text-center text-charcoal">
          Already a user?{" "}
          <Link to="/login" className="text-orange hover:underline">
            Log In
          </Link>
        </p>
      </form>
    </div>
  );
}
