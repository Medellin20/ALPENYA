import 'server-only';
import nodemailer from 'nodemailer';

type AlertDetails = Record<string, string | number | null | undefined>;

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character] as string);
}

function getSafeErrorDetails(error: unknown, secrets: string[]) {
  const errorObject = error !== null && typeof error === 'object'
    ? error as {
        name?: unknown;
        message?: unknown;
        code?: unknown;
        command?: unknown;
        responseCode?: unknown;
        response?: unknown;
        stack?: unknown;
      }
    : undefined;
  const redact = (value: unknown) => {
    if (typeof value !== 'string') return value;
    return secrets.reduce(
      (safeValue, secret) => secret ? safeValue.split(secret).join('[masqué]') : safeValue,
      value
    );
  };

  if (!errorObject) return { error: redact(String(error)) };

  return {
    name: redact(errorObject.name ?? 'Error'),
    message: redact(errorObject.message ?? String(error)),
    code: errorObject.code,
    command: errorObject.command,
    responseCode: errorObject.responseCode,
    response: redact(errorObject.response),
    stack: redact(errorObject.stack),
  };
}

/** Envoie une alerte sans jamais bloquer la création d'un dossier client. */
export async function sendAdminAlert(subject: string, details: AlertDetails): Promise<boolean> {
  const user = process.env.GMAIL_USER?.trim();
  // Google affiche parfois les mots de passe d'application par groupes de caractères.
  const appPassword = process.env.GMAIL_APP_PASSWORD?.replace(/[\s-]/g, '');
  const recipient = process.env.ALERT_EMAIL?.trim();

  if (!user || !appPassword || !recipient) {
    const missingSettings = [
      ['GMAIL_USER', user],
      ['GMAIL_APP_PASSWORD', appPassword],
      ['ALERT_EMAIL', recipient],
    ]
      .filter(([, value]) => !value)
      .map(([name]) => name);
    console.error(
      `Alerte e-mail non envoyée : configuration Gmail incomplète. Paramètre(s) absent(s) : ${missingSettings.join(', ')}.`
    );
    return false;
  }

  const rows = Object.entries(details)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([label, value]) => `<tr><td style="padding:6px 12px;color:#607078">${escapeHtml(label)}</td><td style="padding:6px 12px;font-weight:600">${escapeHtml(String(value))}</td></tr>`)
    .join('');

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass: appPassword },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    await transporter.sendMail({
      from: `ALPENIA <${user}>`,
      to: recipient,
      subject,
      text: Object.entries(details).map(([label, value]) => `${label}: ${value ?? '—'}`).join('\n'),
      html: `<div style="font-family:Arial,sans-serif;color:#263238"><h2>${escapeHtml(subject)}</h2><table>${rows}</table><p style="margin-top:20px">Connectez-vous à l’espace administrateur pour traiter cette demande.</p></div>`,
    });
    return true;
  } catch (error) {
    console.error(
      'Échec de l’envoi de l’alerte Gmail. Détails SMTP :',
      getSafeErrorDetails(error, [user, recipient, appPassword, process.env.GMAIL_APP_PASSWORD ?? ''])
    );
    return false;
  }
}

/** Confirme au demandeur que sa demande de réservation a été enregistrée. */
export async function sendReservationConfirmationEmail(
  recipient: string,
  firstName: string,
  reference: string
): Promise<boolean> {
  const user = process.env.GMAIL_USER?.trim();
  const appPassword = process.env.GMAIL_APP_PASSWORD?.replace(/[\s-]/g, '');
  if (!user || !appPassword) return false;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass: appPassword },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
    await transporter.sendMail({
      from: `ALPENIA <${user}>`,
      to: recipient,
      subject: `Confirmation de votre demande de réservation — ${reference}`,
      text: `Bonjour ${firstName},\n\nVotre demande de réservation ${reference} a bien été enregistrée. Notre équipe l’examinera et vous contactera pour la suite.\n\nALPENIA`,
      html: `<div style="font-family:Arial,sans-serif;color:#263238"><p>Bonjour ${escapeHtml(firstName)},</p><p>Votre demande de réservation <strong>${escapeHtml(reference)}</strong> a bien été enregistrée. Notre équipe l’examinera et vous contactera pour la suite.</p><p>ALPENIA</p></div>`,
    });
    return true;
  } catch (error) {
    console.error(
      'Échec de l’envoi de la confirmation de réservation. Détails SMTP :',
      getSafeErrorDetails(error, [user, appPassword, process.env.GMAIL_APP_PASSWORD ?? ''])
    );
    return false;
  }
}
