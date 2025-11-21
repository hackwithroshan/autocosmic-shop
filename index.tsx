
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
    const env = (import.meta as any).env || {}; 
    let apiUrl = env.VITE_API_URL;

    // --- CRITICAL FIX: Sanitize API URL ---
    // Users often accidentally paste quotes '"https://..."' or spaces in Vercel.
    // This block cleans it up automatically to prevent "Cannot connect" errors.
    if (apiUrl) {
        // Remove leading/trailing whitespace
        apiUrl = apiUrl.trim();
        
        // Remove wrapping quotes (single or double) if present
        if ((apiUrl.startsWith('"') && apiUrl.endsWith('"')) || (apiUrl.startsWith("'") && apiUrl.endsWith("'"))) {
            apiUrl = apiUrl.substring(1, apiUrl.length - 1);
        }

        // Remove trailing slash if present
        if (apiUrl.endsWith('/')) {
            apiUrl = apiUrl.slice(0, -1);
        }
    }

    // Logic: If the request is relative (starts with /api), prepend the Backend URL
    if (typeof resource === 'string' && resource.startsWith('/api')) {
        if (apiUrl) {
            resource = `${apiUrl}${resource}`;
            // console.log(`[API Proxy] Redirecting to: ${resource}`);
        } else {
             // Only warn if we are in production (not localhost)
             if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                console.warn('[API Proxy] VITE_API_URL is missing! Requests will fail on Vercel. Please add it in Vercel Settings.');
             }
        }
    }

    return originalFetch(resource, init);
};

// Apply the interceptor safely
try {
    window.fetch = interceptedFetch;
} catch (e) {
    // Fallback for environments where window.fetch is read-only
    try {
        Object.defineProperty(window, 'fetch', {
            value: interceptedFetch,
            writable: true,
            configurable: true
        });
    } catch (err) {
        console.warn('Failed to intercept window.fetch', err);
    }
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
