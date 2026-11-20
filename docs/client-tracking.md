# TAPMO Client Tracking Snippet

Copy and paste this snippet into your NFC card website's `<head>` section (before closing `</head>`) or at the beginning of your `<script>` tag.

## Prerequisites

- A Supabase project running the TAPMO schema (`card_taps` table with RLS enabled).
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` set in your Vercel environment variables.
- The serverless API functions `api/track-view.ts` and `api/taps.ts` deployed to Vercel.

## Usage

1. Replace `CLIENT_ID` with a unique string identifying the client (e.g., their Instagram handle, email, or NFC card UID).
2. The script automatically sends a `page_view` event when the page loads.
3. To track an `nfc_tap` event (e.g., when the NFC chip is tapped to open the card), call:

```js
window.TAPMO_TRACK.nfc_tap();
```

## Example (Embedding in an NFC Card Website)

```html
<head>
  <!-- Paste this in your NFC card website's <head> -->
  <script src="https://YOUR_SUPABASE_PROJECT_ID.supabase.co/client-tracking.js"></script>
  <script>
    // Set the client ID after the script loads
    window.TAPMO_TRACK = {
      clientId: 'your-client-id-here',
      serverUrl: 'https://tapmo-website.vercel.app/api/track-view'
    };
  </script>
</head>
```

## API Payload

The script sends this JSON payload to `POST /api/track-view`:

```json
{
  "clientId": "your-client-id",
  "eventType": "nfc_tap",
  "pageUrl": "https://your-nfc-site.vercel.app/profile",
  "referrer": "https://www.google.com",
  "userAgent": "Mozilla/5.0 ..."
}
```

## Database Schema

The `card_taps` table stores every tap and view event:

```sql
create table public.card_taps (
  id uuid primary key default gen_random_uuid(),
  client_id text not null,
  event_type text not null check (event_type in ('nfc_tap', 'page_view')),
  page_url text not null,
  referrer text,
  user_agent text,
  created_at timestamptz not null default now()
);

-- RLS policies (enabled in schema.sql)
-- Public insert (allow client websites to send events)
-- Staff read (allow admin/super_admin dashboard to query)
```