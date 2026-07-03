import { Resend } from 'resend'
import type { DormAlertInfo } from './types/dorm'
import { getEmailMessages, resolveLocale, type EmailMessages } from './i18n-email'
import { absoluteUrl, localePath } from './i18n-path'

let _resend: Resend | undefined
function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY
    if (!key) throw new Error('RESEND_API_KEY is not set.')
    _resend = new Resend(key)
  }
  return _resend
}

interface SendAlertParams {
  to: string
  userName: string | null
  dorm: DormAlertInfo
  alertId: string
  locale?: string | null
}

export async function sendAvailabilityAlert({
  to,
  userName,
  dorm,
  alertId,
  locale,
}: SendAlertParams): Promise<{ success: boolean; error?: string }> {
  const resolvedLocale = resolveLocale(locale)
  const t = getEmailMessages(resolvedLocale)

  const from = process.env.RESEND_FROM ?? 'Dormra <onboarding@resend.dev>'
  const subject = t.alertSubject.replace('{name}', dorm.name)
  const applyUrl = absoluteUrl(localePath(`/dorms/${dorm.slug}`, resolvedLocale))
  const manageUrl = absoluteUrl(localePath('/dashboard/alerts', resolvedLocale))

  const priceRange = dorm.price_min && dorm.price_max
    ? t.priceRange.replace('{min}', String(dorm.price_min)).replace('{max}', String(dorm.price_max))
    : dorm.price_min
      ? t.priceFrom.replace('{min}', String(dorm.price_min))
      : dorm.price_max
        ? t.priceUpTo.replace('{max}', String(dorm.price_max))
        : t.priceNotListed

  const greeting = userName
    ? t.greetingNamed.replace('{name}', userName)
    : t.greetingAnonymous

  const html = `<!DOCTYPE html>
<html lang="${resolvedLocale}">
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

          <tr>
            <td style="padding-bottom:24px;text-align:center;">
              <table cellpadding="0" cellspacing="0" align="center" style="margin:0 auto;">
                <tr>
                  <td style="padding-right:10px;vertical-align:middle;">
                    <div style="width:36px;height:36px;border-radius:10px;background-color:#F9E8E2;border:1px solid rgba(184,56,26,0.12);text-align:center;line-height:36px;">
                      <img src="${absoluteUrl('/icon.svg')}" width="20" height="20" alt="" style="vertical-align:middle;display:inline-block;" />
                    </div>
                  </td>
                  <td style="vertical-align:middle;font-size:22px;font-weight:600;color:#B8381A;letter-spacing:-0.3px;">Dormra</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background-color:#ffffff;border-radius:12px;padding:32px;border:1px solid #FFE4D6;">
              <p style="margin:0 0 8px;font-size:16px;color:#1A1410;">${greeting}</p>
              <p style="margin:0 0 24px;font-size:16px;color:#1A1410;">${t.bodyIntro}</p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFF8F4;border-radius:8px;border:1px solid #FFE4D6;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 4px;font-size:20px;font-weight:700;color:#1A1410;">${dorm.name}</p>
                    <p style="margin:0 0 12px;font-size:13px;color:#6B5C53;text-transform:uppercase;letter-spacing:0.5px;">${dorm.provider}</p>
                    <table cellpadding="0" cellspacing="0">
                      ${dorm.district !== null ? `<tr><td style="padding:2px 0;font-size:14px;color:#6B5C53;">${t.district}:&nbsp;</td><td style="padding:2px 0;font-size:14px;color:#1A1410;font-weight:500;">${dorm.district}</td></tr>` : ''}
                      <tr><td style="padding:2px 0;font-size:14px;color:#6B5C53;">${t.price}:&nbsp;</td><td style="padding:2px 0;font-size:14px;color:#1A1410;font-weight:500;">${priceRange}</td></tr>
                      ${dorm.address ? `<tr><td style="padding:2px 0;font-size:14px;color:#6B5C53;">${t.address}:&nbsp;</td><td style="padding:2px 0;font-size:14px;color:#1A1410;">${dorm.address}</td></tr>` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${applyUrl}" style="display:inline-block;background-color:#C2401E;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;padding:14px 32px;border-radius:8px;">${t.cta}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#6B5C53;">${t.footerReason}</p>
              <a href="${manageUrl}" style="font-size:12px;color:#C2401E;">${t.manageAlerts}</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const text = `${greeting}

${t.bodyIntro}

${dorm.name}
${dorm.provider}${dorm.district !== null ? `\n${t.district}: ${dorm.district}` : ''}
${t.price}: ${priceRange}${dorm.address ? `\n${t.address}: ${dorm.address}` : ''}

${t.cta} ${applyUrl}

---
${t.footerReason}
${t.manageAlerts}: ${manageUrl}`

  try {
    const { error } = await getResend().emails.send({ from, to, subject, html, text })
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

type WelcomeDorm = {
  slug: string
  name: string
  provider: string
  district: number | null
  price_min: number | null
  price_max: number | null
}

function formatWelcomePrice(
  dorm: WelcomeDorm,
  t: EmailMessages,
): string {
  if (dorm.price_min && dorm.price_max) {
    return t.priceRange.replace('{min}', String(dorm.price_min)).replace('{max}', String(dorm.price_max))
  }
  if (dorm.price_min) return t.priceFrom.replace('{min}', String(dorm.price_min))
  if (dorm.price_max) return t.priceUpTo.replace('{max}', String(dorm.price_max))
  return t.priceNotListed
}

export async function sendWelcomeDigest({
  to,
  alertId,
  locale,
  dorms,
  totalAvailable,
}: {
  to: string
  alertId: string
  locale?: string | null
  dorms: WelcomeDorm[]
  totalAvailable: number
}): Promise<{ sent: boolean; error?: string }> {
  const resolvedLocale = resolveLocale(locale)
  const t = getEmailMessages(resolvedLocale)
  const from = process.env.RESEND_FROM ?? 'Dormra <onboarding@resend.dev>'
  const subject = t.welcomeSubject.replace('{count}', String(totalAvailable))
  const manageUrl = absoluteUrl(localePath('/dashboard/alerts', resolvedLocale))
  const browseUrl = absoluteUrl(localePath('/dorms', resolvedLocale))

  const dormRows = dorms
    .map((dorm) => {
      const url = absoluteUrl(localePath(`/dorms/${dorm.slug}`, resolvedLocale))
      const price = formatWelcomePrice(dorm, t)
      const district =
        dorm.district !== null
          ? `<tr><td style="padding:2px 0;font-size:13px;color:#6B5C53;">${t.district}:&nbsp;</td><td style="padding:2px 0;font-size:13px;color:#1A1410;">${dorm.district}</td></tr>`
          : ''
      return `<tr><td style="padding:16px 0;border-bottom:1px solid #FFE4D6;">
        <p style="margin:0 0 4px;font-size:16px;font-weight:600;color:#1A1410;"><a href="${url}" style="color:#1A1410;text-decoration:none;">${dorm.name}</a></p>
        <p style="margin:0 0 8px;font-size:12px;color:#6B5C53;text-transform:uppercase;letter-spacing:0.4px;">${dorm.provider}</p>
        <table cellpadding="0" cellspacing="0">${district}<tr><td style="padding:2px 0;font-size:13px;color:#6B5C53;">${t.price}:&nbsp;</td><td style="padding:2px 0;font-size:13px;color:#1A1410;">${price}</td></tr></table>
      </td></tr>`
    })
    .join('')

  const moreLine =
    totalAvailable > dorms.length
      ? `<p style="margin:16px 0 0;font-size:14px;color:#6B5C53;">${t.welcomeMore.replace('{count}', String(totalAvailable - dorms.length))}</p>`
      : ''

  const html = `<!DOCTYPE html>
<html lang="${resolvedLocale}">
<body style="margin:0;padding:0;background-color:#FFF8F4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFF8F4;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr><td style="padding-bottom:24px;text-align:center;font-size:22px;font-weight:600;color:#B8381A;">Dormra</td></tr>
        <tr><td style="background:#fff;border-radius:12px;padding:32px;border:1px solid #FFE4D6;">
          <p style="margin:0 0 16px;font-size:16px;color:#1A1410;">${t.greetingAnonymous}</p>
          <p style="margin:0 0 20px;font-size:16px;color:#1A1410;">${t.welcomeIntro}</p>
          <table width="100%" cellpadding="0" cellspacing="0">${dormRows}</table>
          ${moreLine}
          <p style="margin:20px 0 0;font-size:14px;color:#6B5C53;">${t.welcomeOutro}</p>
          <p style="margin:24px 0 0;text-align:center;"><a href="${browseUrl}" style="display:inline-block;background:#C2401E;color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 24px;border-radius:8px;">${t.welcomeBrowseCta}</a></p>
        </td></tr>
        <tr><td style="padding-top:20px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#6B5C53;">${t.footerReason}</p>
          <a href="${manageUrl}" style="font-size:12px;color:#C2401E;">${t.manageAlerts}</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  const textLines = [
    t.greetingAnonymous,
    '',
    t.welcomeIntro,
    '',
    ...dorms.map((dorm) => {
      const url = absoluteUrl(localePath(`/dorms/${dorm.slug}`, resolvedLocale))
      return `${dorm.name} (${dorm.provider}) — ${formatWelcomePrice(dorm, t)}\n${url}`
    }),
  ]
  if (totalAvailable > dorms.length) {
    textLines.push('', t.welcomeMore.replace('{count}', String(totalAvailable - dorms.length)))
  }
  textLines.push('', t.welcomeOutro, `${t.welcomeBrowseCta}: ${browseUrl}`, '', t.manageAlerts + ': ' + manageUrl)
  const text = textLines.join('\n')

  try {
    const { error } = await getResend().emails.send({ from, to, subject, html, text })
    if (error) {
      console.error(`[EMAIL] Welcome digest failed for alert ${alertId}:`, error.message)
      return { sent: false, error: error.message }
    }
    return { sent: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[EMAIL] Welcome digest error for alert ${alertId}:`, msg)
    return { sent: false, error: msg }
  }
}
