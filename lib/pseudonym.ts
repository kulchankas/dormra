/**
 * Generates a fresh, human-friendly anonymous display name for a single dorm
 * review. Deliberately NOT tied to a user account or reused across reviews —
 * see docs/COMMUNITY_REVIEWS.md §2 for why a per-review pseudonym (rather
 * than a persistent per-user handle, à la Reddit) is the safer anonymity
 * model for a small, easily-correlatable community like Dormra's.
 */

const ADJECTIVES = [
  'Sleepy',
  'Curious',
  'Cozy',
  'Wandering',
  'Quiet',
  'Cheerful',
  'Nocturnal',
  'Frugal',
  'Studious',
  'Caffeinated',
  'Homesick',
  'Punctual',
  'Chaotic',
  'Chilly',
  'Sunny',
  'Nomadic',
  'Thrifty',
  'Dreamy',
  'Rowdy',
  'Bookish',
] as const

const NOUNS = [
  'Otter',
  'Fox',
  'Owl',
  'Hedgehog',
  'Sparrow',
  'Badger',
  'Raccoon',
  'Squirrel',
  'Penguin',
  'Deer',
  'Rabbit',
  'Wolf',
  'Cat',
  'Marten',
  'Heron',
  'Fawn',
  'Lynx',
  'Swan',
  'Beetle',
  'Falcon',
] as const

/** Generate a random pseudonym, e.g. "Sleepy Otter #482". */
export function generatePseudonym(random: () => number = Math.random): string {
  const adjective = ADJECTIVES[Math.floor(random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(random() * NOUNS.length)]
  const suffix = Math.floor(random() * 900) + 100
  return `${adjective} ${noun} #${suffix}`
}

const PSEUDONYM_PATTERN = /^[A-Za-z]+ [A-Za-z]+ #\d{3}$/

/** True if a string looks like a generated pseudonym (used in tests/sanity checks). */
export function isPseudonym(value: string): boolean {
  return PSEUDONYM_PATTERN.test(value)
}
