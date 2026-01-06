(function() {
  'use strict';

  // Find the script tag that loaded this script
  const scripts = document.getElementsByTagName('script');
  let scriptTag = null;
  const currentScript = document.currentScript;

  if (currentScript) {
    scriptTag = currentScript;
  } else {
    // Fallback: find the last script tag (likely this one)
    scriptTag = scripts[scripts.length - 1];
  }

  // Get website ID from data attribute
  const websiteId = scriptTag?.getAttribute('data-website-id');

  if (!websiteId) {
    console.warn('SimpleStats: data-website-id attribute not found on script tag');
    return;
  }

  // Get tracking data
  const url = window.location.href;
  const referrer = document.referrer || '';

  // Detect device type (simple detection)
  const userAgent = navigator.userAgent.toLowerCase();
  let device = 'desktop';
  
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    device = 'mobile';
  } else if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    device = 'tablet';
  }

  // Get the base URL (defaults to current origin if script is on same domain)
  // For cross-domain tracking, this would be set via data-api-url attribute
  const apiUrl = scriptTag?.getAttribute('data-api-url') || '/api/track';

  // Send tracking data
  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: url,
      referrer: referrer,
      device: device,
      website_id: websiteId,
    }),
    keepalive: true, // Ensure request completes even if page unloads
  }).catch(function(error) {
    // Silently fail - don't interrupt user experience
    console.debug('SimpleStats tracking error:', error);
  });
})();

