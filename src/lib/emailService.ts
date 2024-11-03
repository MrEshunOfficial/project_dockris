// /lib/email.ts
import nodemailer from 'nodemailer';

// Define the type for sendEmail function parameters
interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string; // Optional, in case only plain text is used
}

// Configure your SMTP transport using your email provider settings
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // e.g., smtp.gmail.com
  port: parseInt(process.env.SMTP_PORT || '587', 10), // Default to port 587 if not set
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.SMTP_USER as string, // Your email address
    pass: process.env.SMTP_PASS as string, // Your email password or application-specific password
  },
});

// Function to send an email
export const sendEmail = async (userEmail: string, emailSubject: string, emailBody: string, p0: string, { to, subject, text, html }: EmailOptions): Promise<void> => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER, // sender address
      to, // recipient address
      subject, // Subject line
      text, // plain text body
      html, // html body (optional)
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};
