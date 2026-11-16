export type SmsResult =
  | { sent: true; id: string }
  | { sent: false; reason: string }

export async function sendSms(to: string, body: string): Promise<SmsResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from =
    process.env.TWILIO_FROM ?? process.env.TWILIO_NUMBER ?? ''

  if (!sid || !token || !from) {
    return { sent: false, reason: 'twilio_not_configured' }
  }

  if (!to || !to.startsWith('+')) {
    return { sent: false, reason: 'invalid_phone' }
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: to, From: from, Body: body }),
      },
    )

    if (!response.ok) {
      return { sent: false, reason: `twilio_${response.status}` }
    }

    const payload = (await response.json()) as { sid?: string }
    return { sent: true, id: payload.sid ?? '' }
  } catch (error) {
    return {
      sent: false,
      reason: error instanceof Error ? error.message : 'network_error',
    }
  }
}
