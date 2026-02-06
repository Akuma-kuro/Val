// Kiss Day - February 13th
class KissDay {
    constructor(storage) {
        this.dayKey = 'kiss';
        this.storage = storage;
        this.dayDate = CONFIG.dates.kissDay;
    }

    async init() {
        this.setupEventListeners();
        await this.loadMessages();
    }

    setupEventListeners() {
        const submitBtn = document.getElementById('kiss-submit');
        const inputField = document.getElementById('kiss-message');

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
            Utils.showToast('Express your passion for Jaana! 💋');
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
                        '💋'
                    );
                }, i * 50);
            }
            
            await this.loadMessages();
            inputField.value = '';
            Utils.showToast('Kiss sent to Jaana! 💋');
        } catch (error) {
            console.error('Error submitting message:', error);
            Utils.showToast('Oops! Couldn\'t send the kiss. Try again! ⚠️');
        } finally {
            Utils.hideSpinner();
        }
    }

    async loadMessages() {
        try {
            const messages = await this.storage.getMessages(this.dayKey);
            const messagesList = document.getElementById('kiss-messages');
            
            if (!messages || messages.length === 0) {
                messagesList.innerHTML = '<div class="empty-state"><p>No kisses yet. Show Jaana your love! 💋</p></div>';
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
