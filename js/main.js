// Main application logic
class ValentineWeekApp {
    constructor() {
        this.currentDay = null;
        this.storage = null;
        this.dayInstances = {};
        this.initStorage();
    }

    initStorage() {
        // Use GitHub API if configured, otherwise fall back to localStorage
        const gitHub = new GitHubStorage(CONFIG);
        if (gitHub.isReady()) {
            this.storage = gitHub;
        } else {
            this.storage = new LocalStorage();
        }
    }

    async initialize() {
        try {
            Utils.showSpinner();
            
            // Initialize storage
            await this.storage.initialize();
            
            // Update UI
            this.updateAuthStatus();
            this.updateCurrentDate();
            this.setupNavigation();
            this.createDayInstances();
            
            // Show the first unlocked day
            await this.showFirstUnlockedDay();
            
            // Setup testing toggle
            this.setupTestingToggle();
            
            Utils.hideSpinner();
        } catch (error) {
            console.error('Initialization error:', error);
            Utils.hideSpinner();
            Utils.showToast('Error loading app. Please refresh! ⚠️');
        }
    }

    updateAuthStatus() {
        const authStatus = document.getElementById('auth-message');
        if (this.storage instanceof GitHubStorage && this.storage.isReady()) {
            authStatus.textContent = '✅ GitHub Synced';
            authStatus.style.color = '#4caf50';
        } else {
            authStatus.textContent = '💾 Local Storage';
            authStatus.style.color = '#ff9800';
        }
    }

    updateCurrentDate() {
        document.getElementById('current-date').textContent = Utils.getCurrentDate();
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleNavClick(e));
        });
    }

    handleNavClick(e) {
        const dayKey = e.target.dataset.day;
        const isUnlocked = Utils.isDayUnlocked(dayKey, CONFIG.testing);
        
        if (!isUnlocked && !CONFIG.testing) {
            const dayDate = CONFIG.dates[dayKey + 'Day'];
            const daysUntil = Utils.getDaysUntil(dayDate);
            Utils.showToast(`This day unlocks in ${daysUntil} day(s)! 🔒`);
            return;
        }
        
        this.showDay(dayKey);
    }

    createDayInstances() {
        this.dayInstances = {
            rose: new RoseDay(this.storage),
            propose: new ProposeDay(this.storage),
            chocolate: new ChocolateDay(this.storage),
            teddy: new TeddyDay(this.storage),
            promise: new PromiseDay(this.storage),
            hug: new HugDay(this.storage),
            kiss: new KissDay(this.storage),
            valentine: new ValentineDay(this.storage)
        };
    }

    async showFirstUnlockedDay() {
        const days = Utils.getDaysInOrder();
        
        for (const dayKey of days) {
            if (Utils.isDayUnlocked(dayKey, CONFIG.testing)) {
                await this.showDay(dayKey);
                return;
            }
        }
        
        // All days are locked, show the first one as locked
        this.showLockedDay(days[0]);
    }

    async showDay(dayKey) {
        // Hide all day views
        document.querySelectorAll('.day-view').forEach(view => {
            view.style.display = 'none';
        });
        
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.day === dayKey) {
                btn.classList.add('active');
            }
        });
        
        // Check if day is unlocked
        const isUnlocked = Utils.isDayUnlocked(dayKey, CONFIG.testing);
        
        if (!isUnlocked) {
            this.showLockedDay(dayKey);
            return;
        }
        
        // Show the day view
        const dayView = document.getElementById(`day-${dayKey}`);
        if (dayView) {
            dayView.style.display = 'block';
            dayView.classList.add('active');
            
            // Initialize day if not already done
            if (this.dayInstances[dayKey] && !this.dayInstances[dayKey].initialized) {
                await this.dayInstances[dayKey].init();
                this.dayInstances[dayKey].initialized = true;
            }
        }
        
        this.currentDay = dayKey;
    }

    showLockedDay(dayKey) {
        const lockedView = document.getElementById('day-locked');
        const unlockMessage = document.getElementById('unlock-message');
        const dayDate = CONFIG.dates[dayKey + 'Day'];
        const daysUntil = Utils.getDaysUntil(dayDate);
        const dayName = Utils.getDayName(dayKey);
        
        lockedView.style.display = 'block';
        lockedView.classList.add('active');
        
        if (daysUntil > 0) {
            unlockMessage.textContent = `${dayName} 🔒 unlocks in ${daysUntil} day(s)! Come back then to celebrate!`;
        } else {
            unlockMessage.textContent = `${dayName} 🔒 is coming! Stay tuned!`;
        }
    }

    setupTestingToggle() {
        const testingControl = document.querySelector('.testing-control');
        const testingBtn = document.getElementById('testing-toggle');
        
        // Show testing control if in development or if already testing
        if (CONFIG.testing || window.location.hostname === 'localhost') {
            testingControl.style.display = 'block';
        }
        
        testingBtn.addEventListener('click', () => {
            CONFIG.testing = !CONFIG.testing;
            localStorage.setItem('valentineTest', CONFIG.testing);
            Utils.showToast(`Testing mode ${CONFIG.testing ? 'enabled' : 'disabled'}! 🧪`);
            location.reload();
        });
    }

    // Static method to update UI periodically
    static updateUI() {
        const dateDisplay = document.getElementById('current-date');
        if (dateDisplay) {
            dateDisplay.textContent = Utils.getCurrentDate();
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ValentineWeekApp();
    window.app.initialize();
    
    // Update UI every minute
    setInterval(() => {
        ValentineWeekApp.updateUI();
    }, 60000);
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl+M to toggle mobile view for testing
    if (e.ctrlKey && e.key === 'm') {
        document.body.style.maxWidth = document.body.style.maxWidth ? '' : '480px';
        document.body.style.margin = '0 auto';
    }
});
