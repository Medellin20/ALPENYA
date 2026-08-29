import 'server-only';
import nodemailer from 'nodemailer';

type AlertDetails = Record<string, string | number | null | undefined>;

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character] as string);
}

/** Envoie une alerte sans jamais bloquer la création d'un dossier client. */
export async function sendAdminAlert(subject: string, details: AlertDetails) {
  const user = process.env.GMAIL_USER;
  const appPassword = process.env.GMAIL_APP_PASSWORD;
  const recipient = process.env.ALERT_EMAIL;

  if (!user || !appPassword || !recipient) return;

  const rows = Object.entries(details)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([label, value]) => `<tr><td style="padding:6px 12px;color:#607078">${escapeHtml(label)}</td><td style="padding:6px 12px;font-weight:600">${escapeHtml(String(value))}</td></tr>`)
    .join('');

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass: appPassword },
      connectionTimeout: 3000,
      greetingTimeout: 3000,
      socketTimeout: 5000,
    });

    await transporter.sendMail({
      from: `ALPENYA <${user}>`,
      to: recipient,
      subject,
      text: Object.entries(details).map(([label, value]) => `${label}: ${value ?? '—'}`).join('\n'),
      html: `<div style="font-family:Arial,sans-serif;color:#263238"><h2>${escapeHtml(subject)}</h2><table>${rows}</table><p style="margin-top:20px">Connectez-vous à l’espace administrateur pour traiter cette demande.</p></div>`,
    });
  } catch (error) {
    console.error('Échec de l’envoi de l’alerte Gmail :', error);
  }
}
