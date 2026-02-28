import nodemailer from 'nodemailer';
import mg from 'nodemailer-mailgun-transport';
import { RenderedMailerData } from '../types/email';

/** Mail service class wrapping around mailgun */
class Mail {
  client: nodemailer.Transporter | null;

  sendOptions: Pick<nodemailer.SendMailOptions, 'from'>;

  constructor() {
    if (process.env.NODE_ENV === 'test' || process.env.E2E === 'true') {
      // No-op in test/e2e environment — no Mailgun key required
      this.client = null;
      this.sendOptions = { from: 'test@example.com' };
      return;
    }

    if (!process.env.MAILGUN_KEY) {
      throw new Error('Mailgun key missing');
    }

    const auth = {
      api_key: process.env.MAILGUN_KEY,
      domain: process.env.MAILGUN_DOMAIN
    };

    this.client = nodemailer.createTransport(mg({ auth }));
    this.sendOptions = {
      from: process.env.EMAIL_SENDER
    };
  }

  async sendMail(mailOptions: nodemailer.SendMailOptions) {
    if (process.env.NODE_ENV === 'test' || process.env.E2E === 'true') {
      // No-op in test/e2e mode
      return {};
    }
    try {
      const response = await this.client!.sendMail(mailOptions);
      return response;
    } catch (error) {
      console.error('Failed to send email: ', error);
      throw new Error('Email failed to send.');
    }
  }

  async send(data: RenderedMailerData) {
    if (process.env.NODE_ENV === 'test' || process.env.E2E === 'true') {
      // No-op in test/e2e mode
      return {};
    }
    const mailOptions: nodemailer.SendMailOptions = {
      from: this.sendOptions.from,
      to: data.to,
      subject: data.subject,
      html: data.html
    };

    try {
      const response = await this.sendMail(mailOptions);
      return response;
    } catch (error) {
      console.error('Error in prepping email.', error);
      throw new Error('Error in prepping email.');
    }
  }
}

/**
 * Mail service wrapping around mailgun
 */
export const mailerService = new Mail();
