// Configuration for Valentine's Week 2026 website
const CONFIG = {
    github: {
        owner: 'YOUR_GITHUB_USERNAME',
        repo: 'Val',
        token: 'ghp_YOUR_PERSONAL_ACCESS_TOKEN', // Token with repo write access
        branch: 'main'
    },
    dates: {
        roseDay: '2026-02-07',
        proposeDay: '2026-02-08',
        chocolateDay: '2026-02-09',
        teddyDay: '2026-02-10',
        promiseDay: '2026-02-11',
        hugDay: '2026-02-12',
        kissDay: '2026-02-13',
        valentineDay: '2026-02-14'
    },
    testing: false, // Set to true to unlock all days for testing
    dayOrder: ['rose', 'propose', 'chocolate', 'teddy', 'promise', 'hug', 'kiss', 'valentine']
};

// Load testing mode if available in localStorage or query params
function loadTestingMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const testParam = urlParams.get('test');
    const storedTest = localStorage.getItem('valentineTest');
    
    if (testParam === 'true' || storedTest === 'true') {
        CONFIG.testing = true;
    }
    
    // Secret keyboard combo: Ctrl+Shift+V to toggle testing mode
    let keysPressed = {};
    window.addEventListener('keydown', (e) => {
        keysPressed[e.key] = true;
        
        // Ctrl+Shift+V
        if (keysPressed['Control'] && keysPressed['Shift'] && e.key === 'v') {
            CONFIG.testing = !CONFIG.testing;
            localStorage.setItem('valentineTest', CONFIG.testing);
            location.reload();
        }
    });
    
    window.addEventListener('keyup', (e) => {
        keysPressed[e.key] = false;
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', loadTestingMode);
