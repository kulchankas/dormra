/** Full dorm row — single source of truth for the `dorms` table shape. */
export interface Dorm {
  id: string
  slug: string
  provider: string
  name: string
  address: string | null
  district: number | null
  price_min: number | null
  price_max: number | null
  deposit_eur: number | null
  deposit_months: number | null
  website_url: string | null
  apply_url: string | null
  scrape_url: string | null
  scrape_type: string | null
  pets: boolean | null
  couples: boolean | null
  furnished: boolean | null
  min_stay_months: number | null
  max_stay_months: number | null
  notes: string | null
  active: boolean
  created_at: string
  image_url: string | null
  lat: number | null
  lng: number | null
}

/** Subset used by the alert email template. */
export type DormAlertInfo = Pick<
  Dorm,
  | 'id'
  | 'slug'
  | 'name'
  | 'provider'
  | 'address'
  | 'district'
  | 'price_min'
  | 'price_max'
  | 'apply_url'
>

/** Subset used by alert matching + dispatch. */
export type DormForAlertMatching = Pick<
  Dorm,
  | 'id'
  | 'slug'
  | 'name'
  | 'provider'
  | 'address'
  | 'district'
  | 'price_min'
  | 'price_max'
  | 'pets'
  | 'couples'
  | 'deposit_months'
  | 'apply_url'
>
