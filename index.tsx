
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// --- Global Fetch Interceptor ---
// This ensures that API calls point to the Railway backend URL,
// EXCEPT for the email service which runs on Vercel Serverless.

const originalFetch = window.fetch.bind(window);

const interceptedFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    let resource = input;
    
    // Get the API URL from environment variables safely
    const env = (import.meta as any).env || {}; 
    let apiUrl = env.VITE_API_URL;

    // --- CRITICAL FIX: Sanitize API URL ---
    // We route all /api requests to the Backend Server (Railway),
    // UNLESS it is '/api/send-email', which must be handled by Vercel (Serverless).
    if (typeof resource === 'string' && resource.startsWith('/api') && !resource.startsWith('/api/send-email')) {
        
        if (apiUrl) {
            // 1. Remove whitespace
            apiUrl = apiUrl.trim();
            
            // 2. Remove accidental quotes (common Vercel copy-paste error)
            if ((apiUrl.startsWith('"') && apiUrl.endsWith('"')) || (apiUrl.startsWith("'") && apiUrl.endsWith("'"))) {
                apiUrl = apiUrl.substring(1, apiUrl.length - 1);
            }

            // 3. Remove trailing slash to prevent double slashes
            if (apiUrl.endsWith('/')) {
                apiUrl = apiUrl.slice(0, -1);
            }

            // 4. Construct the full URL for backend calls
            resource = `${apiUrl}${resource}`;
            
            // 5. LOGGING (Optional: Enable for debugging)
            // console.log(`[API Proxy] Requesting: ${resource}`);
        } else {
             // Only warn in production or if not localhost to prevent noise
             if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                console.error('🚨 [CRITICAL ERROR] VITE_API_URL is missing in Vercel Environment Variables!');
                console.error('👉 Please add VITE_API_URL in Vercel Settings pointing to your Railway Backend.');
                console.error('👉 Example: https://your-backend.up.railway.app');
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
