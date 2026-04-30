/**
 * Microsoft Graph API Client
 * 
 * This module handles:
 * - Authentication with Microsoft Graph API using MSAL.js
 * - Fetching user's tasks from Microsoft To Do
 * - Fetching calendar events for the next week
 * - Converting Graph API data to a format compatible with CalendarScheduler
 */

class MicrosoftGraphClient {
    constructor(config) {
        // MSAL configuration
        this.msalConfig = {
            auth: {
                clientId: config.clientId,
                authority: config.authority || 'https://login.microsoftonline.com/common',
                redirectUri: config.redirectUri || window.location.origin
            },
            cache: {
                cacheLocation: 'sessionStorage',
                storeAuthStateInCookie: false
            }
        };

        // Initialize MSAL instance
        this.msalInstance = new msal.PublicClientApplication(this.msalConfig);

        // Required API permissions
        this.loginRequest = {
            scopes: [
                'User.Read',
                'Tasks.Read',
                'Calendars.Read'
            ]
        };

        this.account = null;
    }

    /**
     * Initialize and handle redirect response
     */
    async initialize() {
        try {
            const response = await this.msalInstance.handleRedirectPromise();
            if (response) {
                this.account = response.account;
            } else {
                const accounts = this.msalInstance.getAllAccounts();
                if (accounts.length > 0) {
                    this.account = accounts[0];
                }
            }
            return this.account;
        } catch (error) {
            console.error('Error during initialization:', error);
            throw error;
        }
    }

    /**
     * Sign in the user
     */
    async signIn() {
        try {
            const response = await this.msalInstance.loginPopup(this.loginRequest);
            this.account = response.account;
            return this.account;
        } catch (error) {
            console.error('Error during sign in:', error);
            throw error;
        }
    }

    /**
     * Sign out the user
     */
    async signOut() {
        const logoutRequest = {
            account: this.account
        };
        await this.msalInstance.logoutPopup(logoutRequest);
        this.account = null;
    }

    /**
     * Get access token for Microsoft Graph API
     */
    async getAccessToken() {
        if (!this.account) {
            throw new Error('No account found. Please sign in first.');
        }

        const request = {
            scopes: this.loginRequest.scopes,
            account: this.account
        };

        try {
            const response = await this.msalInstance.acquireTokenSilent(request);
            return response.accessToken;
        } catch (error) {
            if (error instanceof msal.InteractionRequiredAuthError) {
                const response = await this.msalInstance.acquireTokenPopup(request);
                return response.accessToken;
            }
            throw error;
        }
    }

