import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// --- Global Fetch Interceptor ---
const originalFetch = window.fetch.bind(window);

const interceptedFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    let resource = input;
    
    const env = (import.meta as any).env || {}; 
    let apiUrl = env.VITE_API_URL;

    // --- CRITICAL FIX: Sanitize API URL ---
    // We route all /api requests to the Backend Server (Railway),
    // UNLESS it is '/api/send-email', which must be handled by Vercel (Serverless).
    if (typeof resource === 'string' && resource.startsWith('/api') && !resource.startsWith('/api/send-email')) {
        
        if (apiUrl) {
            // 1. Remove whitespace
            apiUrl = apiUrl.trim();
            
            // 2. Remove accidental quotes
            if ((apiUrl.startsWith('"') && apiUrl.endsWith('"')) || (apiUrl.startsWith("'") && apiUrl.endsWith("'"))) {
                apiUrl = apiUrl.substring(1, apiUrl.length - 1);
            }

            // 3. Remove trailing slash
            if (apiUrl.endsWith('/')) {
                apiUrl = apiUrl.slice(0, -1);
            }

            // 4. Construct URL
            resource = `${apiUrl}${resource}`;
        } else {
             if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                console.error('🚨 [CRITICAL] VITE_API_URL is missing!');
                // Show a visible alert on screen for the user/dev
                const existingAlert = document.getElementById('api-error-alert');
                if (!existingAlert) {
                    const div = document.createElement('div');
                    div.id = 'api-error-alert';
                    div.style.cssText = 'position:fixed;top:0;left:0;right:0;background:red;color:white;padding:10px;text-align:center;z-index:9999;font-weight:bold;';
                    div.innerText = 'Critical Error: Backend URL (VITE_API_URL) is not set in Vercel Settings.';
                    document.body.appendChild(div);
                }
             }
        }
    }

    return originalFetch(resource, init);
};

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