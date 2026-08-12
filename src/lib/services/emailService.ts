import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  title: string;
  body: string;
  buttonText?: string;
  buttonLink?: string;
}

export async function sendPremiumEmail({ to, subject, title, body, buttonText, buttonLink }: EmailOptions) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
          .header { background: #0f172a; padding: 40px 20px; text-align: center; }
          .content { padding: 40px; }
          .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
          h1 { color: #0f172a; font-size: 24px; font-weight: 800; margin-top: 0; text-transform: uppercase; letter-spacing: -0.025em; }
          p { margin-bottom: 20px; font-size: 16px; color: #475569; }
          .button { display: inline-block; background: #009EE3; color: #ffffff !important; padding: 16px 32px; border-radius: 12px; font-weight: 800; text-decoration: none; text-transform: uppercase; font-size: 14px; letter-spacing: 0.05em; box-shadow: 0 4px 6px -1px rgba(0, 158, 227, 0.2); }
          .logo { color: #ffffff; font-size: 28px; font-weight: 900; letter-spacing: -0.05em; margin: 0; }
          .accent { color: #009EE3; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">BANDHA<span class="accent">.</span></div>
          </div>
          <div class="content">
            <h1>${title}</h1>
            <div style="font-size: 16px; color: #475569;">${body}</div>
            ${buttonText ? `
              <div style="margin-top: 30px; text-align: center;">
                <a href="${buttonLink}" class="button">${buttonText}</a>
              </div>
            ` : ''}
          </div>
          <div class="footer">
            <p style="margin: 0;">© 2026 BANDHA. Plataforma de Compras Comunitarias.</p>
            <p style="margin: 5px 0;">Recoleta • Palermo • Belgrano</p>
            <div style="margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
              <p style="font-size: 10px;">Este mensaje es automático. Según la ley argentina, tenés derecho de arrepentimiento por 10 días desde la entrega.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return await resend.emails.send({
    from: 'BANDHA <comunidad@bandha.com.ar>',
    to: [to],
    subject: subject,
    html: html,
  });
}