    /**
     * Make a request to Microsoft Graph API
     */
    async callGraphAPI(endpoint, method = 'GET', body = null) {
        const accessToken = await this.getAccessToken();
        
        const options = {
            method: method,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`https://graph.microsoft.com/v1.0${endpoint}`, options);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Graph API error: ${error.error.message}`);
        }

        return await response.json();
    }

    /**
     * Get user's profile information
     */
    async getUserProfile() {
        return await this.callGraphAPI('/me');
    }

    /**
     * Get calendar events for the next week
     * @param {Date} startDate - Start date (default: today)
     * @param {number} days - Number of days to fetch (default: 7)
     * @returns {Array} Array of calendar events
     */
    async getCalendarEvents(startDate = new Date(), days = 7) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(start);
        end.setDate(end.getDate() + days);
        end.setHours(23, 59, 59, 999);

        const startISO = start.toISOString();
        const endISO = end.toISOString();

        // Query parameters for filtering events
        const queryParams = new URLSearchParams({
            startDateTime: startISO,
            endDateTime: endISO,
            $select: 'subject,start,end,location,bodyPreview,isAllDay,showAs',
            $orderby: 'start/dateTime',
            $top: 100
        });

        const data = await this.callGraphAPI(`/me/calendar/calendarView?${queryParams}`);
        
        return this.formatCalendarEvents(data.value);
    }

    /**
     * Format calendar events to a standard format
     */
    formatCalendarEvents(events) {
        return events.map(event => ({
            id: event.id,
            summary: event.subject,
            description: event.bodyPreview,
            start: new Date(event.start.dateTime + 'Z'),
            end: new Date(event.end.dateTime + 'Z'),
            location: event.location?.displayName || '',
            isAllDay: event.isAllDay,
            showAs: event.showAs,
            source: 'microsoft-calendar'
        }));
    }

    /**
     * Get all task lists
     */
    async getTaskLists() {
        const data = await this.callGraphAPI('/me/todo/lists');
        return data.value;
    }

    /**
     * Get tasks from a specific list
     * @param {string} listId - Task list ID
     */
    async getTasksFromList(listId) {
        const data = await this.callGraphAPI(`/me/todo/lists/${listId}/tasks`);
        return data.value;
    }

    /**
     * Get all tasks from all lists for the next week
     * @param {Date} startDate - Start date (default: today)
     * @param {number} days - Number of days to look ahead (default: 7)
     * @returns {Array} Array of tasks
     */
    async getAllTasks(startDate = new Date(), days = 7) {
        const lists = await this.getTaskLists();
        const allTasks = [];

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + days);

        for (const list of lists) {
            const tasks = await this.getTasksFromList(list.id);
            
            // Filter tasks that are not completed and are due within the time range
            const relevantTasks = tasks.filter(task => {
                if (task.status === 'completed') return false;
                
                // Include tasks with no due date or due date within range
                if (!task.dueDateTime) return true;
                
                const dueDate = new Date(task.dueDateTime.dateTime + 'Z');
                return dueDate >= startDate && dueDate <= endDate;
            });

            allTasks.push(...relevantTasks.map(task => ({
                ...task,
                listName: list.displayName
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
                description: task.body?.content || '',
                priority: this.mapPriority(task.importance),
                status: task.status,
                listName: task.listName,
                source: 'microsoft-todo'
            };

            // Add due date if available
            if (task.dueDateTime) {
                formattedTask.deadline = new Date(task.dueDateTime.dateTime + 'Z');
            }

            // Estimate time based on task complexity (default: 30 minutes)
            // You can enhance this with custom logic or user input
            formattedTask.time = this.estimateTaskDuration(task);

            return formattedTask;
        });
    }

    /**
     * Map Microsoft To Do importance to priority number
     */
    mapPriority(importance) {
        const priorityMap = {
            'high': 9,
            'normal': 5,
            'low': 2
        };
        return priorityMap[importance] || 5;
    }

    /**
     * Estimate task duration in minutes
     * This is a simple heuristic - you can enhance it based on your needs
     */
    estimateTaskDuration(task) {
        const title = task.title.toLowerCase();
        const body = (task.body?.content || '').toLowerCase();
        
        // Check for time indicators in title or body
        const timePatterns = [
            { pattern: /(\d+)\s*hour/i, multiplier: 60 },
            { pattern: /(\d+)\s*hr/i, multiplier: 60 },
            { pattern: /(\d+)\s*min/i, multiplier: 1 }
        ];

        for (const { pattern, multiplier } of timePatterns) {
            const match = title.match(pattern) || body.match(pattern);
            if (match) {
                return parseInt(match[1]) * multiplier;
            }
        }

        // Default estimates based on importance
        if (task.importance === 'high') return 60; // 1 hour
        if (task.importance === 'low') return 15;  // 15 minutes
        return 30; // 30 minutes default
    }

    /**
     * Get both calendar events and tasks for the next week
     * @param {Date} startDate - Start date (default: today)
     * @param {number} days - Number of days to look ahead (default: 7)
     * @returns {Object} { events: [], tasks: [] }
     */
    async getCalendarAndTasks(startDate = new Date(), days = 7) {
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
     * Check if user is signed in
     */
    isSignedIn() {
        return this.account !== null;
    }

    /**
     * Get current account information
     */
    getAccount() {
        return this.account;
    }
}

// Export for use in browser
if (typeof window !== 'undefined') {
    window.MicrosoftGraphClient = MicrosoftGraphClient;
}

// Export for use in Node.js (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MicrosoftGraphClient;
}

// Made with Bob
