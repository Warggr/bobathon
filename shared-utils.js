/**
 * Shared Utilities for LifePilot
 * Handles localStorage operations and common functions
 */

const LifePilotStorage = {
    /**
     * Save tasks to localStorage
     * @param {Array} tasks - Array of task objects
     */
    saveTasks(tasks) {
        try {
            localStorage.setItem('lifepilot_tasks', JSON.stringify(tasks));
            return true;
        } catch (error) {
            console.error('Error saving tasks:', error);
            return false;
        }
    },

    /**
     * Load tasks from localStorage
     * @returns {Array} Array of task objects
     */
    loadTasks() {
        try {
            const tasksJson = localStorage.getItem('lifepilot_tasks');
            return tasksJson ? JSON.parse(tasksJson) : [];
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    },

    /**
     * Save calendar events to localStorage
     * @param {Array} events - Array of event objects
     */
    saveEvents(events) {
        try {
            localStorage.setItem('lifepilot_events', JSON.stringify(events));
            return true;
        } catch (error) {
            console.error('Error saving events:', error);
            return false;
        }
    },

    /**
     * Load calendar events from localStorage
     * @returns {Array} Array of event objects
     */
    loadEvents() {
        try {
            const eventsJson = localStorage.getItem('lifepilot_events');
            return eventsJson ? JSON.parse(eventsJson) : [];
        } catch (error) {
            console.error('Error loading events:', error);
            return [];
        }
    },

    /**
     * Clear all stored data
     */
    clearAll() {
        try {
            localStorage.removeItem('lifepilot_tasks');
            localStorage.removeItem('lifepilot_events');
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    },

    /**
     * Get example tasks
     * @returns {Array} Array of example task objects
     */
    getExampleTasks() {
        return [
            {
                id: 'example-1',
                name: 'Review project proposal',
                description: 'Go through the Q2 project proposal and provide feedback',
                time: 45,
                priority: 8,
                deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
                source: 'example'
            },
            {
                id: 'example-2',
                name: 'Team meeting preparation',
                description: 'Prepare slides and agenda for weekly team sync',
                time: 30,
                priority: 7,
                deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
                source: 'example'
            },
            {
                id: 'example-3',
                name: 'Code review',
                description: 'Review pull requests from team members',
                time: 60,
                priority: 6,
                deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
                source: 'example'
            },
            {
                id: 'example-4',
                name: 'Update documentation',
                description: 'Update API documentation with new endpoints',
                time: 90,
                priority: 5,
                deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
                source: 'example'
            },
            {
                id: 'example-5',
                name: 'Client call follow-up',
                description: 'Send follow-up email with action items from client call',
                time: 20,
                priority: 9,
                deadline: new Date(Date.now() + 0.5 * 24 * 60 * 60 * 1000), // 12 hours from now
                source: 'example'
            },
            {
                id: 'example-6',
                name: 'Bug fixes',
                description: 'Fix reported bugs in the user dashboard',
                time: 120,
                priority: 8,
                deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
                source: 'example'
            },
            {
                id: 'example-7',
                name: 'Research new tools',
                description: 'Research and evaluate new project management tools',
                time: 60,
                priority: 4,
                source: 'example'
            },
            {
                id: 'example-8',
                name: 'Write blog post',
                description: 'Write technical blog post about recent project',
                time: 90,
                priority: 3,
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
                source: 'example'
            }
        ];
    },

    /**
     * Get example calendar events
     * @returns {Array} Array of example event objects
     */
    getExampleEvents() {
        const now = new Date();
        return [
            {
                id: 'event-1',
                summary: 'Daily Standup',
                description: 'Daily team standup meeting',
                start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0),
                end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 15),
                isAllDay: false,
                source: 'example'
            },
            {
                id: 'event-2',
                summary: 'Client Meeting',
                description: 'Quarterly review with client',
                start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0),
                end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 0),
                isAllDay: false,
                source: 'example'
            },
            {
                id: 'event-3',
                summary: 'Lunch Break',
                description: '',
                start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0),
                end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, 0),
                isAllDay: false,
                source: 'example'
            }
        ];
    }
};

/**
 * Show a message to the user
 * @param {string} message - Message to display
 * @param {string} type - Message type: 'error', 'success', 'info'
 */
function showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('message');
    if (!messageDiv) return;

    messageDiv.className = type;
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

/**
 * Clear message
 */
function clearMessage() {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.style.display = 'none';
    }
}

/**
 * Redirect to lifepilot.html
 */
function redirectToLifePilot() {
    window.location.href = 'lifepilot.html';
}

// Made with Bob
