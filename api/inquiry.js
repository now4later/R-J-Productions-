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
      business,
      type,
      inquiryType,
      message
    } = req.body || {};

    const finalInquiryType = inquiryType || type || "General Information";

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
      subject: `R&J Productions Inquiry: ${finalInquiryType}`,
      text: [
        "R&J PRODUCTIONS WEBSITE INQUIRY",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || "Not provided"}`,
        `Business Name: ${business || "Not provided"}`,
        `Inquiry Type: ${finalInquiryType}`,
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