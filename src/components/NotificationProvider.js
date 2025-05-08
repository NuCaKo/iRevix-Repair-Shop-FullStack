// NotificationProvider.js
import React, { useEffect } from 'react';

// This version directly manipulates the DOM to create notifications
const NotificationProvider = () => {
    useEffect(() => {
        // Clean up any existing notification elements
        const cleanup = () => {
            // Remove any existing notification containers
            const existingContainers = document.querySelectorAll('.irevix-notification-container');
            existingContainers.forEach(el => el.remove());

            // Remove any existing styles
            const existingStyles = document.getElementById('irevix-notification-styles');
            if (existingStyles) existingStyles.remove();
        };

        // Clean up first
        cleanup();

        // Create styles
        const styleEl = document.createElement('style');
        styleEl.id = 'irevix-notification-styles';
        styleEl.innerHTML = `
      .irevix-notification-container {
        position: fixed;
        top: 20px;
        right: 20px;
        max-width: 350px;
        width: 350px;
        z-index: 99999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        pointer-events: none;
      }
      
      .irevix-notification {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        margin-bottom: 10px;
        overflow: hidden;
        display: flex;
        animation: irevix-notification-in 0.3s ease-out forwards;
        pointer-events: auto;
        width: 100%;
      }
      
      .irevix-notification.removing {
        animation: irevix-notification-out 0.2s ease-in forwards;
      }
      
      .irevix-notification-icon {
        width: 64px;
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: white;
        flex-shrink: 0;
      }
      
      .irevix-notification-icon svg {
        width: 30px;
        height: 30px;
      }
      
      .irevix-notification-icon.customer svg {
        color: #00bcd4;
      }
      
      .irevix-notification-icon.technician svg {
        color: #2196f3;
      }
      
      .irevix-notification-icon.warning svg {
        color: #ff9800;
      }
      
      .irevix-notification-icon.success svg {
        color: #4caf50;
      }
      
      .irevix-notification-icon.error svg {
        color: #f44336;
      }
      
      .irevix-notification-icon.info svg {
        color: #8bc34a;
      }
      
      .irevix-notification-content {
        padding: 12px 16px;
        flex: 1;
      }
      
      .irevix-notification-title {
        margin: 0 0 5px 0;
        font-weight: 600;
        font-size: 16px;
      }
      
      .irevix-notification-message {
        margin: 0;
        font-size: 14px;
        color: #666;
      }
      
      @keyframes irevix-notification-in {
        0% {
          opacity: 0;
          transform: translateX(50px);
        }
        100% {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes irevix-notification-out {
        0% {
          opacity: 1;
          transform: translateX(0);
          max-height: 200px;
          margin-bottom: 10px;
        }
        100% {
          opacity: 0;
          transform: translateX(50px);
          max-height: 0;
          margin-bottom: 0;
        }
      }
    `;
        document.head.appendChild(styleEl);

        // Create container
        const containerEl = document.createElement('div');
        containerEl.className = 'irevix-notification-container';
        document.body.appendChild(containerEl);

        // Override original alert
        const originalAlert = window.alert;

        // Icon templates
        const icons = {
            customer: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"></path></svg>',
            technician: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M507.73 109.1c-2.24-9.03-13.54-12.09-20.12-5.51l-74.36 74.36-67.88-11.31-11.31-67.88 74.36-74.36c6.62-6.62 3.43-17.9-5.66-20.16-47.38-11.74-99.55.91-136.58 37.93-39.64 39.64-50.55 97.1-34.05 147.2L18.74 402.76c-24.99 24.99-24.99 65.51 0 90.5 24.99 24.99 65.51 24.99 90.5 0l213.21-213.21c50.12 16.71 107.47 5.68 147.37-34.22 37.07-37.07 49.7-89.32 37.91-136.73zM64 472c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24z"></path></svg>',
            warning: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M569.517 440.013C587.975 472.007 564.806 512 527.94 512H48.054c-36.937 0-59.999-40.055-41.577-71.987L246.423 23.985c18.467-32.009 64.72-31.951 83.154 0l239.94 416.028zM288 354c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"></path></svg>',
            success: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628.001z"></path></svg>',
            error: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm121.6 313.1c4.7 4.7 4.7 12.3 0 17L338 377.6c-4.7 4.7-12.3 4.7-17 0L256 312l-65.1 65.6c-4.7 4.7-12.3 4.7-17 0L134.4 338c-4.7-4.7-4.7-12.3 0-17l65.6-65-65.6-65.1c-4.7-4.7-4.7-12.3 0-17l39.6-39.6c4.7-4.7 12.3-4.7 17 0l65 65.7 65.1-65.6c4.7-4.7 12.3-4.7 17 0l39.6 39.6c4.7 4.7 4.7 12.3 0 17L312 256l65.6 65.1z"></path></svg>',
            info: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 110c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z"></path></svg>'
        };

        // Title maps (all in English)
        const titles = {
            customer: 'Customer Notification',
            technician: 'Technician Notification',
            warning: 'Warning',
            success: 'Success',
            error: 'Error',
            info: 'Information'
        };

        // Create notification function
        const createNotification = (type, message) => {
            // Get icon and title
            const icon = icons[type] || icons.info;
            const title = titles[type] || titles.info;

            // Create notification element
            const notificationEl = document.createElement('div');
            notificationEl.className = 'irevix-notification';
            if (type === 'customer') {
                notificationEl.classList.add('customer-notification');
            }

            // Create the notification content
            notificationEl.innerHTML = `
        <div class="irevix-notification-icon ${type}">
          ${icon}
        </div>
        <div class="irevix-notification-content">
          <h4 class="irevix-notification-title">${title}</h4>
          <p class="irevix-notification-message">${message}</p>
        </div>
      `;

            // Add to container
            containerEl.appendChild(notificationEl);

            // Set timeout for removal after 3 seconds (or 5 seconds for non-customer notifications)
            const displayTime = type === 'customer' ? 3000 : 5000;
            setTimeout(() => {
                notificationEl.classList.add('removing');
                setTimeout(() => {
                    if (notificationEl.parentNode === containerEl) {
                        containerEl.removeChild(notificationEl);
                    }
                }, 300); // Animation time
            }, displayTime);

            return notificationEl;
        };

        // Export global methods
        window.showNotification = createNotification;

        // Override alert to show notification
        window.alert = (message) => {
            createNotification('customer', message);
        };

        // Clean up when component unmounts
        return () => {
            window.alert = originalAlert;
            delete window.showNotification;
            cleanup();
        };
    }, []);

    // This component doesn't render anything
    return null;
};

export default NotificationProvider;