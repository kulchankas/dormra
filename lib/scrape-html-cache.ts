/** Per-cron-run cache so shared scrape URLs (e.g. home4students vacancy page) are fetched once. */
export class ScrapeHtmlCache {
  private readonly entries = new Map<string, Promise<string>>()

  getOrFetch(url: string, fetcher: () => Promise<string>): Promise<string> {
    const existing = this.entries.get(url)
    if (existing) return existing

    const pending = fetcher()
    this.entries.set(url, pending)
    return pending
  }
}
