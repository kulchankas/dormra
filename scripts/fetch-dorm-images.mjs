#!/usr/bin/env node
/**
 * Fetches hero images from provider dorm pages and writes dorm_images.sql.
 * Prefers building exteriors and large gallery photos — avoids OeAD banner
 * strips (1580×240) and confusing interior-only shots where possible.
 *
 * Run: node scripts/fetch-dorm-images.mjs
 */
import fs from 'fs'
import path from 'path'

const ROOT = process.cwd()
const SEED_FILES = [
  'supabase/seeds/oead_vienna.sql',
  'supabase/seeds/stuwo_vienna.sql',
  'supabase/seeds/home4students_vienna.sql',
]

const BOT = 'Dormra-Bot/1.0 (+https://dormra.eu)'
const DELAY_MS = 350

/** Curated hero shots when auto-pick still misses a clear exterior. */
const MANUAL_OVERRIDES = {
  'h4s-boltzmanngasse':
    'https://www.home4students.at/wp-content/uploads/2024/04/home4students_Boltzmanngasse_Aussenaufnahme-e1712140495902.jpg',
  'h4s-doebling-front':
    'https://www.home4students.at/wp-content/uploads/2019/02/h4s_Doebling2_Außenansicht2.jpg',
  'h4s-doebling-back':
    'https://www.home4students.at/wp-content/uploads/2019/02/h4s_Doebling2_Außenansicht2.jpg',
  'h4s-grosse-schiffgasse':
    'https://www.home4students.at/wp-content/uploads/2021/11/home4students_Grosse_Schiffgasse_aussen_1_conrete-web.jpg',
  'h4s-neudeggergasse':
    'https://www.home4students.at/wp-content/uploads/2019/02/neudeggergasse_aussen.jpg',
  'h4s-schaeffergasse':
    'https://www.home4students.at/wp-content/uploads/2026/01/home4students-Schaeffergasse-Aussenansicht-e1767786075976.jpg',
  'h4s-ullmannstrasse':
    'https://www.home4students.at/wp-content/uploads/2024/12/DWP_4981-scaled.jpg',
}

/** OeAD slugs with no exterior on their page — borrow a sibling provider photo. */
const OEAD_CROSS_PROVIDER = {
  donaufelderstrasse:
    'https://www.stuwo.at/wp-content/uploads/2020/04/Wien-DonaufeldStraße.jpg',
}

/** home4students slug → dormitory page path (without trailing slash). */
const H4S_PAGE_PATH = {
  'h4s-grosse-schiffgasse': 'grosse-schiffgasse',
  'h4s-schaeffergasse': 'schaeffergasse',
  'h4s-neudeggergasse': 'neudeggergasse',
  'h4s-boltzmanngasse': 'boltzmanngasse',
  'h4s-hofergasse': 'hoefergasse',
  'h4s-sensengasse': 'sensengasse',
  'h4s-erlachplatz': 'erlachplatz',
  'h4s-ullmannstrasse': 'ullmannstrasse',
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function parseDormsFromSeed(filePath) {
  const text = fs.readFileSync(path.join(ROOT, filePath), 'utf8')
  const rows = []
  const re = /\('([^']+)',\s*'([^']+)'[\s\S]*?'(https?:\/\/[^']+)',\s*'(?:playwright|cheerio)'/g
  let match
  while ((match = re.exec(text)) !== null) {
    rows.push({ slug: match[1], provider: match[2], scrapeUrl: match[3] })
  }
  return rows
}

function decodeUrl(url) {
  try {
    return decodeURIComponent(url)
  } catch {
    return url
  }
}

