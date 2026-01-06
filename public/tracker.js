(function() {
  // 1. Get the current script element to read the ID
  const script = document.currentScript;
  const websiteId = script.getAttribute('data-website-id');

  // 2. IMPORTANT: Find where this script file lives (Your Vercel App)
  // This extracts "https://simple-stats-sandy.vercel.app" from the src
  const trackerOrigin = new URL(script.src).origin;

  if (!websiteId) {
    console.error('SimpleStats: Missing data-website-id attribute');
    return;
  }

  // 3. Gather Data
  const data = {
    website_id: websiteId,
    url: window.location.pathname,
    referrer: document.referrer || 'Direct',
    device: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
    user_agent: navigator.userAgent
  };

  // 4. Send Data to the TRACKER ORIGIN (Not the current website)
  // We use ${trackerOrigin}/api/track instead of just /api/track
  fetch(`${trackerOrigin}/api/track`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  .catch(err => console.error('SimpleStats Error:', err));
})();