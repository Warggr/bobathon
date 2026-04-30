/**
 * Unified Calendar Client
 * 
 * This module provides a unified interface for both Microsoft Graph and Google Calendar APIs.
 * It allows you to work with both providers using a consistent API.
 */

class UnifiedCalendarClient {
    constructor() {
        this.providers = {
            microsoft: null,
            google: null
        };
        this.activeProvider = null;
    }

    /**
     * Initialize Microsoft Graph provider
     * @param {Object} config - Microsoft configuration
     */
    async initializeMicrosoft(config) {
        if (typeof MicrosoftGraphClient === 'undefined') {
            throw new Error('MicrosoftGraphClient not loaded. Include microsoft-graph-client.js');
        }
        
        this.providers.microsoft = new MicrosoftGraphClient(config);
        await this.providers.microsoft.initialize();
        
        if (this.providers.microsoft.isSignedIn()) {
            this.activeProvider = 'microsoft';
        }
    }

    /**
     * Initialize Google Calendar provider
     * @param {Object} config - Google configuration
     */
    async initializeGoogle(config) {
        if (typeof GoogleCalendarClient === 'undefined') {
            throw new Error('GoogleCalendarClient not loaded. Include google-calendar-client.js');
        }

        this.providers.google = new GoogleCalendarClient(config);
        await this.providers.google.initialize();
        
        if (this.providers.google.getIsSignedIn()) {
            this.activeProvider = 'google';
        }
    }

    /**
     * Sign in to a specific provider
     * @param {string} provider - 'microsoft' or 'google'
     */
    async signIn(provider) {
        if (!this.providers[provider]) {
            throw new Error(`Provider ${provider} not initialized`);
        }

        if (provider === 'microsoft') {
            await this.providers.microsoft.signIn();
        } else if (provider === 'google') {
            await this.providers.google.signIn();
        }

        this.activeProvider = provider;
    }

    /**
     * Sign out from the active provider
     */
    async signOut() {
        if (!this.activeProvider) {
            return;
        }

        if (this.activeProvider === 'microsoft') {
            await this.providers.microsoft.signOut();
        } else if (this.activeProvider === 'google') {
            this.providers.google.signOut();
        }

        this.activeProvider = null;
    }

    /**
     * Check if any provider is signed in
     */
    isSignedIn() {
        if (this.activeProvider === 'microsoft') {
            return this.providers.microsoft?.isSignedIn();
        } else if (this.activeProvider === 'google') {
            return this.providers.google?.getIsSignedIn();
        }
        return false;
    }

    /**
     * Get the active provider name
     */
    getActiveProvider() {
        return this.activeProvider;
    }

    /**
     * Get user profile from active provider
     */
    async getUserProfile() {
        if (!this.activeProvider) {
            throw new Error('No active provider');
        }

        if (this.activeProvider === 'microsoft') {
            const profile = await this.providers.microsoft.getUserProfile();
            return {
                name: profile.displayName,
                email: profile.mail || profile.userPrincipalName,
                provider: 'microsoft'
            };
        } else if (this.activeProvider === 'google') {
            const profile = await this.providers.google.getUserProfile();
            return {
                name: profile.name,
                email: profile.email,
                provider: 'google'
            };
        }
    }

    /**
     * Get calendar events from active provider
     * @param {Date} startDate - Start date
     * @param {number} days - Number of days
     */
    async getCalendarEvents(startDate = new Date(), days = 7) {
        if (!this.activeProvider) {
            throw new Error('No active provider');
        }

        return await this.providers[this.activeProvider].getCalendarEvents(startDate, days);
    }

    /**
     * Get tasks from active provider
     * @param {Date} startDate - Start date
     * @param {number} days - Number of days
     */
    async getAllTasks(startDate = new Date(), days = 7) {
        if (!this.activeProvider) {
            throw new Error('No active provider');
        }

        return await this.providers[this.activeProvider].getAllTasks(startDate, days);
    }

    /**
     * Get both calendar events and tasks from active provider
     * @param {Date} startDate - Start date
     * @param {number} days - Number of days
     */
    async getCalendarAndTasks(startDate = new Date(), days = 7) {
        if (!this.activeProvider) {
            throw new Error('No active provider');
        }

        return await this.providers[this.activeProvider].getCalendarAndTasks(startDate, days);
    }

    /**
     * Get calendar events and tasks from ALL signed-in providers
     * @param {Date} startDate - Start date
     * @param {number} days - Number of days
     */
    async getAllProvidersData(startDate = new Date(), days = 7) {
        const results = {
            events: [],
            tasks: [],
            providers: []
        };

        // Check Microsoft
        if (this.providers.microsoft?.isSignedIn()) {
            try {
                const msData = await this.providers.microsoft.getCalendarAndTasks(startDate, days);
                results.events.push(...msData.events);
                results.tasks.push(...msData.tasks);
                results.providers.push('microsoft');
            } catch (error) {
                console.error('Error fetching Microsoft data:', error);
            }
        }

        // Check Google
        if (this.providers.google?.getIsSignedIn()) {
            try {
                const googleData = await this.providers.google.getCalendarAndTasks(startDate, days);
                results.events.push(...googleData.events);
                results.tasks.push(...googleData.tasks);
                results.providers.push('google');
            } catch (error) {
                console.error('Error fetching Google data:', error);
            }
        }

        // Sort events by start time
        results.events.sort((a, b) => a.start - b.start);

        // Sort tasks by deadline (if present), then by priority
        results.tasks.sort((a, b) => {
            if (a.deadline && b.deadline) {
                return a.deadline - b.deadline;
            }
            if (a.deadline) return -1;
            if (b.deadline) return 1;
            return b.priority - a.priority;
        });

        results.startDate = startDate;
        results.endDate = new Date(new Date(startDate).setDate(startDate.getDate() + days));

        return results;
    }

    /**
     * Get status of all providers
     */
    getProvidersStatus() {
        return {
            microsoft: {
                initialized: this.providers.microsoft !== null,
                signedIn: this.providers.microsoft?.isSignedIn() || false
            },
            google: {
                initialized: this.providers.google !== null,
                signedIn: this.providers.google?.getIsSignedIn() || false
            },
            activeProvider: this.activeProvider
        };
    }

    /**
     * Switch active provider
     * @param {string} provider - 'microsoft' or 'google'
     */
    switchProvider(provider) {
        if (!this.providers[provider]) {
            throw new Error(`Provider ${provider} not initialized`);
        }

        const isSignedIn = provider === 'microsoft' 
            ? this.providers.microsoft.isSignedIn()
            : this.providers.google.getIsSignedIn();

        if (!isSignedIn) {
            throw new Error(`Not signed in to ${provider}`);
        }

        this.activeProvider = provider;
    }
}

// Export for use in browser
if (typeof window !== 'undefined') {
    window.UnifiedCalendarClient = UnifiedCalendarClient;
}

// Export for use in Node.js (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnifiedCalendarClient;
}

// Made with Bob
