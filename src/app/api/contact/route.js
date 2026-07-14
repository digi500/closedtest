import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Save contact message in the database (Supabase or Mock fallback)
    await db.addContactMessage(name, email, subject, message);

    // 2. Setup SMTP credentials from Environment Variables
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const targetEmail = 'digitalist500@gmail.com';

    if (smtpUser && smtpPass) {
      // Create transporter using Gmail SMTP service
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      const mailOptions = {
        from: `"Closed Test Contact" <${smtpUser}>`,
        to: targetEmail,
        replyTo: email,
        subject: `[Closed Test Support] ${subject}`,
        text: `Yeni İletişim Talebi / New Contact Request!\n\nAdı Soyadı: ${name}\nE-posta: ${email}\nKonu: ${subject}\n\nMesaj:\n${message}`
      };

      await transporter.sendMail(mailOptions);
      console.log('Support email forwarded successfully to:', targetEmail);
    } else {
      console.warn('SMTP_USER and SMTP_PASS are not configured in Vercel. Mail forwarding is skipped but saved in DB.');
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Contact API handler error:', e);
    return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
  }
}
