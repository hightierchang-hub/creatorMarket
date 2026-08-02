const formatAmount = (amount, currency = "USD") =>
  `${currency === "USD" ? "$" : currency + " "}${Number(amount).toFixed(2)}`;

// One shared wrapper so every notification email looks consistent.
const layout = (title, bodyHtml) => `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1f2937;">
    <h2 style="margin: 0 0 16px; color: #111827;">${title}</h2>
    ${bodyHtml}
    <p style="margin-top: 32px; font-size: 12px; color: #9ca3af;">
      This is an automated message from FlipEarn. Please don't reply to this email.
    </p>
  </div>
`;

export const paymentPendingEmail = ({ buyerName, listingTitle, amount, currency }) => ({
  subject: `Payment pending - ${listingTitle}`,
  html: layout(
    "Payment Pending",
    `
      <p>Hi ${buyerName || "there"},</p>
      <p>We've received your order for <strong>${listingTitle}</strong> (${formatAmount(amount, currency)}).</p>
      <p>Your payment is currently <strong>pending confirmation</strong> from the payment provider. We'll email you as soon as it's confirmed - no action is needed from you right now.</p>
    `
  ),
});

export const paymentSuccessfulEmail = ({ buyerName, listingTitle, amount, currency }) => ({
  subject: `Payment successful - ${listingTitle}`,
  html: layout(
    "Payment Successful",
    `
      <p>Hi ${buyerName || "there"},</p>
      <p>Your payment of <strong>${formatAmount(amount, currency)}</strong> for <strong>${listingTitle}</strong> was successful and has been marked as <strong>paid</strong>.</p>
      <p>You can view your order and message the seller anytime from "My Orders".</p>
    `
  ),
});

export const listingSoldEmail = ({ sellerName, listingTitle, amount, currency }) => ({
  subject: `Your listing sold - ${listingTitle}`,
  html: layout(
    "Your Listing Just Sold! 🎉",
    `
      <p>Hi ${sellerName || "there"},</p>
      <p>Great news - your listing <strong>${listingTitle}</strong> just sold for <strong>${formatAmount(amount, currency)}</strong>.</p>
      <p>The amount has been added to your earnings balance. You can request a withdrawal anytime from your dashboard.</p>
    `
  ),
});

export const adminSaleNotificationEmail = ({ listingTitle, amount, currency, buyerName, buyerEmail, sellerName, sellerEmail, paymentMethod }) => ({
  subject: `New sale - ${listingTitle} (${formatAmount(amount, currency)})`,
  html: layout(
    "New Sale on FlipEarn",
    `
      <p>A listing just sold.</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
        <tr><td style="padding: 4px 0; color: #6b7280;">Listing</td><td style="padding: 4px 0;"><strong>${listingTitle}</strong></td></tr>
        <tr><td style="padding: 4px 0; color: #6b7280;">Amount</td><td style="padding: 4px 0;"><strong>${formatAmount(amount, currency)}</strong></td></tr>
        <tr><td style="padding: 4px 0; color: #6b7280;">Payment method</td><td style="padding: 4px 0;">${paymentMethod || "n/a"}</td></tr>
        <tr><td style="padding: 4px 0; color: #6b7280;">Buyer</td><td style="padding: 4px 0;">${buyerName || "n/a"} (${buyerEmail || "n/a"})</td></tr>
        <tr><td style="padding: 4px 0; color: #6b7280;">Seller</td><td style="padding: 4px 0;">${sellerName || "n/a"} (${sellerEmail || "n/a"})</td></tr>
      </table>
    `
  ),
});
