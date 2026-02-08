// Handle hideMenuByDefault parameter
// Run immediately, not waiting for DOMContentLoaded
(function () {
    'use strict';

    function hideMenuIfNeeded() {
        // Only run on desktop screens (width >= 1024px)
        if (window.innerWidth >= 1024) {
            // Check if the body has the data-hide-menu-default attribute
            const hideMenuDefault = document.body.getAttribute('data-hide-menu-default');

            if (hideMenuDefault === 'true') {
                // Remove the toggled class to hide the sidebar on desktop
                const pageWrapper = document.querySelector('.page-wrapper');
                if (pageWrapper) {
                    pageWrapper.classList.remove('toggled');
                    console.log('Sidebar hidden by default on desktop due to hideMenuByDefault parameter');
                }
            } else {
                // Keep the toggled class to show the sidebar on desktop
                // (it's already added by default in the HTML)
                console.log('Sidebar shown by default on desktop (normal behavior)');
            }
        }
        // On mobile (width < 1024px), do nothing - let CSS handle it
    }

    // Run immediately if body is already available
    if (document.body) {
        hideMenuIfNeeded();
    } else {
        // Otherwise wait for DOMContentLoaded
        document.addEventListener('DOMContentLoaded', hideMenuIfNeeded);
    }
})();
