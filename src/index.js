import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Intercept organization-related network requests in development mode
if (process.env.NODE_ENV === 'development') {
    // Save original fetch
    const originalFetch = window.fetch;

    // Create a fetch wrapper that blocks organization requests
    window.fetch = function(resource, options) {
        // Check if this is an organization-related API call
        if (typeof resource === 'string' &&
            (resource.includes('/organizations/') ||
                resource.includes('/memberships'))) {

            // Instead of making the actual request, return a fake successful response
            return Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ id: 'fake-id' }),
                text: () => Promise.resolve('{}')
            });
        }

        // For all other requests, use the original fetch
        return originalFetch.apply(this, arguments);
    };

    // For XMLHttpRequest (some libraries might use this instead of fetch)
    const originalOpen = XMLHttpRequest.prototype.open;

    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        // Check if this is an organization-related API call
        if (typeof url === 'string' &&
            (url.includes('/organizations/') ||
                url.includes('/memberships'))) {

            // Replace with a dummy URL that will never actually be called
            url = 'https://dummy-url-to-prevent-organization-calls.com';
        }

        // Call the original open method with possibly modified URL
        return originalOpen.call(this, method, url, ...rest);
    };
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);