import nodemailer from "nodemailer";

// Configure transporter — uses env vars for SMTP settings.
// For development, you can use services like Mailtrap or Gmail.
// Set these in your .env.local:
//   SMTP_HOST=smtp.gmail.com
//   SMTP_PORT=587
//   SMTP_USER=your-email@gmail.com
//   SMTP_PASS=your-app-password
//   SMTP_FROM="Rajvi Admin <noreply@yourdomain.com>"

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[EMAIL] SMTP not configured. Would send to ${to}: ${subject}`);
    return;
  }

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    console.log(`[EMAIL] Sent to ${to}: ${subject}`);
  } catch (error) {
    console.error("[EMAIL] Failed to send:", error);
  }
}

/**
 * Send notification when orders are assigned to a team member.
 */
export async function sendOrderAssignmentEmail(
  email: string,
  name: string,
  orderCount: number,
  storeName: string
) {
  await sendEmail({
    to: email,
    subject: `${orderCount} order(s) assigned to you — ${storeName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1a1a2e;">New Order Assignment</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p><strong>${orderCount}</strong> order(s) have been assigned to you in <strong>${storeName}</strong>.</p>
        <p>Log in to the admin panel to view and manage your assigned orders.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #666; font-size: 13px;">This is an automated notification from ${storeName}.</p>
      </div>
    `,
  });
}

/**
 * Send notification when a user is invited to join a store.
 */
export async function sendInviteEmail(
  email: string,
  storeName: string,
  roleName: string,
  inviterName: string
) {
  await sendEmail({
    to: email,
    subject: `You've been invited to join ${storeName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1a1a2e;">Team Invitation</h2>
        <p>Hi there,</p>
        <p><strong>${inviterName}</strong> has invited you to join <strong>${storeName}</strong> as a <strong>${roleName}</strong>.</p>
        <p>If you already have an account, simply log in. If not, register with this email address and you'll automatically be added to the team.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #666; font-size: 13px;">This is an automated notification from ${storeName}.</p>
      </div>
    `,
  });
}
