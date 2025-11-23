
// Standard Facebook Pixel Type Definition
declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export const initFacebookPixel = (pixelId: string) => {
  if (!pixelId) return;
  
  // Prevent double initialization
  if (window.fbq) return;

  /* eslint-disable */
  (function(f:any,b:any,e:any,v:any,n?:any,t?:any,s?:any)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)})(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */

  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');
};

export const trackEvent = (event: string, data?: any) => {
  if (window.fbq) {
    window.fbq('track', event, data);
  }
};

export const trackCustomEvent = (event: string, data?: any) => {
  if (window.fbq) {
    window.fbq('trackCustom', event, data);
  }
};
