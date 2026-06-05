import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface Dorm {
  id: string
  slug: string
  name: string
  provider: string
  address: string | null
  district: number | null
  price_min: number | null
  price_max: number | null
  apply_url: string | null
}

interface SendAlertParams {
  to: string
  userName: string | null
  dorm: Dorm
  alertId: string
}

export async function sendAvailabilityAlert({ to, userName, dorm, alertId }: SendAlertParams): Promise<{ success: boolean; error?: string }> {
  // TODO: switch from: to "Dormra <alerts@dormra.eu>" once domain is verified
  const from = 'Dormra <onboarding@resend.dev>'
  const subject = `🏠 A room just opened at ${dorm.name}`
  const applyUrl = `https://dormra.eu/dorms/${dorm.slug}`
  const manageUrl = 'https://dormra.eu/dashboard/alerts'

  const priceRange = dorm.price_min && dorm.price_max
    ? `€${dorm.price_min} – €${dorm.price_max}/mo`
    : dorm.price_min
      ? `From €${dorm.price_min}/mo`
      : dorm.price_max
        ? `Up to €${dorm.price_max}/mo`
        : 'Price not listed'

  const greeting = userName ? `Hi ${userName},` : 'Hi,'

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#FFF8F4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFF8F4;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:24px;text-align:center;">
              <span style="font-size:28px;font-weight:800;color:#C2401E;letter-spacing:-0.5px;">dormra</span>
            </td>
          </tr>

          <!-- Body card -->
          <tr>
            <td style="background-color:#ffffff;border-radius:12px;padding:32px;border:1px solid #FFE4D6;">
              <p style="margin:0 0 8px;font-size:16px;color:#1A1410;">${greeting}</p>
              <p style="margin:0 0 24px;font-size:16px;color:#1A1410;">Good news! A dorm matching your alert just became available:</p>

              <!-- Dorm card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFF8F4;border-radius:8px;border:1px solid #FFE4D6;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 4px;font-size:20px;font-weight:700;color:#1A1410;">${dorm.name}</p>
                    <p style="margin:0 0 12px;font-size:13px;color:#6B5C53;text-transform:uppercase;letter-spacing:0.5px;">${dorm.provider}</p>
                    <table cellpadding="0" cellspacing="0">
                      ${dorm.district !== null ? `<tr><td style="padding:2px 0;font-size:14px;color:#6B5C53;">District:&nbsp;</td><td style="padding:2px 0;font-size:14px;color:#1A1410;font-weight:500;">${dorm.district}</td></tr>` : ''}
                      <tr><td style="padding:2px 0;font-size:14px;color:#6B5C53;">Price:&nbsp;</td><td style="padding:2px 0;font-size:14px;color:#1A1410;font-weight:500;">${priceRange}</td></tr>
                      ${dorm.address ? `<tr><td style="padding:2px 0;font-size:14px;color:#6B5C53;">Address:&nbsp;</td><td style="padding:2px 0;font-size:14px;color:#1A1410;">${dorm.address}</td></tr>` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${applyUrl}" style="display:inline-block;background-color:#C2401E;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;padding:14px 32px;border-radius:8px;">View &amp; apply →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#6B5C53;">You're receiving this because you set up an alert on Dormra.</p>
              <a href="${manageUrl}" style="font-size:12px;color:#C2401E;">Manage your alerts</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const text = `${greeting}

Good news! A dorm matching your alert just became available:

${dorm.name}
Provider: ${dorm.provider}${dorm.district !== null ? `\nDistrict: ${dorm.district}` : ''}
Price: ${priceRange}${dorm.address ? `\nAddress: ${dorm.address}` : ''}

View & apply: ${applyUrl}

---
You're receiving this because you set up an alert on Dormra.
Manage your alerts: ${manageUrl}`

  try {
    const { error } = await resend.emails.send({ from, to, subject, html, text })
    if (error) {
      console.error(`[EMAIL] Failed to send alert ${alertId} to ${to.slice(0, 3)}***:`, error.message)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[EMAIL] Unexpected error for alert ${alertId}:`, msg)
    return { success: false, error: msg }
  }
}
