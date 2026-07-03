import type { ReviewTag } from './review-tags'

const TAG_EMOJI: Record<ReviewTag, string> = {
  thin_walls: '🔇',
  slow_repairs: '🛠️',
  responsive_staff: '🙌',
  unreliable_wifi: '📶',
  reliable_wifi: '📶',
  messy_kitchen: '🍽️',
  clean: '✨',
  great_location: '📍',
  party_dorm: '🎉',
  quiet_dorm: '🤫',
  friendly_community: '🤝',
  small_rooms: '📏',
}

type Translator = (key: string) => string

/** Renders a translated, emoji-prefixed label for a review tag, e.g. "🔇 Thin walls". */
export function reviewTagLabel(t: Translator, tag: ReviewTag): string {
  return `${TAG_EMOJI[tag]} ${t(`tags.${tag}`)}`
}
