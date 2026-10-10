# SS — NFC Digital Contact Card

Static site (HTML, CSS, vanilla JS). No backend, database, trackers or cookies.

## Files
`index.html` · `style.css` · `script.js` · `contact.vcf` (static fallback) · `assets/profile.jpg` · `assets/ss-logo.svg`

To change your photo, replace `assets/profile.jpg` (square, about 600 px, under 150 KB).

## 1. Test locally
Open `index.html` in a browser. Check all six links and the **Save My Contact** button.

## 2. Upload to GitHub
1. Create a new public repository (e.g. `ss-card`) on github.com.
2. Click **Add file → Upload files**, drag in everything from this folder (keep the `assets` folder), then **Commit changes**.

## 3. Deploy (pick one, all free)
- **GitHub Pages:** repo **Settings → Pages → Deploy from a branch → `main` / root → Save**. URL: `https://<username>.github.io/ss-card/`
- **Netlify:** app.netlify.com/drop, drag in the folder. You get an `https://….netlify.app` URL.
- **Cloudflare Pages:** Create project → Direct Upload → upload the folder. You get an `https://….pages.dev` URL.

## 4. Test the public URL
Open the HTTPS URL on your phone (iPhone and Android). Confirm the page loads, each link opens, call/email launch, and the contact saves. Use mobile data too, not just Wi-Fi.

## 5. Write the URL to an NFC card
1. Use NTAG213/215/216 cards.
2. Install **NFC Tools** (iOS/Android) or **NFC Tools** by wakdev.
3. **Write → Add a record → URL/URI**, paste the full `https://` URL → **Write** → hold the card to the phone.
4. Tap the card on a different phone to verify it opens the site. iPhone XS and newer and most Android phones read NFC with no app.

Tip: do not lock the card until you are sure the URL is final.
