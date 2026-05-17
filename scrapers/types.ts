export interface ScraperResult {
  dormSlug: string
  available: boolean
  roomsCount: number | null
  rawText: string
  scrapeOk: boolean
  errorMsg: string | null
}
