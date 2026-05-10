const nodemailer = require('nodemailer');

/**
 * Send an email using Nodemailer
 * @param {Object} options - { to, subject, html }
 */
const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"GroceryGo" <${process.env.SMTP_EMAIL}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Generate a password reset email HTML
 */
const generateResetEmailHtml = (name, resetUrl) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #16a34a, #22c55e); padding: 30px; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0;">🛒 GroceryGo</h1>
    </div>
    <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
      <h2 style="color: #111827;">Hi ${name},</h2>
      <p style="color: #6b7280;">You requested a password reset. Click the button below to set a new password. This link expires in <strong>10 minutes</strong>.</p>
      <a href="${resetUrl}" style="display: inline-block; background: #16a34a; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">
        Reset Password
      </a>
      <p style="color: #9ca3af; font-size: 13px;">If you didn't request this, please ignore this email.</p>
    </div>
  </div>
`;

module.exports = { sendEmail, generateResetEmailHtml };
