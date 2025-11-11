// netlify/functions/contact.js

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const params = new URLSearchParams(event.body || "");
  const name = params.get("name");
  const email = params.get("email");
  const message = params.get("message");

  console.log("Contact submission:", { name, email, message });

  // For now, just confirm receipt
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ success: true, message: "Form received!" }),
  };
};
