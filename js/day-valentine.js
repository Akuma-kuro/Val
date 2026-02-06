// Valentine's Day - February 14th
class ValentineDay {
    constructor(storage) {
        this.dayKey = 'valentine';
        this.storage = storage;
        this.dayDate = CONFIG.dates.valentineDay;
    }

    async init() {
        this.setupEventListeners();
        await this.loadMessages();
        await this.loadSummary();
    }

    setupEventListeners() {
        const submitBtn = document.getElementById('valentine-submit');
        const inputField = document.getElementById('valentine-message');

        submitBtn.addEventListener('click', () => this.submitMessage(inputField));
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                this.submitMessage(inputField);
            }
        });
    }

    async submitMessage(inputField) {
        const message = inputField.value.trim();
        if (!message) {
            Utils.showToast('Express your love to Gudiya and Jaana! 💑');
            return;
        }

        Utils.showSpinner();
        
        try {
            const newMessage = await this.storage.addMessage(this.dayKey, message);
            
            // Create lots of particles for Valentine's Day
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    Utils.createParticle(
                        Math.random() * window.innerWidth,
                        Math.random() * window.innerHeight,
                        '💕'
                    );
                }, i * 30);
            }
            
            await this.loadMessages();
            inputField.value = '';
            Utils.showToast('Love sent to Gudiya and Jaana! 💕');
        } catch (error) {
            console.error('Error submitting message:', error);
            Utils.showToast('Oops! Couldn\'t send the love. Try again! ⚠️');
        } finally {
            Utils.hideSpinner();
        }
    }

    async loadMessages() {
        try {
            const messages = await this.storage.getMessages(this.dayKey);
            const messagesList = document.getElementById('valentine-messages');
            
            if (!messages || messages.length === 0) {
                messagesList.innerHTML = '<div class="empty-state"><p>No love messages yet. Celebrate with Gudiya and Jaana! 💑</p></div>';
                return;
            }

            messagesList.innerHTML = messages.map(msg => `
                <div class="message-item">
                    <p>${this.escapeHtml(msg.text)}</p>
                    <span class="message-time">${Utils.formatTimeAgo(msg.createdAt)}</span>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    async loadSummary() {
        try {
            const progress = await this.storage.getProgress();
            const summarySection = document.getElementById('final-summary');
            
            const completedDays = progress.daysCompleted || [];
            const totalDays = 8;
            const percentage = Math.round((completedDays.length / totalDays) * 100);
            
            let summaryHTML = `
                <h3>💝 Your Valentine's Week Journey 💝</h3>
                <p>You've completed <strong>${completedDays.length} out of 8</strong> special days! (${percentage}%)</p>
            `;
            
            if (completedDays.length === 8) {
                summaryHTML += `
                    <p style="margin-top: 20px; font-size: 1.2rem;">🎉 Congratulations, Jaana! You've completed Valentine's Week! 🎉</p>
                    <p>Gudiya, this journey of love will be cherished forever! 💕</p>
                `;
            } else {
                summaryHTML += `
                    <p>Complete all 8 days to unlock the full Valentine's Week experience!</p>
                `;
            }
            
            summarySection.innerHTML = summaryHTML;
            summarySection.style.display = 'block';
        } catch (error) {
            console.error('Error loading summary:', error);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
