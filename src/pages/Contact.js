import React from "react";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import { useState } from "react";
import { supabase } from "../supabase";

const Contact = () => {
  const [email, setEmail] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalType, setModalType] = useState(""); 

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setLoading(true);

    const cleanedEmail = email.trim().toLowerCase();

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

      const responseText = await resendRes.text();
      console.log("Resend Response:", resendRes.status, responseText);

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
    <div className=" bg-cream w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[300px] md:h-[400px]">
        <img
          src="/contact.jpg"
          alt="Contact Banner"
          className="w-full h-full object-fill"
        />
      </section>
      <div className="px-6 py-12 max-w-7xl mx-auto text-charcoal bg-cream">
        {/* Contact Options */}
        <section className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-cream p-6 rounded-2xl shadow-md text-center">
            <h2 className="text-xl font-semibold mb-1 text-forest">
              📞 Call Us
            </h2>
            <p className="text-base">+880-XXXX-XXXXXX</p>
            <p className="text-sm text-charcoal">
              Available every day, 10 AM – 10 PM
            </p>
          </div>
          <div className="bg-cream p-6 rounded-2xl shadow-md text-center">
            <h2 className="text-xl font-semibold mb-1 text-forest">
              ✉️ Email Us
            </h2>
            <p className="text-base">support@boltuskitchen.com</p>
            <p className="text-sm text-charcoal">
              We usually reply within a few hours
            </p>
          </div>
          <div className="bg-cream p-6 rounded-2xl shadow-md text-center">
            <h2 className="text-xl font-semibold mb-1 text-forest">
              📍 Visit Us
            </h2>
            <p className="text-base">Level Up Tower, Gulshan, Dhaka</p>
            <p className="text-sm text-charcoal">Pickups by appointment only</p>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="bg-cream w-full py-16 px-6 md:px-12">
          <div className="max-w-6xl mx-auto flex flex-col items-center justify-center text-center space-y-10">
            <div className="w-full md:w-2/3 space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-forest">
                Stay Hungry, Stay Updated
              </h2>
              <p className="text-lg text-charcoal">
                Subscribe to Boltu’s Kitchen for fresh recipes, special deals,
                and more.
              </p>

              <form
                onSubmit={handleSubscribe}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
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

              <a
                href="/menu"
                className="inline-block text-forest hover:text-orange font-medium"
              >
                View Our Menu →
              </a>
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

        <section className="my-12">
          <h2 className="text-2xl font-bold mb-4 text-forest text-center">
            Frequently Asked Questions
          </h2>
          <ul className="max-w-2xl mx-auto space-y-4 text-left text-charcoal">
            <li>
              <strong>How long does delivery take?</strong>
              <br />
              Usually 30–45 minutes depending on location and traffic.
            </li>
            <li>
              <strong>Can I customize my order?</strong>
              <br />
              Yes! Use the “Special Instructions” field at checkout.
            </li>
            <li>
              <strong>Do you cater for events?</strong>
              <br />
              Yes — drop us a message and we’ll plan something special for your
              event!
            </li>
          </ul>
        </section>

        <section className="text-center my-12">
          <h2 className="text-2xl font-bold mb-4 text-forest">
            Meet Our Support Team
          </h2>
          <p className="text-charcoal mb-6">Real people, ready to help you.</p>
          <div className="flex justify-center gap-6 flex-wrap">
            <div className="w-48 text-center">
              <img
                src="/Nila.jpg"
                alt="Nila - Customer Care"
                className="rounded-full mb-2"
              />
              <p className="font-semibold text-charcoal">Nila</p>
              <p className="text-sm text-gray-500">Customer Care</p>
            </div>
            <div className="w-48 text-center">
              <img
                src="/Rahim.png"
                alt="Rahim - Catering Manager"
                className="rounded-full mb-2"
              />
              <p className="font-semibold text-charcoal">Rahim</p>
              <p className="text-sm text-gray-500">Catering Manager</p>
            </div>
          </div>
        </section>

        {/* Business Hours */}
        <section className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-2 text-forest">Opening Hours</h2>
          <p>Monday – Friday: 10:00 AM – 10:00 PM</p>
          <p>Saturday – Sunday: 12:00 PM – 11:00 PM</p>
        </section>

        {/* Social Media */}
        <section className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-forest">Follow Us</h2>
          <div className="flex justify-center space-x-4 text-xl text-forest">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange transition"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange transition"
            >
              <FaInstagram />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange transition"
            >
              <FaTwitter />
            </a>
          </div>
          <p className="text-sm mt-2 text-charcoal">
            Follow us for daily specials and behind-the-scenes fun!
          </p>
        </section>
      </div>
    </div>
  );
};

export default Contact;
