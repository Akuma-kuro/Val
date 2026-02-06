// Utility functions for Valentine's Week website

class Utils {
    // Check if a day is unlocked
    static isDayUnlocked(dayKey, testingMode = false) {
        if (testingMode) return true;
        
        const dayDate = new Date(CONFIG.dates[dayKey + 'Day']);
        const today = new Date();
        
        // Reset time to midnight for comparison
        today.setHours(0, 0, 0, 0);
        dayDate.setHours(0, 0, 0, 0);
        
        return today >= dayDate;
    }

    // Get days of the week in order
    static getDaysInOrder() {
        return CONFIG.dayOrder;
    }

    // Format date for display
    static formatDate(dateString) {
        const date = new Date(dateString);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    // Get current date
    static getCurrentDate() {
        const now = new Date();
        return now.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Get days until a specific date
    static getDaysUntil(dateString) {
        const targetDate = new Date(dateString);
        const today = new Date();
        
        targetDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        
        const timeDiff = targetDate - today;
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        
        return daysDiff;
    }

    // Get day name from key
    static getDayName(dayKey) {
        const names = {
            'rose': 'Rose Day',
            'propose': 'Propose Day',
            'chocolate': 'Chocolate Day',
            'teddy': 'Teddy Day',
            'promise': 'Promise Day',
            'hug': 'Hug Day',
            'kiss': 'Kiss Day',
            'valentine': "Valentine's Day"
        };
        return names[dayKey] || dayKey;
    }

    // Get emoji for day
    static getDayEmoji(dayKey) {
        const emojis = {
            'rose': '🌹',
            'propose': '💍',
            'chocolate': '🍫',
            'teddy': '🧸',
            'promise': '🤝',
            'hug': '🤗',
            'kiss': '💋',
            'valentine': '💑'
        };
        return emojis[dayKey] || '💕';
    }

    // Create particle effect
    static createParticle(x, y, emoji = '💕') {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = emoji;
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.fontSize = (Math.random() * 20 + 20) + 'px';
        particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
        particle.style.opacity = Math.random() * 0.5 + 0.5;
        
        document.body.appendChild(particle);
        
        // Remove particle after animation completes
        setTimeout(() => particle.remove(), 5000);
    }

    // Show loading spinner
    static showSpinner() {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.style.display = 'flex';
        }
    }

    // Hide loading spinner
    static hideSpinner() {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.style.display = 'none';
        }
    }

    // Show toast notification
    static showToast(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #333;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 9999;
            font-weight: 500;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // Safely get from localStorage
    static getFromLocalStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return defaultValue;
        }
    }

    // Safely save to localStorage
    static saveToLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    }

    // Debounce function
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    // Format time ago (e.g., "2 hours ago")
    static formatTimeAgo(timestamp) {
        const now = new Date();
        const date = new Date(timestamp);
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
        if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
        if (seconds < 604800) return Math.floor(seconds / 86400) + 'd ago';
        
        return date.toLocaleDateString();
    }

    // Check internet connection
    static checkConnection() {
        return navigator.onLine;
    }

    // Copy to clipboard
    static copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
            this.showToast('Copied to clipboard! 📋');
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showToast('Copied to clipboard! 📋');
        }
    }
}

// Add event listener for connection changes
window.addEventListener('online', () => {
    Utils.showToast('Back online! 🌐');
});

window.addEventListener('offline', () => {
    Utils.showToast('You are offline. Changes may not save. 📡');
});
