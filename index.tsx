
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// --- Global Fetch Interceptor ---
// This ensures that all relative API calls (e.g., fetch('/api/products')) 
// automatically point to the Railway backend URL when deployed on Vercel.

const originalFetch = window.fetch.bind(window);

const interceptedFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    let resource = input;
    
    // Get the API URL from environment variables safely
    // In Vite, import.meta.env is the standard way to access env vars
    const env = (import.meta as any).env || {}; 
    let apiUrl = env.VITE_API_URL;

    // --- CRITICAL FIX: Sanitize API URL ---
    if (typeof resource === 'string' && resource.startsWith('/api')) {
        if (apiUrl) {
            // 1. Remove whitespace
            apiUrl = apiUrl.trim();
            
            // 2. Remove accidental quotes (common Vercel copy-paste error)
            if ((apiUrl.startsWith('"') && apiUrl.endsWith('"')) || (apiUrl.startsWith("'") && apiUrl.endsWith("'"))) {
                apiUrl = apiUrl.substring(1, apiUrl.length - 1);
            }

            // 3. Remove trailing slash to prevent double slashes (e.g., .app//api)
            if (apiUrl.endsWith('/')) {
                apiUrl = apiUrl.slice(0, -1);
            }

            // 4. Construct the full URL
            resource = `${apiUrl}${resource}`;
            
            // 5. LOGGING (Crucial for debugging Network Errors)
            console.log(`[API Proxy] Requesting: ${resource}`);
        } else {
             // Only warn if we are in production (not localhost)
             if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                console.error('[API Proxy] ❌ VITE_API_URL is MISSING in Vercel Environment Variables!');
                console.warn('Request will likely fail. Please add VITE_API_URL to Vercel Settings.');
             }
        }
    }

    return originalFetch(resource, init);
};

// Apply the interceptor safely
try {
    window.fetch = interceptedFetch;
} catch (e) {
    console.warn('Failed to intercept window.fetch', e);
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
