require("dotenv").config();

const express = require("express");
const cors = require("cors");


const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Email validation helper
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);


//Send Newsletter Welcome Email

app.post("/api/send-newsletter", async (req, res) => {
  const { email } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Boltu's Kitchen <onboarding@resend.dev>",
        to: email,
        subject: "Welcome to Boltu's Kitchen!",
        html: "<h2>Thanks for subscribing!</h2><p>Get ready for delicious updates!</p>",
      }),
    });

    const responseBody = await resendResponse.text();

    console.log("Newsletter Email Status:", resendResponse.status);
    console.log("Newsletter Response Body:", responseBody);

    if (!resendResponse.ok) {
      return res.status(500).json({ error: responseBody });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error sending newsletter email:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Send Order Confirmation Email

app.post("/api/send-confirmation", async (req, res) => {
  const { email, name, orderId, total, items } = req.body;

  if (!email || !isValidEmail(email) || !orderId) {
    return res.status(400).json({ error: "Missing or invalid fields" });
  }

  // Generate HTML table for order items
  const orderItemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 4px 8px;">${item.title}</td>
        <td style="padding: 4px 8px;">${item.quantity}</td>
        <td style="padding: 4px 8px;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const emailHtml = `
    <h2>Thank you, ${name}!</h2>
    <p>Your order <strong>(ID: ${orderId})</strong> has been successfully placed.</p>
    <p>Here’s a summary of your order:</p>
    <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 4px 8px;">Item</th>
          <th style="text-align: left; padding: 4px 8px;">Qty</th>
          <th style="text-align: left; padding: 4px 8px;">Price</th>
        </tr>
      </thead>
      <tbody>${orderItemsHtml}</tbody>
    </table>
    <p><strong>Total: $${total.toFixed(2)}</strong></p>
    <br>
    <p>We'll start cooking right away 🍽️</p>
    <p>- Boltu's Kitchen Team</p>
  `;

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Boltu's Kitchen <onboarding@resend.dev>",
        to: email,
        subject: "Your Order is Confirmed!",
        html: emailHtml,
      }),
    });

    const responseBody = await resendResponse.text();

    console.log("Confirmation Email Status:", resendResponse.status);
    console.log("Confirmation Response Body:", responseBody);

    if (!resendResponse.ok) {
      return res.status(500).json({ error: responseBody });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error sending confirmation email:", err.message);
    res.status(500).json({ error: err.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
