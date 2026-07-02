#!/usr/bin/env bash
# Create or update the three Dormra scrape jobs on cron-job.org.
# Requires: CRON_JOB_ORG_API_KEY, CRON_SECRET (same as Vercel)
set -euo pipefail

API="${CRON_JOB_ORG_API:-https://api.cron-job.org}"
BASE_URL="${DORMRA_BASE_URL:-https://dormra.eu}"
TZ="${CRON_TIMEZONE:-Europe/Vienna}"

if [[ -z "${CRON_JOB_ORG_API_KEY:-}" ]]; then
  echo "Set CRON_JOB_ORG_API_KEY (cron-job.org Console → Settings)" >&2
  exit 1
fi
if [[ -z "${CRON_SECRET:-}" ]]; then
  echo "Set CRON_SECRET (must match Vercel)" >&2
  exit 1
fi

auth_header="Authorization: Bearer ${CRON_SECRET}"

put_job() {
  local title="$1"
  local url="$2"
  local minutes_json="$3"

  curl -sfS -X PUT "${API}/jobs" \
    -H "Authorization: Bearer ${CRON_JOB_ORG_API_KEY}" \
    -H "Content-Type: application/json" \
    -d "$(jq -n \
      --arg title "$title" \
      --arg url "$url" \
      --arg auth "$auth_header" \
      --argjson minutes "$minutes_json" \
      --arg tz "$TZ" \
      '{
        job: {
          title: $title,
          url: $url,
          enabled: true,
          saveResponses: true,
          requestTimeout: 300,
          requestMethod: 0,
          extendedData: { headers: { Authorization: $auth } },
          schedule: {
            timezone: $tz,
            expiresAt: 0,
            hours: [-1],
            mdays: [-1],
            months: [-1],
            wdays: [-1],
            minutes: $minutes
          }
        }
      }')"
}

echo "Creating/updating Dormra cron jobs at ${BASE_URL}..."

put_job "Dormra fast scrape" \
  "${BASE_URL}/api/cron/scrape?providers=stuwo,home4students&prune=1" \
  '[0,15,30,45]'
echo "  ✓ fast scrape (every 15 min)"

put_job "Dormra OeAD batch 0" \
  "${BASE_URL}/api/cron/scrape?provider=oead&batch=0&batches=2" \
  '[5,20,35,50]'
echo "  ✓ OeAD batch 0"

put_job "Dormra OeAD batch 1" \
  "${BASE_URL}/api/cron/scrape?provider=oead&batch=1&batches=2" \
  '[10,25,40,55]'
echo "  ✓ OeAD batch 1"

echo "Done. Verify at https://console.cron-job.org/"
