/**
 * Centralised nodemailer transporter.
 * Reads SMTP credentials exclusively from environment variables.
 */
import nodemailer from "nodemailer";

function createTransport() {
  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT ?? 587);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "EMAIL_HOST, EMAIL_USER, and EMAIL_PASS must be set in environment variables."
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: MailOptions) {
  const transporter = createTransport();
  const from = process.env.EMAIL_FROM ?? process.env.EMAIL_USER;

  await transporter.sendMail({ from, to, subject, html });
}
