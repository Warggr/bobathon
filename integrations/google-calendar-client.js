/**
 * Google Calendar & Tasks API Client
 * 
 * This module handles:
 * - Authentication with Google APIs using OAuth 2.0
 * - Fetching user's tasks from Google Tasks
 * - Fetching calendar events from Google Calendar
 * - Converting Google API data to a format compatible with CalendarScheduler
 */

class GoogleCalendarClient {
    constructor(config) {
        this.clientId = config.clientId;
        this.apiKey = config.apiKey;
        this.discoveryDocs = [
            'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
            'https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest'
        ];
        this.scopes = [
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/tasks.readonly'
        ].join(' ');

        this.isInitialized = false;
        this.isSignedIn = false;
        this.tokenClient = null;
        this.accessToken = null;
    }

    /**
     * Initialize the Google API client
     */
    async initialize() {
        return new Promise((resolve, reject) => {
            // Load the Google API client library
            if (typeof gapi === 'undefined') {
                reject(new Error('Google API library not loaded. Include https://apis.google.com/js/api.js'));
                return;
            }

            gapi.load('client', async () => {
                try {
                    await gapi.client.init({
                        apiKey: this.apiKey,
                        discoveryDocs: this.discoveryDocs
                    });

                    // Initialize the token client
                    if (typeof google !== 'undefined' && google.accounts) {
                        this.tokenClient = google.accounts.oauth2.initTokenClient({
                            client_id: this.clientId,
                            scope: this.scopes,
                            callback: (response) => {
                                if (response.error) {
                                    console.error('Token error:', response);
                                    return;
                                }
                                this.accessToken = response.access_token;
                                this.isSignedIn = true;
                            }
                        });
                    }

                    this.isInitialized = true;
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    /**
     * Sign in the user
     */
    async signIn() {
        if (!this.isInitialized) {
            throw new Error('Client not initialized. Call initialize() first.');
        }

        return new Promise((resolve, reject) => {
            try {
                // Request an access token
                this.tokenClient.callback = (response) => {
                    if (response.error) {
                        reject(new Error(response.error));
                        return;
                    }
                    this.accessToken = response.access_token;
                    this.isSignedIn = true;
                    gapi.client.setToken({ access_token: this.accessToken });
                    resolve();
                };

                // Check if we already have a token
                const token = gapi.client.getToken();
                if (token === null) {
                    // Prompt the user to select a Google Account and ask for consent
                    this.tokenClient.requestAccessToken({ prompt: 'consent' });
                } else {
                    // Skip display of account chooser and consent dialog
                    this.tokenClient.requestAccessToken({ prompt: '' });
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Sign out the user
     */
    signOut() {
        const token = gapi.client.getToken();
        if (token !== null) {
            google.accounts.oauth2.revoke(token.access_token);
            gapi.client.setToken(null);
        }
        this.isSignedIn = false;
        this.accessToken = null;
    }

    /**
     * Check if user is signed in
     */
    getIsSignedIn() {
        return this.isSignedIn;
    }

    /**
     * Get user's profile information
     */
    async getUserProfile() {
        try {
            const response = await gapi.client.request({
                path: 'https://www.googleapis.com/oauth2/v2/userinfo'
            });
            return response.result;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    }

    /**
     * Get calendar events for a date range
     * @param {Date} startDate - Start date (default: today)
     * @param {number} days - Number of days to fetch (default: 7)
     * @returns {Array} Array of calendar events
     */
    async getCalendarEvents(startDate = new Date(), days = 7) {
        if (!this.isSignedIn) {
            throw new Error('User not signed in');
        }

        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(start);
        end.setDate(end.getDate() + days);
        end.setHours(23, 59, 59, 999);

        try {
            const response = await gapi.client.calendar.events.list({
                calendarId: 'primary',
                timeMin: start.toISOString(),
                timeMax: end.toISOString(),
                showDeleted: false,
                singleEvents: true,
                maxResults: 100,
                orderBy: 'startTime'
            });

            return this.formatCalendarEvents(response.result.items || []);
        } catch (error) {
            console.error('Error fetching calendar events:', error);
            throw error;
        }
    }

    /**
     * Format calendar events to a standard format
     */
    formatCalendarEvents(events) {
        return events.map(event => {
            const start = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date);
            const end = event.end.dateTime ? new Date(event.end.dateTime) : new Date(event.end.date);
            
            return {
                id: event.id,
                summary: event.summary || 'Untitled Event',
                description: event.description || '',
                start: start,
                end: end,
                location: event.location || '',
                isAllDay: !event.start.dateTime,
                status: event.status,
                source: 'google-calendar'
            };
        });
    }

    /**
     * Get all task lists
     */
    async getTaskLists() {
        if (!this.isSignedIn) {
            throw new Error('User not signed in');
        }

        try {
            const response = await gapi.client.tasks.tasklists.list({
                maxResults: 100
            });

            return response.result.items || [];
        } catch (error) {
            console.error('Error fetching task lists:', error);
            throw error;
        }
    }

    /**
     * Get tasks from a specific list
     * @param {string} taskListId - Task list ID
     */
    async getTasksFromList(taskListId) {
        if (!this.isSignedIn) {
            throw new Error('User not signed in');
        }

        try {
            const response = await gapi.client.tasks.tasks.list({
                tasklist: taskListId,
                showCompleted: false,
                showHidden: false,
                maxResults: 100
            });

            return response.result.items || [];
        } catch (error) {
            console.error('Error fetching tasks:', error);
            throw error;
        }
    }

    /**
     * Get all tasks from all lists for the next week
     * @param {Date} startDate - Start date (default: today)
     * @param {number} days - Number of days to look ahead (default: 7)
     * @returns {Array} Array of tasks
     */
    async getAllTasks(startDate = new Date(), days = 7) {
        if (!this.isSignedIn) {
            throw new Error('User not signed in');
        }

        const lists = await this.getTaskLists();
        const allTasks = [];

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + days);

        for (const list of lists) {
            const tasks = await this.getTasksFromList(list.id);
            
            // Filter tasks that are due within the time range or have no due date
            const relevantTasks = tasks.filter(task => {
                if (task.status === 'completed') return false;
                
                // Include tasks with no due date or due date within range
                if (!task.due) return true;
                
                const dueDate = new Date(task.due);
                return dueDate >= startDate && dueDate <= endDate;
            });

            allTasks.push(...relevantTasks.map(task => ({
                ...task,
                listName: list.title
            })));
        }

        return this.formatTasks(allTasks);
    }

    /**
     * Format tasks to a standard format compatible with CalendarScheduler
     */
    formatTasks(tasks) {
        return tasks.map((task, index) => {
            const formattedTask = {
                id: task.id || `task-${index}`,
                name: task.title,
                description: task.notes || '',
                priority: 5, // Google Tasks doesn't have priority, default to medium
                status: task.status,
                listName: task.listName,
                source: 'google-tasks'
            };

            // Add due date if available
            if (task.due) {
                formattedTask.deadline = new Date(task.due);
            }

            // Estimate time based on task complexity
            formattedTask.time = this.estimateTaskDuration(task);

            return formattedTask;
        });
    }

    /**
     * Estimate task duration in minutes
     * This is a simple heuristic - you can enhance it based on your needs
     */
    estimateTaskDuration(task) {
        const title = task.title.toLowerCase();
        const notes = (task.notes || '').toLowerCase();
        
        // Check for time indicators in title or notes
        const timePatterns = [
            { pattern: /(\d+)\s*hour/i, multiplier: 60 },
            { pattern: /(\d+)\s*hr/i, multiplier: 60 },
            { pattern: /(\d+)\s*min/i, multiplier: 1 }
        ];

        for (const { pattern, multiplier } of timePatterns) {
            const match = title.match(pattern) || notes.match(pattern);
            if (match) {
                return parseInt(match[1]) * multiplier;
            }
        }

        // Check if task has subtasks (indicates complexity)
        if (task.parent) {
            return 15; // Subtasks are typically shorter
        }

        // Default estimate based on description length
        const hasDescription = notes.length > 0;
        if (hasDescription && notes.length > 100) {
            return 60; // Longer description suggests more complex task
        } else if (hasDescription) {
            return 30;
        }

        return 30; // Default 30 minutes
    }

    /**
     * Get both calendar events and tasks for the next week
     * @param {Date} startDate - Start date (default: today)
     * @param {number} days - Number of days to look ahead (default: 7)
     * @returns {Object} { events: [], tasks: [] }
     */
    async getCalendarAndTasks(startDate = new Date(), days = 7) {
        if (!this.isSignedIn) {
            throw new Error('User not signed in');
        }

        try {
            const [events, tasks] = await Promise.all([
                this.getCalendarEvents(startDate, days),
                this.getAllTasks(startDate, days)
            ]);

            return {
                events,
                tasks,
                startDate,
                endDate: new Date(new Date(startDate).setDate(startDate.getDate() + days))
            };
        } catch (error) {
            console.error('Error fetching calendar and tasks:', error);
            throw error;
        }
    }

    /**
     * Get all calendars
     */
    async getCalendars() {
        if (!this.isSignedIn) {
            throw new Error('User not signed in');
        }

        try {
            const response = await gapi.client.calendar.calendarList.list();
            return response.result.items || [];
        } catch (error) {
            console.error('Error fetching calendars:', error);
            throw error;
        }
    }

    /**
     * Get events from multiple calendars
     * @param {Array} calendarIds - Array of calendar IDs
     * @param {Date} startDate - Start date
     * @param {number} days - Number of days
     */
    async getEventsFromMultipleCalendars(calendarIds, startDate = new Date(), days = 7) {
        if (!this.isSignedIn) {
            throw new Error('User not signed in');
        }

        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(start);
        end.setDate(end.getDate() + days);
        end.setHours(23, 59, 59, 999);

        const allEvents = [];

        for (const calendarId of calendarIds) {
            try {
                const response = await gapi.client.calendar.events.list({
                    calendarId: calendarId,
                    timeMin: start.toISOString(),
                    timeMax: end.toISOString(),
                    showDeleted: false,
                    singleEvents: true,
                    maxResults: 100,
                    orderBy: 'startTime'
                });

                const events = this.formatCalendarEvents(response.result.items || []);
                allEvents.push(...events);
            } catch (error) {
                console.error(`Error fetching events from calendar ${calendarId}:`, error);
            }
        }

        // Sort all events by start time
        allEvents.sort((a, b) => a.start - b.start);

        return allEvents;
    }
}

// Export for use in browser
if (typeof window !== 'undefined') {
    window.GoogleCalendarClient = GoogleCalendarClient;
}

// Export for use in Node.js (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GoogleCalendarClient;
}

// Made with Bob
