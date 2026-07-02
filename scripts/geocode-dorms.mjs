// One-off script: geocode seed dorm addresses via Nominatim (OpenStreetMap).
// Not part of the app build — run manually, output pasted into seed files.
const DORMS = [
  ['stuwo-arsenal', 'Gänsbachergasse 10, 1030 Wien, Austria'],
  ['stuwo-seestadt-aspern', 'Sonnenallee 24, 1220 Wien, Austria'],
  ['stuwo-dueckegasse', 'Dückegasse 3, 1220 Wien, Austria'],
  ['stuwo-triester-strasse', 'Triester Straße 40, 1100 Wien, Austria'],
  ['stuwo-kenyongasse', 'Kenyongasse 23-25, 1070 Wien, Austria'],
  ['stuwo-strozzigasse', 'Strozzigasse 6-8, 1080 Wien, Austria'],
  ['stuwo-strudlhofgasse', 'Strudlhofgasse 5, 1090 Wien, Austria'],
  ['stuwo-simmering', 'Rautenstrauchgasse 5, 1110 Wien, Austria'],
  ['stuwo-spengergasse', 'Spengergasse 27, 1050 Wien, Austria'],
  ['stuwo-vorgartenstrasse', 'Vorgartenstrasse 110A, 1020 Wien, Austria'],
  ['stuwo-schmelz', 'Auf der Schmelz 12, 1150 Wien, Austria'],
  ['stuwo-donaufelder-strasse', 'Donaufelder Straße 159, 1210 Wien, Austria'],
  ['oead-guesthouse-gasgasse', 'Gasgasse 2, 1150 Wien, Austria'],
  ['oead-guesthouse-kandlgasse', 'Kandlgasse 30, 1070 Wien, Austria'],
  ['oead-guesthouse-molkereistrasse', 'Molkereistrasse 1, 1020 Wien, Austria'],
  ['oead-guesthouse-sechshauser-strasse', 'Sechshauser Strasse 31, 1150 Wien, Austria'],
  ['oead-guesthouse-simmeringer-hauptstrasse', 'Simmeringer Hauptstrasse 143, 1110 Wien, Austria'],
  ['oead-guesthouse-tigergasse', 'Tigergasse 23-27, 1080 Wien, Austria'],
  ['oead-apartment-auf-der-schmelz', 'Auf der Schmelz 10, 1150 Wien, Austria'],
  ['oead-apartment-hafnersteig', 'Hafnersteig 5, 1010 Wien, Austria'],
  ['oead-apartment-obermuellnerstrasse', 'Obermuellnerstrasse 2c, 1020 Wien, Austria'],
  ['oead-apartment-poetzleinsdorfer-strasse', 'Poetzleinsdorfer Strasse 38, 1180 Wien, Austria'],
  ['popup-dorms', 'Sonnenallee 105, 1220 Wien, Austria'],
  ['sonnenallee', 'Sonnenallee 41, 1220 Wien, Austria'],
  ['adelheid-popp-gasse', 'Adelheid-Popp-Gasse 24, 1220 Wien, Austria'],
  ['brigittenauer-laende', 'Brigittenauer Laende 224, 1200 Wien, Austria'],
  ['donaufelderstrasse', 'Donaufelder Strasse 54, 1210 Wien, Austria'],
  ['dueckegasse', 'Dueckegasse 3, 1220 Wien, Austria'],
  ['forsthausgasse', 'Forsthausgasse 2-8, 1200 Wien, Austria'],
  ['garnisongasse', 'Garnisongasse 14-16, 1090 Wien, Austria'],
  ['gumpendorferstrasse', 'Gumpendorferstrasse 39, 1060 Wien, Austria'],
  ['gymnasiumstrasse', 'Gymnasiumstrasse 85, 1190 Wien, Austria'],
  ['josef-baumann-gasse', 'Josef-Baumann-Gasse 8a, 1220 Wien, Austria'],
  ['kaisermuehlenstrasse', 'Kaisermuehlenstrasse 14, 1220 Wien, Austria'],
  ['lorenz-mueller-gasse', 'Lorenz-Mueller-Gasse 1A, 1200 Wien, Austria'],
  ['medwedweg', 'Medwedweg 3, 1110 Wien, Austria'],
  ['peter-jordan-strasse', 'Peter-Jordan-Strasse 1, 1190 Wien, Austria'],
  ['tuerkenstrasse', 'Tuerkenstrasse 3, 1090 Wien, Austria'],
  ['h4s-grosse-schiffgasse', 'Große Schiffgasse 12, 1020 Wien, Austria'],
  ['h4s-schaeffergasse', 'Schäffergasse 2, 1040 Wien, Austria'],
  ['h4s-neudeggergasse', 'Neudeggergasse 21, 1080 Wien, Austria'],
  ['h4s-boltzmanngasse', 'Boltzmanngasse 10, 1090 Wien, Austria'],
  ['h4s-hofergasse', 'Höfergasse 13, 1090 Wien, Austria'],
  ['h4s-sensengasse', 'Sensengasse 2b, 1090 Wien, Austria'],
  ['h4s-erlachplatz', 'Erlachplatz 5, 1100 Wien, Austria'],
  ['h4s-ullmannstrasse', 'Ullmannstraße 54, 1150 Wien, Austria'],
  ['h4s-doebling-front', 'Döblinger Hauptstraße 55, 1190 Wien, Austria'],
  ['h4s-doebling-back', 'Döblinger Hauptstraße 55, 1190 Wien, Austria'],
  ['h4s-popup-seestadt', 'Sonnenallee 105, 1220 Wien, Austria'],
]

const cache = new Map()
const results = {}

async function geocode(address) {
  if (cache.has(address)) return cache.get(address)
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'dormra-geocode-script/1.0 (one-off seed geocoding; contact via github.com/kulchankas/dormra)' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${address}`)
  const data = await res.json()
  const hit = data[0] ? { lat: Number(data[0].lat), lng: Number(data[0].lon) } : null
  cache.set(address, hit)
  return hit
}

for (const [slug, address] of DORMS) {
  try {
    const coords = await geocode(address)
    results[slug] = coords
    console.error(`${coords ? 'OK  ' : 'MISS'} ${slug} -> ${coords ? `${coords.lat}, ${coords.lng}` : 'no match'} (${address})`)
  } catch (err) {
    console.error(`FAIL ${slug}: ${err.message}`)
    results[slug] = null
  }
  await new Promise((r) => setTimeout(r, 1100))
}

console.log(JSON.stringify(results, null, 2))
