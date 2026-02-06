// Teddy Day - February 10th
class TeddyDay {
    constructor(storage) {
        this.dayKey = 'teddy';
        this.storage = storage;
        this.dayDate = CONFIG.dates.teddyDay;
    }

    async init() {
        this.setupEventListeners();
        await this.loadMessages();
    }

    setupEventListeners() {
        const submitBtn = document.getElementById('teddy-submit');
        const inputField = document.getElementById('teddy-message');

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
            Utils.showToast('Write a warm message for Gudiya! 🧸');
            return;
        }

        Utils.showSpinner();
        
        try {
            const newMessage = await this.storage.addMessage(this.dayKey, message);
            
            // Create particles
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    Utils.createParticle(
                        Math.random() * window.innerWidth,
                        Math.random() * window.innerHeight,
                        '🧸'
                    );
                }, i * 50);
            }
            
            await this.loadMessages();
            inputField.value = '';
            Utils.showToast('Teddy sent to Gudiya! 🧸');
        } catch (error) {
            console.error('Error submitting message:', error);
            Utils.showToast('Oops! Couldn\'t send the teddy. Try again! ⚠️');
        } finally {
            Utils.hideSpinner();
        }
    }

    async loadMessages() {
        try {
            const messages = await this.storage.getMessages(this.dayKey);
            const messagesList = document.getElementById('teddy-messages');
            
            if (!messages || messages.length === 0) {
                messagesList.innerHTML = '<div class="empty-state"><p>No teddy messages yet. Give Gudiya a warm hug! 🧸</p></div>';
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

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
