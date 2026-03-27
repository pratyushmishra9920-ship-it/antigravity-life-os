/**
 * Life OS Entry Point
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Storage defaults
    window.Storage.initDefaults();

    // 2. Initialize UI (Navigation, Theme, etc)
    window.UI.init();

    // 3. Initialize Modules
    window.Dashboard.init();
    if(window.Planner) window.Planner.init();
    if(window.Study) window.Study.init();
    if(window.MoodTracker) window.MoodTracker.init();

    // 4. Init Premium Cursor Tracking for Cards
    document.getElementById('view-dashboard').addEventListener('mousemove', e => {
        for(const card of document.querySelectorAll('.card')) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        }
    });

    console.log("Life OS initialized successfully.");
});
