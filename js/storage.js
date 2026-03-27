/**
 * Storage Layer for Life OS
 * Handles interactions with localStorage
 */

const STORAGE_KEYS = {
    TASKS: 'lifeos_tasks',
    HABITS: 'lifeos_habits',
    GOALS: 'lifeos_goals',
    MOODS: 'lifeos_moods',
    THEME: 'lifeos_theme'
};

const Storage = {
    // Get parsed JSON from storage
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error(`Error reading ${key} from storage:`, e);
            return null;
        }
    },

    // Save JSON to storage
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            // Trigger global event for real-time reactions
            document.dispatchEvent(new CustomEvent('lifeos_storage_updated', { detail: { key, value } }));
        } catch (e) {
            console.error(`Error writing ${key} to storage:`, e);
        }
    },

    // Initialize default structure if empty
    initDefaults() {
        if (!this.get(STORAGE_KEYS.TASKS)) this.set(STORAGE_KEYS.TASKS, []);
        
        if (!this.get(STORAGE_KEYS.HABITS)) {
            this.set(STORAGE_KEYS.HABITS, [
                { id: '1', name: 'Drink Water', icon: 'ph-drop', streak: 0, completedToday: false },
                { id: '2', name: 'Read Pages', icon: 'ph-book', streak: 0, completedToday: false },
                { id: '3', name: 'Exercise', icon: 'ph-barbell', streak: 0, completedToday: false }
            ]);
        }
        
        if (!this.get(STORAGE_KEYS.GOALS)) {
            this.set(STORAGE_KEYS.GOALS, [
                { id: '1', title: 'Learn Modern JS', progress: 30 }
            ]);
        }
    }
};

window.Storage = Storage;
window.STORAGE_KEYS = STORAGE_KEYS;
