import { Resend } from "resend";

// Guarded so the app still boots (and Inngest functions still run, they just
// skip delivery) if RESEND_API_KEY hasn't been set yet, e.g. in local dev.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Must be a verified sender/domain on your Resend account before going live.
// The onboarding@resend.dev address works out of the box for testing.
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "FlipEarn <onboarding@resend.dev>";

export const sendEmail = async ({ to, subject, html }) => {
  if (!resend) {
    console.log(`[email skipped - no RESEND_API_KEY] "${subject}" -> ${to}`);
    return null;
  }
  if (!to) {
    console.log(`[email skipped - no recipient] "${subject}"`);
    return null;
  }

  try {
    const { data, error } = await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
    if (error) {
      console.log("Resend email failed:", error);
      return null;
    }
    return data;
  } catch (error) {
    console.log("Resend email threw:", error);
    return null;
  }
};

export default resend;
