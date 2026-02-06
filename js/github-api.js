// GitHub API Storage class for data persistence

class GitHubStorage {
    constructor(config) {
        this.owner = config.github.owner;
        this.repo = config.github.repo;
        this.token = config.github.token;
        this.branch = config.github.branch;
        this.apiBase = 'https://api.github.com';
        this.isConfigured = !config.github.token.includes('YOUR_');
    }

    // Check if properly configured
    isReady() {
        return this.isConfigured;
    }

    // Initialize storage - create data folder if needed
    async initialize() {
        if (!this.isReady()) {
            console.warn('GitHub not configured. Using localStorage only.');
            return false;
        }

        try {
            // Try to read progress.json to see if data folder exists
            await this.readFile('data/progress.json');
        } catch (error) {
            // File doesn't exist, create it
            const initialProgress = {
                daysUnlocked: [],
                daysCompleted: [],
                startedAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };
            try {
                await this.writeFile('data/progress.json', initialProgress, 'Initialize progress tracking');
                console.log('Progress tracking initialized');
            } catch (writeError) {
                console.error('Failed to initialize progress file:', writeError);
                return false;
            }
        }

        return true;
    }

    // Read file from GitHub
    async readFile(path) {
        if (!this.isReady()) {
            throw new Error('GitHub not configured');
        }

        const url = `${this.apiBase}/repos/${this.owner}/${this.repo}/contents/${path}`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${this.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`File not found: ${path}`);
            }
            throw new Error(`Failed to read ${path}: ${response.statusText}`);
        }

        const data = await response.json();
        const content = atob(data.content);
        
        return {
            data: JSON.parse(content),
            sha: data.sha
        };
    }

    // Write file to GitHub
    async writeFile(path, content, commitMessage) {
        if (!this.isReady()) {
            throw new Error('GitHub not configured');
        }

        let sha = null;
        
        // Try to get existing file SHA
        try {
            const existing = await this.readFile(path);
            sha = existing.sha;
        } catch (error) {
            // File doesn't exist yet, that's ok
        }

        const url = `${this.apiBase}/repos/${this.owner}/${this.repo}/contents/${path}`;
        const encodedContent = btoa(JSON.stringify(content, null, 2));

        const body = {
            message: commitMessage || `Update ${path}`,
            content: encodedContent,
            branch: this.branch
        };

        if (sha) {
            body.sha = sha;
        }

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${this.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to write ${path}: ${errorData.message}`);
        }

        return await response.json();
    }

    // Update progress
    async updateProgress(day, status) {
        try {
            const { data: progress } = await this.readFile('data/progress.json');

            if (status === 'unlocked' && !progress.daysUnlocked.includes(day)) {
                progress.daysUnlocked.push(day);
            }

            if (status === 'completed' && !progress.daysCompleted.includes(day)) {
                progress.daysCompleted.push(day);
            }

            progress.lastUpdated = new Date().toISOString();

            await this.writeFile('data/progress.json', progress, `Day ${day} ${status}`);
            return progress;
        } catch (error) {
            console.error('Error updating progress:', error);
            throw error;
        }
    }

    // Read day data
    async readDayData(dayKey) {
        try {
            const { data } = await this.readFile(`data/${dayKey}-day.json`);
            return data;
        } catch (error) {
            if (error.message.includes('not found')) {
                // Create new day file
                const newDayData = {
                    day: dayKey,
                    messages: [],
                    createdAt: new Date().toISOString(),
                    completedAt: null
                };
                await this.writeDayData(dayKey, newDayData);
                return newDayData;
            }
            throw error;
        }
    }

    // Write day data
    async writeDayData(dayKey, data) {
        await this.writeFile(`data/${dayKey}-day.json`, data, `Update ${dayKey} day data`);
    }

    // Add message to a day
    async addMessage(dayKey, message) {
        try {
            const dayData = await this.readDayData(dayKey);
            
            const newMessage = {
                id: Date.now(),
                text: message,
                createdAt: new Date().toISOString()
            };
            
            dayData.messages.push(newMessage);
            dayData.lastUpdated = new Date().toISOString();
            
            await this.writeDayData(dayKey, dayData);
            return newMessage;
        } catch (error) {
            console.error(`Error adding message to ${dayKey}:`, error);
            throw error;
        }
    }

    // Get all messages for a day
    async getMessages(dayKey) {
        try {
            const dayData = await this.readDayData(dayKey);
            return dayData.messages || [];
        } catch (error) {
            console.error(`Error getting messages for ${dayKey}:`, error);
            return [];
        }
    }

    // Delete message
    async deleteMessage(dayKey, messageId) {
        try {
            const dayData = await this.readDayData(dayKey);
            dayData.messages = dayData.messages.filter(m => m.id !== messageId);
            dayData.lastUpdated = new Date().toISOString();
            await this.writeDayData(dayKey, dayData);
        } catch (error) {
            console.error(`Error deleting message from ${dayKey}:`, error);
            throw error;
        }
    }

    // Mark day as completed
    async completeDay(dayKey) {
        try {
            const dayData = await this.readDayData(dayKey);
            dayData.completedAt = new Date().toISOString();
            await this.writeDayData(dayKey, dayData);
            await this.updateProgress(dayKey, 'completed');
        } catch (error) {
            console.error(`Error completing ${dayKey}:`, error);
            throw error;
        }
    }

    // Get progress
    async getProgress() {
        try {
            const { data } = await this.readFile('data/progress.json');
            return data;
        } catch (error) {
            console.warn('Error getting progress:', error);
            return {
                daysUnlocked: [],
                daysCompleted: [],
                startedAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };
        }
    }
}

// Fallback to localStorage if GitHub is not configured
class LocalStorage {
    async initialize() {
        const progress = Utils.getFromLocalStorage('valentine-progress');
        if (!progress) {
            Utils.saveToLocalStorage('valentine-progress', {
                daysUnlocked: [],
                daysCompleted: [],
                startedAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            });
        }
        return true;
    }

    isReady() {
        return true;
    }

    async readDayData(dayKey) {
        const data = Utils.getFromLocalStorage(`valentine-${dayKey}`, {
            day: dayKey,
            messages: [],
            createdAt: new Date().toISOString(),
            completedAt: null
        });
        return data;
    }

    async writeDayData(dayKey, data) {
        Utils.saveToLocalStorage(`valentine-${dayKey}`, data);
    }

    async addMessage(dayKey, message) {
        const dayData = await this.readDayData(dayKey);
        const newMessage = {
            id: Date.now(),
            text: message,
            createdAt: new Date().toISOString()
        };
        dayData.messages.push(newMessage);
        dayData.lastUpdated = new Date().toISOString();
        await this.writeDayData(dayKey, dayData);
        return newMessage;
    }

    async getMessages(dayKey) {
        const dayData = await this.readDayData(dayKey);
        return dayData.messages || [];
    }

    async deleteMessage(dayKey, messageId) {
        const dayData = await this.readDayData(dayKey);
        dayData.messages = dayData.messages.filter(m => m.id !== messageId);
        dayData.lastUpdated = new Date().toISOString();
        await this.writeDayData(dayKey, dayData);
    }

    async updateProgress(day, status) {
        const progress = Utils.getFromLocalStorage('valentine-progress');
        if (status === 'unlocked' && !progress.daysUnlocked.includes(day)) {
            progress.daysUnlocked.push(day);
        }
        if (status === 'completed' && !progress.daysCompleted.includes(day)) {
            progress.daysCompleted.push(day);
        }
        progress.lastUpdated = new Date().toISOString();
        Utils.saveToLocalStorage('valentine-progress', progress);
        return progress;
    }

    async getProgress() {
        return Utils.getFromLocalStorage('valentine-progress');
    }

    async completeDay(dayKey) {
        const dayData = await this.readDayData(dayKey);
        dayData.completedAt = new Date().toISOString();
        await this.writeDayData(dayKey, dayData);
        await this.updateProgress(dayKey, 'completed');
    }
}
