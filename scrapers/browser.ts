import type { Browser } from 'playwright-core'

function isServerless(): boolean {
  return Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.CHROMIUM_REMOTE_EXEC_PATH,
  )
}

export async function launchScraperBrowser(): Promise<Browser> {
  const { chromium } = await import('playwright-core')

  if (isServerless()) {
    const chromiumPkg = await import('@sparticuz/chromium-min')
    const sparticuz = chromiumPkg.default
    return chromium.launch({
      args: sparticuz.args,
      executablePath: await sparticuz.executablePath(),
      headless: true,
    })
  }

  return chromium.launch({ headless: true })
}

export async function dismissCookieBanner(page: import('playwright-core').Page): Promise<void> {
  await page.locator('text=Got it!').first().click({ timeout: 2000 }).catch(() => {})
  await page.locator('text=Nein, danke').first().click({ timeout: 1000 }).catch(() => {})
}
