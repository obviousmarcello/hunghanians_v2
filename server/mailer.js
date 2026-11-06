import nodemailer from 'nodemailer';

/**
 * Wraps nodemailer so the rest of the app only deals with
 * send({ to, replyTo, subject, text, html }).
 *
 * Transports:
 *  - smtp:   real delivery through any SMTP provider (Gmail app password,
 *            Brevo, Mailgun, Postmark, SES SMTP, your web host...).
 *  - log:    prints messages to stdout. Default for local development.
 *  - memory: keeps messages in `mailer.outbox`. Used by the tests.
 */
export function createMailer(mailConfig, logger = console) {
  const outbox = [];
  let transporter;

  if (mailConfig.transport === 'smtp') {
    transporter = nodemailer.createTransport(mailConfig.smtp);
  } else {
    transporter = nodemailer.createTransport({ jsonTransport: true });
  }

  return {
    outbox,
    async verify() {
      if (mailConfig.transport === 'smtp') await transporter.verify();
    },
    async send({ to, replyTo, subject, text, html }) {
      const message = { from: mailConfig.from, to, replyTo, subject, text, html };
      if (mailConfig.transport === 'memory') {
        outbox.push(message);
        return { messageId: `memory-${outbox.length}` };
      }
      const info = await transporter.sendMail(message);
      if (mailConfig.transport === 'log') {
        logger.info(`\n📧  [mail:log] To: ${[].concat(to).join(', ')}\n    Subject: ${subject}\n${text.replace(/^/gm, '    ')}\n`);
      }
      return info;
    },
  };
}
