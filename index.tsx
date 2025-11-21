
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// --- Global Fetch Interceptor ---
// This ensures that all relative API calls (e.g., fetch('/api/products')) 
// automatically point to the Railway backend URL when deployed on Vercel.

const originalFetch = window.fetch.bind(window);

const interceptedFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    let resource = input;
    
    // Get the API URL from environment variables
    const env = (import.meta as any).env;
    const apiUrl = env.VITE_API_URL;

    // If resource is a string, starts with /api, and we have a base URL, prepend it
    if (apiUrl && typeof resource === 'string' && resource.startsWith('/api')) {
        const cleanApiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
        resource = `${cleanApiUrl}${resource}`;
    }

    return originalFetch(resource, init);
};

// Apply the interceptor safely
// Handles cases where window.fetch is read-only (e.g. Safari, some preview envs)
try {
    window.fetch = interceptedFetch;
} catch (e) {
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
