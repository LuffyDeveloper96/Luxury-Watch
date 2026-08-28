import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

// Create Nodemailer Transporter
const createTransporter = () => {
  const host = env.EMAIL_HOST || process.env.EMAIL_HOST;
  const port = env.EMAIL_PORT || process.env.EMAIL_PORT || 587;
  const user = env.EMAIL_USER || process.env.EMAIL_USER;
  const pass = env.EMAIL_PASSWORD || process.env.EMAIL_PASSWORD;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: { user, pass },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000
    });
  }
  return null;
};

// Luxury Watch Branded HTML Email Wrapper
const renderLuxuryEmail = ({ title, preheader, contentHtml }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #111827; border: 1px solid #2d3748; border-radius: 8px; overflow: hidden; }
    .header { background: linear-gradient(180deg, #1f2937 0%, #111827 100%); padding: 30px 20px; text-align: center; border-bottom: 2px solid #d4af37; }
    .brand-title { color: #f3e5ab; font-size: 24px; font-weight: bold; letter-spacing: 4px; margin: 0; text-transform: uppercase; }
    .brand-tagline { color: #94a3b8; font-size: 11px; letter-spacing: 2px; margin-top: 6px; text-transform: uppercase; }
    .body-content { padding: 35px 30px; color: #e2e8f0; line-height: 1.6; font-size: 15px; }
    .gold-box { background: rgba(212, 175, 55, 0.08); border: 1px solid #d4af37; padding: 20px; border-radius: 6px; margin: 25px 0; text-align: center; }
    .otp-code { font-size: 34px; font-weight: bold; letter-spacing: 8px; color: #f3e5ab; margin: 10px 0; font-family: monospace; }
    .footer { background-color: #0b0f19; padding: 25px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1f2937; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="brand-title">LUXURY WATCH</h1>
      <div class="brand-tagline">TIMELESS WATCHES. EXCEPTIONAL VALUE.</div>
    </div>
    <div class="body-content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p>Luxury Watch Haute Horlogerie Atelier • Pan-India Insured Armoured Transit</p>
      <p style="margin-top: 8px;">If you did not initiate this request, please contact our 24/7 Concierge at concierge@luxurywatch.com</p>
    </div>
  </div>
</body>
</html>
`;

export const emailService = {
  /**
   * Send 6-Digit Email OTP
   */
  sendOtpEmail: async (email, otp, name = '') => {
    const cleanEmail = email.trim().toLowerCase();
    const recipientName = name ? name : 'Distinguished Patron';

    const contentHtml = `
      <h2 style="color: #f8fafc; font-size: 18px; margin-top: 0;">Verification Code</h2>
      <p>Dear ${recipientName},</p>
      <p>Please use the one-time verification code below to authenticate your Luxury Watch session:</p>
      <div class="gold-box">
        <div style="font-size: 12px; letter-spacing: 2px; color: #94a3b8; text-transform: uppercase;">One-Time Password</div>
        <div class="otp-code">${otp}</div>
        <div style="font-size: 12px; color: #94a3b8;">Valid for 5 minutes • Single-use security code</div>
      </div>
      <p style="font-size: 13px; color: #94a3b8;"><strong>Security Notice:</strong> Never share this code with anyone. Luxury Watch Concierge staff will never request your code.</p>
      <p style="font-size: 13px; color: #64748b;">If you did not request this verification code, please disregard this email.</p>
    `;

    const plainText = `LUXURY WATCH — Verification Code\n\nDear ${recipientName},\n\nYour one-time verification code is: ${otp}\n\nThis code is valid for 5 minutes. Never share this code with anyone.\n\nLuxury Watch Concierge`;

    const html = renderLuxuryEmail({
      title: 'Luxury Watch — Your Verification Code',
      preheader: `Your verification code is ${otp}`,
      contentHtml
    });

    const transporter = createTransporter();
    if (transporter) {
      try {
        await transporter.sendMail({
          from: env.EMAIL_FROM || process.env.EMAIL_FROM || '"LUXURY WATCH Concierge" <concierge@luxurywatch.com>',
          to: cleanEmail,
          subject: `[LUXURY WATCH] Your Verification Code: ${otp}`,
          text: plainText,
          html
        });
        return { success: true, method: 'smtp' };
      } catch (err) {
        console.warn('⚠️ [EmailService] SMTP Dispatch note: Unable to deliver email via SMTP.');
        if (process.env.NODE_ENV !== 'production') {
          return { success: true, method: 'dev_mock', note: err.message };
        }
        return { success: false, method: 'smtp_failed', error: 'Email dispatch failed' };
      }
    }

    // In development mode only when SMTP credentials are not configured
    if (process.env.NODE_ENV !== 'production') {
      return { success: true, method: 'dev_mock' };
    }

    return { success: false, method: 'smtp_unconfigured', error: 'SMTP is not configured' };
  },

  /**
   * Send Order Confirmation Email
   */
  sendOrderConfirmationEmail: async (order) => {
    const customer = order.customer || {};
    const itemsHtml = (order.items || []).map(item => `
      <tr style="border-bottom: 1px solid #1f2937;">
        <td style="padding: 10px 0; color: #f8fafc;">${item.name} <span style="color: #94a3b8;">(x${item.quantity})</span></td>
        <td style="padding: 10px 0; text-align: right; color: #f3e5ab;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    const contentHtml = `
      <h2 style="color: #f8fafc; font-size: 18px; margin-top: 0;">Consignment Confirmation #${order.id}</h2>
      <p>Dear ${customer.fullName || 'Distinguished Collector'},</p>
      <p>Thank you for your order with Luxury Watch. Your timepiece allocation has been confirmed and registered for insured express transit.</p>
      
      <div style="background: #1f2937; padding: 20px; border-radius: 6px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          ${itemsHtml}
          <tr>
            <td style="padding: 12px 0 4px; font-weight: bold; color: #ffffff;">Total Amount Paid</td>
            <td style="padding: 12px 0 4px; text-align: right; font-weight: bold; color: #d4af37; font-size: 16px;">₹${(order.total || 0).toLocaleString('en-IN')}</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 13px;"><strong>Consignment Tracking ID:</strong> ${order.trackingNumber || 'Available upon dispatch'}<br/>
      <strong>Insured Courier Tier:</strong> ${order.courierTier || 'Securitas Armoured Express'}<br/>
      <strong>Destination:</strong> ${customer.address}, ${customer.city}, ${customer.state} - ${customer.postalCode}</p>
    `;

    const html = renderLuxuryEmail({
      title: `Luxury Watch — Order Confirmation #${order.id}`,
      preheader: `Your order #${order.id} is confirmed.`,
      contentHtml
    });

    const transporter = createTransporter();
    if (transporter && customer.email) {
      try {
        await transporter.sendMail({
          from: env.EMAIL_FROM || process.env.EMAIL_FROM || '"LUXURY WATCH Concierge" <concierge@luxurywatch.com>',
          to: customer.email,
          subject: `[LUXURY WATCH] Allocation Confirmed: Order #${order.id}`,
          html
        });
      } catch (err) {
        console.warn('[EmailService] Order confirmation email note:', err.message);
      }
    }
  }
};

export default emailService;
