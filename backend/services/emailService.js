import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { Order } from '../models/Order.js';

let customTransporter = null;

/**
 * Creates Nodemailer Transporter using Gmail SMTP credentials
 * Reads process.env.EMAIL_USER and process.env.EMAIL_APP_PASSWORD
 */
const createTransporter = () => {
  if (customTransporter) {
    return customTransporter;
  }

  const user = (process.env.EMAIL_USER || env.EMAIL_USER || '').trim();
  const pass = (process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD || env.EMAIL_APP_PASSWORD || env.EMAIL_PASSWORD || '').trim();

  if (user && pass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      pool: true,
      maxConnections: 3,
      maxMessages: 50,
      rateDelta: 1000,
      rateLimit: 5,
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000
    });
  }

  return null;
};

/**
 * Formats a currency amount into standard Indian Rupee notation (₹XX,XXX)
 */
const formatInr = (amount) => {
  const num = Number(amount) || 0;
  return `₹${num.toLocaleString('en-IN')}`;
};

/**
 * Formats ISO date to readable luxury format (e.g. 11 Sep 2026, 05:30 PM IST)
 */
const formatLuxuryDate = (dateVal) => {
  try {
    const d = dateVal ? new Date(dateVal) : new Date();
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Confirmed Today';
  }
};/**
 * Builds responsive Luxury Watch branded HTML email
 */
