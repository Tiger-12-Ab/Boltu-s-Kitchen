import React, { useState } from "react";
import { supabase } from "../supabase";
import { Link } from "react-router-dom";

const NewsletterCTA = () => {
  const [email, setEmail] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalType, setModalType] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setLoading(true);

    const cleanedEmail = email.trim().toLowerCase();
    setEmail(cleanedEmail);

    if (!cleanedEmail || !cleanedEmail.includes("@")) {
      alert("Please enter a valid email.");
      setLoading(false);
      return;
    }

    try {
      // 1. Insert into Supabase
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert([{ email: cleanedEmail }]);

      if (error) {
        if (
          error.code === "23505" ||
          error.message.toLowerCase().includes("duplicate")
        ) {
          setModalType("duplicate");
          setModalOpen(true);
          return;
        }
        throw new Error("Error saving email: " + error.message);
      }

      // 2. Send welcome email via Resend
      const resendRes = await fetch(
        "http://localhost:5000/api/send-newsletter",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: cleanedEmail }),
        }
      );

      if (!resendRes.ok) {
        throw new Error("Failed to send welcome email.");
      }

      // 3. Success Modal
      setModalType("new");
      setEmail("");
      setModalOpen(true);
    } catch (err) {
      alert(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-cream w-full py-16 px-6 md:px-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
        {/* Right: Image */}
        <div className="w-full md:w-1/2 flex justify-center md:order-2">
          <img
            src="/NewletterCTA.png"
            alt="Cartoon Chef"
            className="max-w-[300px] w-full"
          />
        </div>

        {/* Left: Text + Form */}
        <div className="w-full md:w-1/2 text-center md:text-left space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-forest">
            Stay Hungry, Stay Updated
          </h2>
          <p className="text-lg text-charcoal">
            Subscribe to Boltu’s Kitchen for fresh recipes, special deals, and
            more.
          </p>

          <form
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trimStart())}
              placeholder="Enter your email"
              className="px-4 py-3 rounded-lg w-full sm:w-auto flex-1 border border-forest focus:outline-none focus:ring-2 focus:ring-orange"
              disabled={loading}
            />
            <button
              type="submit"
              className={`bg-forest text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange transition ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Subscribe"}
            </button>
          </form>

          <Link
            to="/menu"
            className="inline-block text-forest hover:text-orange font-medium"
          >
            View Our Menu →
          </Link>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          aria-modal="true"
          role="dialog"
        >
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm text-center">
            {modalType === "new" && (
              <>
                <h3 className="text-forest text-2xl font-bold mb-2">
                  You're In!
                </h3>
                <p className="text-charcoal mb-4">
                  Thanks for subscribing to Boltu’s Kitchen!
                  <br /> Get ready for delicious updates.
                </p>
              </>
            )}

            {modalType === "duplicate" && (
              <>
                <h3 className="text-forest text-2xl font-bold mb-2">
                  You're Already Subscribed
                </h3>
                <p className="text-charcoal mb-4">
                  Looks like you’ve already joined our kitchen fam.
                  <br /> Keep an eye on your inbox for updates!
                </p>
              </>
            )}

            <button
              onClick={() => setModalOpen(false)}
              className="mt-2 px-6 py-2 bg-forest text-white rounded-lg hover:bg-orange transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default NewsletterCTA;
