const nodemailer = require('nodemailer');

function isValidEmail(value) {
return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || '').toString());
}

function formatSubmittedAt() {
return new Date().toLocaleString('en-US', {
dateStyle: 'long',
timeStyle: 'short',
timeZone: process.env.INQUIRY_TIMEZONE || 'America/Chicago',
});
}

let cachedTransporter = null;

function getTransporter() {
if (cachedTransporter) return cachedTransporter;

cachedTransporter = nodemailer.createTransport({
host: process.env.SMTP_HOST,
port: Number(process.env.SMTP_PORT) || 587,
secure: process.env.SMTP_SECURE === 'true',
auth: {
user: process.env.SMTP_USER,
pass: process.env.SMTP_PASS,
},
});

return cachedTransporter;
}

const CONTACT_SUBJECT_BY_TYPE = {
'General Information': 'New R&J Productions Contact Inquiry',
'Concert Information': 'New R&J Productions Concert Inquiry',
'Sponsorship': 'New R&J Productions Sponsorship Inquiry',
'Donations': 'New R&J Productions Donation Inquiry',
'Vendors': 'New R&J Productions Vendor Inquiry (via Contact Form)',
'Food Trucks': 'New R&J Productions Food Truck Inquiry (via Contact Form)',
'Performers': 'New R&J Productions Performer Inquiry',
};

module.exports = async (req, res) => {
if (req.method !== 'POST') {
res.setHeader('Allow', 'POST');
return res.status(405).json({
ok: false,
error: 'Method not allowed.'
});
}

try {
const body = req.body || {};

const formType = (body.formType || '')
.toString()
.trim()
.toLowerCase();

const name = (body.name || '').toString().trim();
const email = (body.email || '').toString().trim();
const phone = (body.phone || '').toString().trim();
const message = (body.message || '').toString().trim();

if (!name || !email) {
return res.status(400).json({
ok: false,
error: 'Name and email are required.'
});
}

if (!isValidEmail(email)) {
return res.status(400).json({
ok: false,
error: 'Please enter a valid email address.'
});
}

const to = process.env.INQUIRY_TO_EMAIL;

if (!to) {
console.error('INQUIRY_TO_EMAIL is not set.');

return res.status(500).json({
ok: false,
error: 'Email is not configured yet.'
});
}

let subject;
let lines;

if (formType === 'vendor') {
const business = (body.business || '').toString().trim();
const businessType = (body.businessType || '').toString().trim();

subject = `New R&J Productions Vendor Inquiry — ${business || name}`;

lines = [
'Form: Vendor / Food Truck Inquiry',
`Name: ${name}`,
`Business Name: ${business || '—'}`,
`Email: ${email}`,
`Phone: ${phone || '—'}`,
`Business Type: ${businessType || '—'}`,
`Submitted: ${formatSubmittedAt()}`,
'',
'Message:',
message || '—',
];

} else if (formType === 'contact') {

if (!message) {
return res.status(400).json({
ok: false,
error: 'Please include a message.'
});
}

const inquiryType = (body.inquiryType || '')
.toString()
.trim();

subject =
CONTACT_SUBJECT_BY_TYPE[inquiryType] ||
'New R&J Productions Contact Inquiry';

lines = [
'Form: General Contact',
`Inquiry Type: ${inquiryType || 'General Information'}`,
`Name: ${name}`,
`Email: ${email}`,
`Phone: ${phone || '—'}`,
`Submitted: ${formatSubmittedAt()}`,
'',
'Message:',
message,
];

} else {
return res.status(400).json({
ok: false,
error: 'Unknown form type.'
});
}

const transporter = getTransporter();

await transporter.sendMail({
from: `"R&J Productions Website" <${process.env.SMTP_USER}>`,
to,
replyTo: email,
subject,
text: lines.join('\n'),
});

return res.status(200).json({
ok: true
});

} catch (err) {
console.error('Inquiry email failed:', err);

return res.status(500).json({
ok: false,
error: 'The email could not be sent. Please try again shortly.'
});
}
};