const buildLuxuryOrderEmailHtml = ({ order, trackingUrl, formattedDate }) => {
  const customer = order.customer || {};
  const items = Array.isArray(order.items) ? order.items : [];
  const discountAmount = Number(order.discountAmount) || 0;
  const shippingFee = Number(order.shippingFee) || 0;
  const subtotal = Number(order.subtotal) || 0;
  const total = Number(order.total) || 0;
  const couponCode = order.appliedCoupon?.code || (typeof order.appliedCoupon === 'string' ? order.appliedCoupon : null);

  const patronName = (customer.fullName || 'Valued Patron').trim();
  const canonicalOrderStatus = (order.orderStatus === 'Confirmed' || !order.orderStatus)
    ? 'Order Confirmed'
    : order.orderStatus;
  const paymentStatusText = (order.paymentStatus || 'Paid').toUpperCase();
  const paymentMethodText = order.paymentMethod ? String(order.paymentMethod).toUpperCase() : 'RAZORPAY';

  const itemsRowsHtml = items.map((item, idx) => {
    const itemQty = Number(item.quantity) || 1;
    const itemPrice = Number(item.price) || 0;
    const lineTotal = itemPrice * itemQty;
    const borderStyle = idx === items.length - 1 ? '' : 'border-bottom: 1px solid #1f293d;';

    return `
      <tr style="${borderStyle}">
        <td style="padding: 14px 0; vertical-align: top;">
          <div style="font-weight: 600; color: #f8fafc; font-size: 14px; letter-spacing: 0.02em;">
            ${item.name || 'Haute Horlogerie Timepiece'}
          </div>
          <div style="font-size: 12px; color: #94a3b8; margin-top: 3px;">
            ${item.brand ? `<span style="color: #d4af37; font-weight: 500;">${item.brand}</span> &bull; ` : ''}
            Qty: <strong style="color: #e2e8f0;">${itemQty}</strong> &bull; Unit Price: ${formatInr(itemPrice)}
            ${item.selectedColor ? ` &bull; Dial: ${item.selectedColor}` : ''}
            ${item.selectedStrap ? ` &bull; Strap: ${item.selectedStrap}` : ''}
          </div>
        </td>
        <td style="padding: 14px 0; text-align: right; vertical-align: top; font-weight: 600; color: #f3e5ab; font-size: 14px; white-space: nowrap;">
          ${formatInr(lineTotal)}
        </td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Luxury Watch — ${canonicalOrderStatus} #${order.id}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #080c14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; }
    img { border: 0; outline: none; text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; border-radius: 0 !important; }
      .content-cell { padding: 24px 16px !important; }
      .header-cell { padding: 24px 16px !important; }
      .button-cta { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #080c14; color: #f8fafc;">
  <!-- Outer Wrapper -->
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #080c14; padding: 24px 0;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table class="container" width="600" border="0" cellpadding="0" cellspacing="0" style="width: 600px; max-width: 600px; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 8px; overflow: hidden; box-shadow: 0 12px 36px rgba(0,0,0,0.5);">
          
          <!-- Header Banner -->
          <tr>
            <td class="header-cell" style="background: linear-gradient(180deg, #131d33 0%, #0f172a 100%); padding: 36px 30px 28px; text-align: center; border-bottom: 2px solid #d4af37;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="font-size: 10px; font-weight: 700; letter-spacing: 4px; color: #d4af37; text-transform: uppercase; margin-bottom: 6px;">
                      HAUTE HORLOGERIE ATELIER
                    </div>
                    <div style="font-size: 26px; font-weight: 800; letter-spacing: 5px; color: #ffffff; text-transform: uppercase; margin: 0; text-shadow: 0 2px 8px rgba(0,0,0,0.4);">
                      LUXURY WATCH
                    </div>
                    <div style="font-size: 11px; letter-spacing: 2px; color: #94a3b8; text-transform: uppercase; margin-top: 6px;">
                      TIMELESS WATCHES. EXCEPTIONAL VALUE.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content Area -->
          <tr>
            <td class="content-cell" style="padding: 36px 32px 28px;">
              
              <!-- Order Status Badge -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td>
                    <div style="display: inline-block; background-color: rgba(212, 175, 55, 0.12); border: 1px solid #d4af37; color: #f3e5ab; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; padding: 6px 14px; border-radius: 20px;">
                      &bull; ${canonicalOrderStatus.toUpperCase()}
                    </div>
                    <h1 style="font-size: 22px; font-weight: 700; color: #f8fafc; margin: 16px 0 6px; letter-spacing: 0.02em;">
                      Consignment #${order.id} ${canonicalOrderStatus}
                    </h1>
                    <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin: 0;">
                      Dear <strong style="color: #f8fafc;">${patronName}</strong>,<br/>
                      Thank you for choosing Luxury Watch. Your timepiece allocation has been officially registered, verified, and placed into queue for insured armored transit.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Order & Payment Metadata Card -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #131c2e; border: 1px solid #1e293b; border-radius: 6px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <table width="100%" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" style="font-size: 12px; color: #94a3b8; padding-bottom: 8px;">
                          Order Reference:<br/>
                          <strong style="color: #f8fafc; font-size: 13px;">${order.id}</strong>
                        </td>
                        <td width="50%" style="font-size: 12px; color: #94a3b8; text-align: right; padding-bottom: 8px;">
                          Date & Time:<br/>
                          <strong style="color: #f8fafc; font-size: 13px;">${formattedDate}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" style="font-size: 12px; color: #94a3b8;">
                          Payment Status:<br/>
                          <strong style="color: #4ade80; font-size: 13px;">${paymentStatusText}</strong> <span style="font-size: 11px; color: #94a3b8;">(${paymentMethodText} Secure)</span>
                        </td>
                        <td width="50%" style="font-size: 12px; color: #94a3b8; text-align: right;">
                          Order Status:<br/>
                          <strong style="color: #f3e5ab; font-size: 13px;">${canonicalOrderStatus}</strong>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Ordered Items Section -->
              <div style="font-size: 12px; font-weight: 700; letter-spacing: 1.5px; color: #d4af37; text-transform: uppercase; margin-bottom: 12px;">
                ORDERED TIMEPIECES (${items.length})
              </div>

              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #131c2e; border: 1px solid #1e293b; border-radius: 6px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 10px 20px;">
                    <table width="100%" border="0" cellpadding="0" cellspacing="0">
                      ${itemsRowsHtml}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Authoritative Financial Breakdown -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #131c2e; border: 1px solid #1e293b; border-radius: 6px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 13px;">
                      <tr>
                        <td style="padding: 5px 0; color: #94a3b8;">Subtotal</td>
                        <td style="padding: 5px 0; text-align: right; color: #f8fafc; font-weight: 500;">${formatInr(subtotal)}</td>
                      </tr>
                      ${discountAmount > 0 ? `
                      <tr>
                        <td style="padding: 5px 0; color: #4ade80;">VIP Privilege Discount ${couponCode ? `(${couponCode})` : ''}</td>
                        <td style="padding: 5px 0; text-align: right; color: #4ade80; font-weight: 500;">-${formatInr(discountAmount)}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 5px 0; color: #94a3b8;">Insured Armoured Transit</td>
                        <td style="padding: 5px 0; text-align: right; color: #f8fafc; font-weight: 500;">
                          ${shippingFee > 0 ? formatInr(shippingFee) : '<span style="color: #4ade80;">COMPLIMENTARY</span>'}
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding: 10px 0 4px; border-top: 1px solid #1f293d;"></td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #ffffff; font-weight: 700; font-size: 15px;">Final Total Paid</td>
                        <td style="padding: 4px 0; text-align: right; color: #d4af37; font-weight: 800; font-size: 18px;">${formatInr(total)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Shipping / Consignment Destination -->
              <div style="font-size: 12px; font-weight: 700; letter-spacing: 1.5px; color: #d4af37; text-transform: uppercase; margin-bottom: 12px;">
                DELIVERY DESTINATION
              </div>

              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #131c2e; border: 1px solid #1e293b; border-radius: 6px; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 18px 20px; font-size: 13px; line-height: 1.6; color: #cbd5e1;">
                    <strong style="color: #f8fafc; font-size: 14px;">${customer.fullName || 'Valued Patron'}</strong><br/>
                    ${customer.address || ''}<br/>
                    ${customer.city ? `${customer.city}, ` : ''}${customer.state ? `${customer.state} ` : ''}${customer.postalCode ? `- ${customer.postalCode}` : ''}<br/>
                    ${customer.country || 'India'}<br/>
                    ${customer.phone ? `<span style="color: #94a3b8;">Contact: ${customer.phone}</span><br/>` : ''}
                    <span style="font-size: 12px; color: #d4af37;">Courier Tier: ${order.courierTier || (shippingFee > 0 ? 'Securitas Armoured Express (Insured)' : 'BlueDart Insured Air Express')}</span>
                  </td>
                </tr>
              </table>

              <!-- Track Order Call To Action Button -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="${trackingUrl}" class="button-cta" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #b8972e 100%); color: #0b0f19; font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; text-decoration: none; padding: 15px 36px; border-radius: 4px; box-shadow: 0 4px 14px rgba(212, 175, 55, 0.35);">
                      TRACK YOUR CONSIGNMENT &rarr;
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 10px;">
                    <span style="font-size: 11px; color: #64748b;">
                      Direct Link: <a href="${trackingUrl}" style="color: #94a3b8; text-decoration: underline;">${trackingUrl}</a>
                    </span>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer Area -->
          <tr>
            <td style="background-color: #0a0f1d; padding: 24px 30px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.6; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 6px; color: #94a3b8; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">
                LUXURY WATCH HAUTE HORLOGERIE ATELIER
              </p>
              <p style="margin: 0 0 8px;">
                Direct Atelier Allocations &bull; Pan-India Insured Armoured Transit &bull; Authenticity Certificate Guarantee
              </p>
              <p style="margin: 0;">
                For bespoke inquiries or consignment updates, our 24/7 Concierge is at your service at <a href="mailto:concierge@luxurywatch.com" style="color: #d4af37; text-decoration: none;">concierge@luxurywatch.com</a>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

/**
 * Builds clean plain-text fallback version for mail clients without HTML support
 */
const buildLuxuryOrderEmailText = ({ order, trackingUrl, formattedDate }) => {
  const customer = order.customer || {};
  const items = Array.isArray(order.items) ? order.items : [];
  const discountAmount = Number(order.discountAmount) || 0;
  const shippingFee = Number(order.shippingFee) || 0;
  const subtotal = Number(order.subtotal) || 0;
  const total = Number(order.total) || 0;
  const couponCode = order.appliedCoupon?.code || (typeof order.appliedCoupon === 'string' ? order.appliedCoupon : null);

  const patronName = customer.fullName || 'Valued Patron';
  const canonicalOrderStatus = (order.orderStatus === 'Confirmed' || !order.orderStatus)
    ? 'Order Confirmed'
    : order.orderStatus;
  const paymentStatusText = (order.paymentStatus || 'Paid').toUpperCase();
  const paymentMethodText = order.paymentMethod ? String(order.paymentMethod).toUpperCase() : 'RAZORPAY';

  const itemsText = items.map((item, idx) => {
    const itemQty = Number(item.quantity) || 1;
    const itemPrice = Number(item.price) || 0;
    const lineTotal = itemPrice * itemQty;
    return `${idx + 1}. ${item.name || 'Timepiece'}${item.brand ? ` (${item.brand})` : ''} - Qty: ${itemQty} x ${formatInr(itemPrice)} = ${formatInr(lineTotal)}`;
  }).join('\n');

  return `LUXURY WATCH — HAUTE HORLOGERIE
CONSIGNMENT ALLOCATION CONFIRMATION
===============================================================

Dear ${patronName},

Thank you for choosing Luxury Watch. Your timepiece allocation has been officially registered, verified, and placed into queue for insured express transit.

ORDER DETAILS:
- Order Reference: ${order.id}
- Order Date: ${formattedDate}
- Payment Status: ${paymentStatusText} (${paymentMethodText} Secure Verification)
- Order Status: ${canonicalOrderStatus}

ORDERED TIMEPIECES:
${itemsText || 'Timepiece Allocation'}

FINANCIAL BREAKDOWN:
- Subtotal: ${formatInr(subtotal)}
${discountAmount > 0 ? `- VIP Privilege Discount: -${formatInr(discountAmount)} ${couponCode ? `(Coupon: ${couponCode})` : ''}\n` : ''}- Insured Armoured Transit: ${shippingFee > 0 ? formatInr(shippingFee) : 'COMPLIMENTARY'}
---------------------------------------------------------------
FINAL TOTAL PAID: ${formatInr(total)}

DELIVERY DESTINATION:
${patronName}
${customer.address || ''}
${customer.city || ''}, ${customer.state || ''} - ${customer.postalCode || ''}
${customer.country || 'India'}
${customer.phone ? `Phone: ${customer.phone}\n` : ''}Courier Tier: ${order.courierTier || (shippingFee > 0 ? 'Securitas Armoured Express (Insured)' : 'BlueDart Insured Air Express')}

TRACK YOUR CONSIGNMENT:
${trackingUrl}

===============================================================
Luxury Watch Haute Horlogerie Atelier
Pan-India Insured Armoured Transit • Authenticity Certificate Guarantee
Concierge Support: concierge@luxurywatch.com
`;
};

export const emailService = {
  /**
   * Set custom transporter (used for stubbing/testing without real SMTP calls)
   */
  setTransporter: (transporter) => {
    customTransporter = transporter;
  },

  /**
   * Reset to default transporter factory
   */
  resetTransporter: () => {
    customTransporter = null;
  },

  /**
   * Send Order Confirmation Email
   *
   * Exact Execution Sequence:
   * 1. Check if confirmationEmailSent is already permanently marked true -> Skip (duplicate prevented)
   * 2. Atomically acquire temporary dispatch lease lock (confirmationEmailLock)
   * 3. Validate recipient customer email format (no fake fallbacks)
   * 4. Construct luxury HTML & text fallback with authoritative order/payment values
   * 5. Dispatch via Gmail SMTP Transporter
   * 6. ONLY UPON SMTP ACCEPTANCE -> Atomically mark confirmationEmailSent=true and confirmationEmailSentAt=Date()
   * 7. ON SMTP FAILURE -> Release confirmationEmailLock, leave confirmationEmailSent=false (retryable), keep order intact.
   */
  sendOrderConfirmationEmail: async (order) => {
    let orderIdentifier = null;
    let lockAcquired = false;

    try {
      if (!order || (!order.id && !order._id)) {
        return { success: false, reason: 'INVALID_ORDER_OBJECT', message: 'Order document missing or invalid.' };
      }

      orderIdentifier = order.id || order._id?.toString();
      const customer = order.customer || {};
      const recipientEmail = (customer.email || '').trim().toLowerCase();

      // 1. Recipient Validation (Strictly use actual customer email, no fake fallback)
      if (!recipientEmail || !recipientEmail.includes('@') || !recipientEmail.includes('.')) {
        return {
          success: false,
          reason: 'MISSING_RECIPIENT_EMAIL',
          message: `No valid customer email address found for order #${orderIdentifier}.`
        };
      }

      // 2. Pre-check: Is email already permanently sent?
      const existingOrder = await Order.findOne({
        $or: [
          { id: orderIdentifier },
          ...(order._id ? [{ _id: order._id }] : [])
        ]
      }).lean();

      if (existingOrder?.confirmationEmailSent === true) {
        return {
          success: true,
          duplicatePrevented: true,
          message: `Confirmation email was already dispatched for order #${orderIdentifier}. Duplicate send skipped.`
        };
      }

      // 3. Concurrency-safe Dispatch Lease Lock (60-second lease to prevent simultaneous parallel sends)
      const lockTimeout = new Date(Date.now() - 60000);
      const lockDoc = await Order.findOneAndUpdate(
        {
          $and: [
            {
              $or: [
                { id: orderIdentifier },
                ...(order._id ? [{ _id: order._id }] : [])
              ]
            },
            { confirmationEmailSent: { $ne: true } },
            {
              $or: [
                { confirmationEmailLock: { $exists: false } },
                { confirmationEmailLock: null },
                { confirmationEmailLock: { $lt: lockTimeout } }
              ]
            }
          ]
        },
        {
          $set: {
            confirmationEmailLock: new Date()
          }
        },
        { returnDocument: 'after' }
      );

      if (!lockDoc) {
        return {
          success: true,
          duplicatePrevented: true,
          inFlight: true,
          message: `Email dispatch for order #${orderIdentifier} is currently in-flight or already completed.`
        };
      }

      lockAcquired = true;

      // 4. Sender Identity from environment variables
      const user = (process.env.EMAIL_USER || env.EMAIL_USER || '').trim();
      const fromName = (process.env.EMAIL_FROM_NAME || env.EMAIL_FROM_NAME || 'LUXURY WATCH Concierge').trim();
      const fromHeader = user ? `"${fromName}" <${user}>` : `"${fromName}" <concierge@luxurywatch.com>`;

      // 5. Construct Real Frontend Tracking URL
      const frontendBaseUrl = (process.env.FRONTEND_URL || env.FRONTEND_URL || 'https://luxurywatch2020.netlify.app').replace(/\/+$/, '');
      const trackingUrl = `${frontendBaseUrl}/orders?id=${encodeURIComponent(orderIdentifier)}`;
      const formattedDate = formatLuxuryDate(order.createdAt);

      // 6. Render Responsive HTML & Text Fallback with Canonical Status
      const html = buildLuxuryOrderEmailHtml({ order, trackingUrl, formattedDate });
      const text = buildLuxuryOrderEmailText({ order, trackingUrl, formattedDate });

      // 7. Verify Transporter
      const transporter = createTransporter();
      if (!transporter) {
        // Release lease lock if transporter not configured
        await Order.updateOne(
          { $or: [{ id: orderIdentifier }, ...(order._id ? [{ _id: order._id }] : [])] },
          { $set: { confirmationEmailLock: null } }
        );
        return {
          success: false,
          reason: 'TRANSPORTER_UNCONFIGURED',
          message: 'Email credentials not configured on this environment. Order confirmed successfully.'
        };
      }

      const canonicalOrderStatus = (order.orderStatus === 'Confirmed' || !order.orderStatus)
        ? 'Order Confirmed'
        : order.orderStatus;

      const mailOptions = {
        from: fromHeader,
        to: recipientEmail,
        subject: `[LUXURY WATCH] ${canonicalOrderStatus}: Consignment #${orderIdentifier}`,
        text,
        html
      };

      // 8. Attempt SMTP Dispatch
      const info = await transporter.sendMail(mailOptions);

      // 9. ATOMIC SUCCESS: Mark confirmationEmailSent=true ONLY after transporter accepts message
      await Order.updateOne(
        { $or: [{ id: orderIdentifier }, ...(order._id ? [{ _id: order._id }] : [])] },
        {
          $set: {
            confirmationEmailSent: true,
            confirmationEmailSentAt: new Date(),
            confirmationEmailLock: null
          }
        }
      );

      return {
        success: true,
        messageId: info?.messageId || 'sent',
        recipient: recipientEmail,
        orderId: orderIdentifier
      };
    } catch (err) {
      // 10. ATOMIC FAILURE RECOVERY: Release lease lock, confirmationEmailSent remains false (retryable)
      if (lockAcquired && orderIdentifier) {
        try {
          await Order.updateOne(
            { $or: [{ id: orderIdentifier }, ...(order?._id ? [{ _id: order._id }] : [])] },
            {
              $set: {
                confirmationEmailLock: null
              }
            }
          );
        } catch (unlockErr) {}
      }

      // Non-sensitive logging: never log email passwords or customer secrets
      console.warn(`[EmailService] Consignment confirmation dispatch note for order #${orderIdentifier || order?.id || 'unknown'}: ${err.message}`);
      return {
        success: false,
        reason: 'SEND_FAILED',
        error: err.message
      };
    }
  }
};

export default emailService;
