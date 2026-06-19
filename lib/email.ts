import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.warn("WARNING: RESEND_API_KEY environment variable is not set");
}

export const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");

export async function sendPasswordResetEmail(email: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000";
  const resetUrl = `${appUrl}/reset-password?token=${token}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #111111; background-color: #FAF9F6;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="text-align: center; padding-bottom: 40px;">
            <h2 style="font-weight: 300; letter-spacing: 6px; color: #111111; margin: 0; font-size: 24px; text-transform: uppercase;">CATER</h2>
            <p style="font-size: 10px; font-weight: 300; letter-spacing: 4px; color: #999999; margin: 5px 0 0 0; text-transform: uppercase;">The Culinary Connection</p>
          </td>
        </tr>
        <tr>
          <td style="background-color: #ffffff; padding: 40px; border-radius: 20px; border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
            <h1 style="font-size: 20px; font-weight: 400; letter-spacing: 0.5px; margin-top: 0; margin-bottom: 20px; color: #111111;">Reset Your Password</h1>
            <p style="font-size: 14px; line-height: 1.6; color: #4a4a4a; margin-bottom: 24px;">We received a request to reset your Cater password. Click the button below to choose a new password. This link is valid for <strong>1 hour</strong>.</p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="background-color: #000000; color: #ffffff; padding: 14px 28px; text-decoration: none; font-size: 12px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; border-radius: 9999px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">Reset Password</a>
            </div>
            
            <p style="font-size: 13px; line-height: 1.6; color: #777777; margin-bottom: 0;">If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
          </td>
        </tr>
        <tr>
          <td style="text-align: center; padding-top: 30px; font-size: 11px; color: #999999;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} Cater. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </div>
  `;

  const fromAddress = process.env.RESET_PASSWORD_FROM_EMAIL || "Cater Auth <onboarding@resend.dev>";

  return resend.emails.send({
    from: fromAddress,
    to: email,
    subject: "Reset your Cater password",
    html: html,
  });
}
