// Propose Day - February 8th
class ProposeDay {
    constructor(storage) {
        this.dayKey = 'propose';
        this.storage = storage;
        this.dayDate = CONFIG.dates.proposeDay;
    }

    async init() {
        this.setupEventListeners();
        await this.loadMessages();
    }

    setupEventListeners() {
        const submitBtn = document.getElementById('propose-submit');
        const inputField = document.getElementById('propose-message');

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
            Utils.showToast('Tell Gudiya what she means to you! 💍');
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
                        '💍'
                    );
                }, i * 50);
            }
            
            await this.loadMessages();
            inputField.value = '';
            Utils.showToast('Proposal sent to Gudiya! 💍');
        } catch (error) {
            console.error('Error submitting message:', error);
            Utils.showToast('Oops! Couldn\'t send the proposal. Try again! ⚠️');
        } finally {
            Utils.hideSpinner();
        }
    }

    async loadMessages() {
        try {
            const messages = await this.storage.getMessages(this.dayKey);
            const messagesList = document.getElementById('propose-messages');
            
            if (!messages || messages.length === 0) {
                messagesList.innerHTML = '<div class="empty-state"><p>No messages yet. Tell Gudiya she\'s the one! 💍</p></div>';
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
