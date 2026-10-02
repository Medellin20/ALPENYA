import 'server-only';

type AlertDetails = Record<string, string | number | null | undefined>;

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character] as string);
}

export async function sendRequestAlert(subject: string, details: AlertDetails): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const recipient = process.env.ALERT_EMAIL?.trim();
  const sender = process.env.ALERT_FROM_EMAIL?.trim();

  if (!apiKey || !recipient || !sender) {
    const missing = [
      ['RESEND_API_KEY', apiKey],
      ['ALERT_EMAIL', recipient],
      ['ALERT_FROM_EMAIL', sender],
    ]
      .filter(([, value]) => !value)
      .map(([name]) => name);
    console.error(`Alerte non envoyée : configuration Resend incomplète (${missing.join(', ')}).`);
    return;
  }

  const rows = Object.entries(details)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([label, value]) =>
      `<tr><td style="padding:6px 12px;color:#607078">${escapeHtml(label)}</td><td style="padding:6px 12px;font-weight:600">${escapeHtml(String(value))}</td></tr>`
    )
    .join('');
  const text = Object.entries(details)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n');

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: sender,
        to: [recipient],
        subject,
        text,
        html: `<div style="font-family:Arial,sans-serif;color:#263238"><h2>${escapeHtml(subject)}</h2><table>${rows}</table></div>`,
      }),
    });

    if (!response.ok) {
      const errorBody = (await response.text()).replaceAll(apiKey, '[masqué]');
      console.error(`Échec de l’alerte Resend (HTTP ${response.status}) : ${errorBody}`);
    }
  } catch (error) {
    console.error('Échec de connexion à l’API Resend pour l’envoi de l’alerte :', error);
  }
}
