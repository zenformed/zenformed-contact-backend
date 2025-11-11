// netlify/functions/contact.js

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  // Parse form body (standard form POST from your <form>)
  const params = new URLSearchParams(event.body || "");

  const name = params.get("name") || "";
  const email = params.get("email") || "";
  const phone = params.get("phone") || "";
  const message = params.get("message") || "";

  if (!email || !message) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Email and message are required." }),
    };
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const CONTACT_RECIPIENT =
    process.env.CONTACT_RECIPIENT || "dhenderson@zenformed.com";
  const CONTACT_FROM =
    process.env.CONTACT_FROM || "Zenformed Contact <hello@mail.zenformed.com>";

  if (!RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY env var");
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Email service not configured." }),
    };
  }

  // Build email payload for Resend
  const emailPayload = {
    from: CONTACT_FROM,
    to: CONTACT_RECIPIENT,
    subject: "New message from Zenformed.com",
    reply_to: email,
    text: `
Name: ${name || "(not provided)"}
Email: ${email}
Phone: ${phone || "(not provided)"}

Message:
${message}
    `.trim(),
    html: `
      <h2>New message from Zenformed.com</h2>
      <p><strong>Name:</strong> ${name || "(not provided)"}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || "(not provided)"}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br>")}</p>
    `,
  };

  try {
    const apiResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error("Resend API error:", apiResponse.status, errorText);

      return {
        statusCode: 502,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Failed to send email." }),
      };
    }

    // On success, redirect back to your thank-you page
    return {
      statusCode: 303,
      headers: {
        Location: "https://zenformed.com/thank-you.html",
      },
      body: "",
    };
  } catch (err) {
    console.error("Contact function error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Unexpected server error." }),
    };
  }
};
