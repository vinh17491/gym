import nodemailer, { Transporter } from 'nodemailer';
import { logger } from '../../utils/logger';
import type { MailMessage, MailSendResult } from './mail.types';

let transporter: Transporter | null = null;
function getTransporter(): Transporter | null {
  if (transporter) return transporter;
  const host = process.env.MAIL_HOST;
  const user = process.env.MAIL_USER;
  const password = process.env.MAIL_APP_PASSWORD;
  if (!host || !user || !password) return null;
  transporter = nodemailer.createTransport({ host, port: Number(process.env.MAIL_PORT || 465), secure: process.env.MAIL_SECURE !== 'false', auth: { user, pass: password } });
  return transporter;
}

export const mailService = {
  async send(message: MailMessage): Promise<MailSendResult> {
    const sender = process.env.MAIL_USER;
    const transport = getTransporter();
    if (!transport || !sender || !message.to) { logger.warn('Mail delivery skipped: SMTP is not configured or recipient is missing'); return { sent: false }; }
    try { await transport.sendMail({ from: sender, to: message.to, subject: message.subject, text: message.text, html: message.html }); return { sent: true }; }
    catch (error: unknown) { logger.warn('Mail delivery failed', { message: error instanceof Error ? error.message : 'unknown error' }); return { sent: false }; }
  },
};