function extractOeadGalleryItems(html) {
  const items = []
  const re =
    /\{&quot;title&quot;:&quot;([^&]+)&quot;,&quot;src&quot;:&quot;(https:\/\/oeadstudenthousing-public-production\.s3\.amazonaws\.com\/images\/[^&]+)&quot;/g
  let match
  while ((match = re.exec(html)) !== null) {
    items.push({
      title: match[1].replace(/&amp;/g, '&'),
      url: match[2],
    })
  }
  return items
}

function scoreOeadItem({ title, url }) {
  const name = decodeUrl(url.split('/').pop() ?? '').toLowerCase()
  const t = title.toLowerCase()

  if (name.includes('fill-1580x240') || name.includes('fill-472') || name.includes('istock')) {
    return -100
  }
  if (/zimmertyp|_kat|kat[a-z]?_|grundriss|virtual|floorplan|icon|logo|max-900x90|zi\d|zimmer/.test(name)) {
    return -100
  }
  if (!name.includes('max-1920x1080')) return -50

  let score = 10

  // Main building carousel (title is the dorm name, not a labelled interior gallery).
  const isBuildingCarousel =
    /^oead-(guesthouse|apartment)\s/.test(t) &&
    !/\sgallery\s*(kitchen|bathroom|gym|sauna|hallway|couch|mailbox|elevator|terrace|bad|kueche|fitness|zimmer|musik|kletter|wasch|arbeitsfl|allgemein|greenhouse|gang|sofa|lift|briefkasten|essecke)/.test(
      t,
    ) &&
    !/\sgallery$/.test(t.trim())

  if (isBuildingCarousel) score += 65

  if (/aussen|außen|eingang|entrance|facade|fassade|terrasse|terrace|ansicht|outside|building/.test(`${name} ${t}`)) {
    score += 45
  }
  if (/gallery-aussen|gallery_eingang|gallery-eingang|_aussen|_header/.test(name)) score += 45

  if (
    /gallery kitchen|gallery bathroom|gallery gym|gallery sauna|gallery hallway|gallery couch|gallery mailbox|gallery elevator|gallery bad|gallery kueche|gallery fitness|gallery zimmer|musikzimmer|kletterraum|waschk|arbeitsfl|allgemein|gallery gang|gallery sofa|gallery lift|essecke/.test(
      t,
    )
  ) {
    score -= 55
  }
  if (/kueche|kitchen|bad|bath|gym|sauna|fitness|zimmer|musik|kletter|wasch|arbeitsfl|allgemein|gang|sofa|lift|briefkasten|essecke|arbeitsfl/.test(name)) {
    score -= 45
  }

  if (/gallery1\.max-1920/.test(name) && isBuildingCarousel) score += 8

  return score
}

function pickBestOead(html) {
  const items = extractOeadGalleryItems(html)
  if (items.length) {
    const ranked = items
      .map((item) => ({ ...item, score: scoreOeadItem(item) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
    if (ranked[0]) return ranked[0].url
  }

  // Fallback: raw URL scan with filename heuristics.
  const urls = [...html.matchAll(
    /https:\/\/oeadstudenthousing-public-production\.s3\.amazonaws\.com\/images\/[^"'\\]+/gi,
  )].map((m) => m[0].replace(/&quot;.*/, ''))

  return pickBest(urls, scoreOeadUrlFallback)
}

function scoreOeadUrlFallback(url) {
  const name = decodeUrl(url.split('/').pop() ?? '').toLowerCase()
  if (name.includes('fill-1580x240') || name.includes('teaser') || name.includes('istock')) return -100
  if (/grundriss|virtual|zimmertyp|_kat|kat[a-z]?_|zi\d|zimmer|floorplan|icon|logo|max-900x90|max-1860x969/.test(name)) {
    return -100
  }
  if (/musikzimmer|kueche|kitchen|schlaf|zimmer|wc|bad|cafeteria|wasch|sauna|kletter|arbeitsfl/.test(name)) {
    return -25
  }

  let score = 0
  if (name.includes('gallery')) score += 35
  if (/gallery-aussen|gallery_eingang|gallery-eingang|_aussen/.test(name)) score += 30

  const dim = name.match(/max-(\d+)x(\d+)/)
  if (dim) {
    const w = Number(dim[1])
    const h = Number(dim[2])
    const ratio = w / h
    score += Math.min(w / 100, 25)
    if (ratio >= 1.25 && ratio <= 2.1) score += 20
    if (ratio > 3 || h > w) score -= 30
  }

  return score
}

function scoreStuwoUrl(url, slug = '') {
  const name = decodeUrl(url.split('/').pop() ?? '').toLowerCase()
  if (name.match(/-\d+x\d+\./) || name.includes('icon')) return -100

  const dormKey = slug.replace('stuwo-', '').replace(/-/g, '')

  let score = 0
  if (/^wien-/.test(name)) score += 55
  if (name.includes('aussenansicht') || name.includes('aussen')) score += 40
  if (dormKey && name.replace(/[^a-z0-9]/g, '').includes(dormKey.replace(/[^a-z0-9]/g, ''))) score += 15
  if (/^stuwo-[a-z0-9äöüß-]+\.jpg$/.test(name)) score += 25
  if (slug.includes('seestadt') && name.includes('see')) score += 20
  if (/zimmer|kueche|küche|gemeinschaft|kleinkueche|studier|yoga|sauna|hantel|balkon|haustiere|kategorie|land_/.test(name)) {
    score -= 45
  }
  if (/kat\.|kat-|svenja|bewohner/.test(name)) score -= 35

  return score
}

function normalizeH4sCandidates(urls) {
  const best = new Map()

  for (const url of urls) {
    if (/favicon|logo|circle|rectangle|cta_bg|cb-|hero_bg|wohnheime_wien|borlabs-cookie/.test(url)) {
      continue
    }

    const withoutDims = url.replace(/-\d+x\d+(\.[a-z]+)$/i, '$1')
    const key = withoutDims.replace(/-scaled(?=\.[a-z]+$)/i, '')
    const current = best.get(key)

    const rank = (u) => {
      let s = 0
      if (u.includes('-scaled.')) s += 30
      if (!u.match(/-\d+x\d+\./)) s += 20
      if (u.includes('2048x') || u.includes('1536x')) s += 15
      if (u.includes('1200x')) s += 10
      if (u.match(/-\d+x\d+\./)) s -= 10
      return s
    }

    if (!current || rank(url) > rank(current)) best.set(key, url)
  }

  return [...best.values()]
}

function scoreH4sUrl(url) {
  const name = decodeUrl(url.split('/').pop() ?? '').toLowerCase()
  if (/favicon|logo|circle|rectangle|cta_bg|cb-|hero_bg|wohnheime_wien/.test(name)) return -100
  if (/768x1024|hqdefault|walls_of|vision|kaiserschild|neutorgasse|coming-soon|photo-coming/.test(name)) {
    return -80
  }
  if (/\.png$/.test(name)) return -35
  if (/-e\d+\.(jpg|jpeg|png|webp)$/.test(name)) return -25

  let score = 0
  if (/^dwp_/.test(name)) score += 35
  if (/aussen|außen|fassade|aussenansicht|aussenaufnahme|aussenbereich/.test(name)) score += 45
  if (name.includes('ansicht') && !name.includes('innen')) score += 20
  if (name.includes('garten') || name.includes('conrete')) score += 12
  if (name.includes('scaled') || name.includes('1200x') || name.includes('1024x')) score += 10
  if (/\/202[4-9]\//.test(url)) score += 8
  if (/zimmer|bett|kueche|küche|bewohner|doppelz|einzelz|etagenbett|badezimmer/.test(name)) score -= 50

  return score
}

function pickBest(urls, scorer, slug = '') {
  const ranked = [...new Set(urls)]
    .map((url) => ({ url, score: scorer(url, slug) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
  return ranked[0]?.url ?? null
}

function extractStuwoImages(html) {
  return [...html.matchAll(
    /https:\/\/www\.stuwo\.at\/wp-content\/uploads\/[^"'\\]+\.(?:jpg|jpeg|webp)/gi,
  )].map((m) => m[0])
}

function extractH4sImages(html) {
  const raw = [...html.matchAll(
    /https:\/\/www\.home4students\.at\/wp-content\/uploads\/[^"'\\]+\.(?:jpg|jpeg|png|webp)/gi,
  )].map((m) => m[0])
  return normalizeH4sCandidates(raw)
}

function extractImageFromHtml(html, provider, slug = '') {
  if (provider === 'OeAD') {
    return pickBestOead(html)
  }
  if (provider === 'STUWO') {
    return pickBest(extractStuwoImages(html), scoreStuwoUrl, slug)
  }
  return null
}

async function fetchListingH4SImages() {
  const res = await fetch('https://www.home4students.at/en/our-dormitories/dormitories-vienna/', {
    headers: { 'User-Agent': BOT },
  })
  const html = await res.text()
  const images = [...html.matchAll(
    /background-image:url\((https:\/\/www\.home4students\.at\/wp-content\/uploads\/[^)]+)\)/g,
  )].map((m) => m[1])

  const slugs = [
    'h4s-grosse-schiffgasse',
    'h4s-schaeffergasse',
    'h4s-neudeggergasse',
    'h4s-boltzmanngasse',
    'h4s-hofergasse',
    'h4s-sensengasse',
    'h4s-erlachplatz',
    'h4s-ullmannstrasse',
    'h4s-doebling-front',
    'h4s-doebling-back',
    'h4s-popup-seestadt',
  ]

  const map = {}
  slugs.forEach((slug, index) => {
    const url = images[index + 1]
    if (url) map[slug] = url
  })
  return map
}

async function fetchH4SImage(slug, listingFallback) {
  if (MANUAL_OVERRIDES[slug]) return MANUAL_OVERRIDES[slug]

  const candidates = []
  if (listingFallback) candidates.push(listingFallback)

  const pagePath = H4S_PAGE_PATH[slug]
  if (pagePath) {
    const url = `https://www.home4students.at/en/our-dormitories/dormitories-vienna/dormitory-${pagePath}/`
    try {
      const res = await fetch(url, { headers: { 'User-Agent': BOT } })
      if (res.ok) {
        const html = await res.text()
        const picked = pickBest(extractH4sImages(html), scoreH4sUrl)
        if (picked) candidates.push(picked)
      }
    } catch {
      // use listing fallback
    }
  }

  return pickBest(candidates, scoreH4sUrl) ?? listingFallback ?? null
}

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': BOT, 'Accept-Language': 'en,de;q=0.8' },
  })
  if (!res.ok) return null
  return res.text()
}

async function main() {
  const dorms = SEED_FILES.flatMap((file) => parseDormsFromSeed(file))
  const h4sListing = await fetchListingH4SImages()
  const results = []

  for (const dorm of dorms) {
    await sleep(DELAY_MS)
    let imageUrl = null

    try {
      if (dorm.provider === 'home4students') {
        imageUrl = await fetchH4SImage(dorm.slug, h4sListing[dorm.slug])
      } else if (OEAD_CROSS_PROVIDER[dorm.slug]) {
        imageUrl = OEAD_CROSS_PROVIDER[dorm.slug]
      } else {
        const html = await fetchPage(dorm.scrapeUrl)
        if (html) imageUrl = extractImageFromHtml(html, dorm.provider, dorm.slug)
      }
    } catch (err) {
      console.warn(`Failed ${dorm.slug}:`, err.message)
    }

    results.push({ ...dorm, imageUrl })
    const tag = imageUrl ? 'OK' : 'MISSING'
    console.log(`${tag} ${dorm.slug}: ${imageUrl?.split('/').pop() ?? '—'}`)
  }

  const lines = [
    '-- ============================================================================',
    '-- Seed: dorm hero images (generated by scripts/fetch-dorm-images.mjs)',
    '-- APPLY: psql $DATABASE_URL -f supabase/seeds/dorm_images.sql',
    '-- Idempotent: upserts image_url on slug.',
    '-- ============================================================================',
    '',
    ...results
      .filter((r) => r.imageUrl)
      .map(
        (r) =>
          `update public.dorms set image_url = '${r.imageUrl.replace(/'/g, "''")}' where slug = '${r.slug}';`,
      ),
    '',
  ]

  const outPath = path.join(ROOT, 'supabase/seeds/dorm_images.sql')
  fs.writeFileSync(outPath, lines.join('\n'))
  const ok = results.filter((r) => r.imageUrl).length
  console.log(`\nWrote ${ok}/${results.length} images to ${outPath}`)
}

main()
