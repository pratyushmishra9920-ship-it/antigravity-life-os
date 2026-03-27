/**
 * Mood Tracker Logic (Simulated AI Suggestions)
 */

window.MoodTracker = {
    init() {
        this.cacheDOM();
        this.bindEvents();
    },

    cacheDOM() {
        this.moodBtns = document.querySelectorAll('.mood-btn');
        this.insightCard = document.getElementById('mood-insight-card');
        this.insightText = document.getElementById('mood-insight-text');
    },

    bindEvents() {
        this.moodBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mood = e.currentTarget.dataset.mood;
                this.logMood(mood);
                
                // UX effect
                this.moodBtns.forEach(b => b.style.transform = 'scale(1)');
                e.currentTarget.style.transform = 'scale(1.2)';
            });
        });
        
        // Hover effects in JS just to avoid adding more CSS classes (optional, but requested interactive UI)
        this.moodBtns.forEach(btn => {
            btn.addEventListener('mouseenter', (e) => {
                if(e.currentTarget.style.transform !== 'scale(1.2)') {
                     e.currentTarget.style.transform = 'scale(1.1)';
                }
            });
            btn.addEventListener('mouseleave', (e) => {
                if(e.currentTarget.style.transform === 'scale(1.1)') {
                     e.currentTarget.style.transform = 'scale(1)';
                }
            });
        });
    },

    logMood(mood) {
        // Here we could save it to Storage, to show historical data.
        // Array of { date: ISO, mood: string }
        let history = window.Storage.get(window.STORAGE_KEYS.MOODS) || [];
        history.push({ date: new Date().toISOString(), mood: mood });
        window.Storage.set(window.STORAGE_KEYS.MOODS, history);

        this.generateInsight(mood);
    },

    generateInsight(mood) {
        const insights = {
            'great': [
                "You're feeling great! Capitalize on this energy to tackle your hardest tasks today.",
                "High energy detected! This is the perfect time to brainstorm new goals for the upcoming month.",
                "Awesome! Channel this positivity into a creative hobby or reach out to an old friend."
            ],
            'good': [
                "Solid mood today. Maintain your current routines—consistency is key to long-term success.",
                "You're in a good rhythm. If you have any medium-priority tasks, knock them out now.",
                "Feeling good means your habits are paying off. Keep up the momentum!"
            ],
            'neutral': [
                "A neutral day is a balanced day. Taking a 10-minute walk outside might give you an energetic boost.",
                "Things are steady. Sometimes a quick hydration break or a short podcast can spark some inspiration.",
                "No highs or lows. Perfect for focusing on deep, uninterrupted work without emotional distractions."
            ],
            'stressed': [
                "I notice you're feeling stressed. Let's pause. Try taking 5 deep breaths, and ignore non-essential tasks today.",
                "Stress can cloud your focus. Step away from your screen for 15 minutes and just rest your eyes.",
                "It's okay to feel overwhelmed. Re-prioritize your tasks and focus on just ONE thing right now."
            ]
        };

        const list = insights[mood] || insights['neutral'];
        const text = list[Math.floor(Math.random() * list.length)];

        this.insightText.innerHTML = text;
        this.insightCard.classList.remove('hidden');
        
        // Add a subtle animation
        this.insightCard.style.animation = 'none';
        this.insightCard.offsetHeight; // Trigger reflow
        this.insightCard.style.animation = 'fadeInScale 0.4s ease forwards';
    }
};
