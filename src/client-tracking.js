// TAPMO Client Tracking Snippet
// Embed this script on every NFC card website / client page to report taps & views.
// Replace CLIENT_ID with the unique identifier for your NFC card / Instagram profile.

;(function () {
  'use strict';

  // --- CONFIG ---
  const CLIENT_ID = 'YOUR_CLIENT_ID_HERE'; // <-- REPLACE with your client ID
  const SERVER_URL = 'https://tapmo-website.vercel.app/api/track-view';

  // --- Helpers ---
  function getUserAgent() {
    if (typeof navigator !== 'undefined') return navigator.userAgent || '';
    return '';
  }

  function getReferrer() {
    if (typeof document !== 'undefined') {
      const referrer = document.referrer || null;
      return referrer === '' ? null : referrer;
    }
    return null;
  }

  function sendEvent(eventType) {
    if (!CLIENT_ID || CLIENT_ID === 'YOUR_CLIENT_ID_HERE') {
      console.warn('TAPMO: clientId not set — skipping event.');
      return;
    }

    const payload = {
      clientId: CLIENT_ID,
      eventType: eventType,
      pageUrl: window.location.href,
      referrer: getReferrer(),
      userAgent: getUserAgent(),
    };

    // Send asynchronously; errors are swallowed to not break the page
    fetch(SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {
      // Silently fail — the site should work even if analytics fail
    });
  }

  // --- Expose on window for debugging (optional) ---
  window.TAPMO_TRACK = {
    nfc_tap: () => sendEvent('nfc_tap'),
    page_view: () => sendEvent('page_view'),
  };

  // --- Auto-track NFC tap if the page has an NFC interaction handler window.TAPMO_NFC_TAP ---
  // Clients can call window.TAPMO_TRACK.nfc_tap() when their NFC chip is tapped.
  // Or they can listen for a custom event if they handle NFC natively.
})();