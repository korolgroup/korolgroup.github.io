// Performance monitoring for Roman Korol's website
(function() {
    'use strict';

    // Only run performance monitoring if supported
    if (!window.performance || !window.performance.timing) {
        return;
    }

    window.addEventListener('load', function() {
        setTimeout(function() {
            var timing = performance.timing;
            var loadTime = timing.loadEventEnd - timing.navigationStart;
            var domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
            var firstPaint = performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint');

            // Log performance metrics (remove in production)
            if (console && console.log) {
                console.log('Page Load Performance:');
                console.log('- Total Load Time: ' + loadTime + 'ms');
                console.log('- DOM Ready: ' + domReady + 'ms');
                if (firstPaint) {
                    console.log('- First Paint: ' + firstPaint.startTime + 'ms');
                }
            }

            // Send to analytics if available
            if (window.gtag) {
                gtag('event', 'timing_complete', {
                    'name': 'load',
                    'value': loadTime
                });
            }
        }, 0);
    });

    // Monitor resource loading
    if (window.PerformanceObserver) {
        var observer = new PerformanceObserver(function(list) {
            var entries = list.getEntries();
            entries.forEach(function(entry) {
                if (entry.duration > 1000) {
                    console.warn('Slow resource detected:', entry.name, entry.duration + 'ms');
                }
            });
        });
        observer.observe({entryTypes: ['resource']});
    }
})();