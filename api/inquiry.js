const nodemailer = require("nodemailer");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed"
    });
  }

  try {
    const {
      name,
      email,
      phone,
      inquiryType,
      message
    } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({
        ok: false,
        error: "Name, email, and message are required."
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.INQUIRY_TO_EMAIL || process.env.SMTP_USER,
      subject: `R&J Productions Inquiry: ${inquiryType || "General Information"}`,
      text: [
        "R&J PRODUCTIONS WEBSITE INQUIRY",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || "Not provided"}`,
        `Inquiry Type: ${inquiryType || "General Information"}`,
        "",
        "Message:",
        message
      ].join("\n")
    });

    return res.status(200).json({
      ok: true,
      message: "Inquiry sent successfully."
    });

  } catch (error) {
    console.error("EMAIL ERROR:", error);

    return res.status(500).json({
      ok: false,
      error: "Unable to send your message right now."
    });
  }
};
