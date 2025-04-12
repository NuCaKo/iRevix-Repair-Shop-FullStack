import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
if (process.env.NODE_ENV === 'development') {
    const originalFetch = window.fetch;
    window.fetch = function(resource, options) {
        if (typeof resource === 'string' &&
            (resource.includes('/organizations/') ||
                resource.includes('/memberships'))) {
            return Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ id: 'fake-id' }),
                text: () => Promise.resolve('{}')
            });
        }
        return originalFetch.apply(this, arguments);
    };
    const originalOpen = XMLHttpRequest.prototype.open;

    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        if (typeof url === 'string' &&
            (url.includes('/organizations/') ||
                url.includes('/memberships'))) {
            url = 'https://dummy-url-to-prevent-organization-calls.com';
        }
        return originalOpen.call(this, method, url, ...rest);
    };
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);