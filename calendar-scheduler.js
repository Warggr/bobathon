/**
 * LifePilot Calendar Scheduler
 * 
 * This module handles:
 * - Parsing iCalendar (ICS) format
 * - Mapping tasks to free time slots
 * - Exporting scheduled tasks to iCalendar format
 * - Smart scheduling algorithms
 */

class CalendarScheduler {
    constructor() {
        this.workingHours = {
            start: 9,  // 9 AM
            end: 18    // 6 PM
        };
        this.slotDuration = 30; // minutes
        this.breakDuration = 15; // minutes between tasks
    }

    /**
     * Parse iCalendar (ICS) format
     * @param {string} icsContent - Raw ICS file content
     * @returns {Array} Array of calendar events
     */
    parseICalendar(icsContent) {
        const events = [];
        const lines = icsContent.split(/\r?\n/);
        let currentEvent = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            if (line === 'BEGIN:VEVENT') {
                currentEvent = {};
            } else if (line === 'END:VEVENT' && currentEvent) {
                events.push(currentEvent);
                currentEvent = null;
            } else if (currentEvent) {
                const [key, ...valueParts] = line.split(':');
                const value = valueParts.join(':');

                if (key.startsWith('DTSTART')) {
                    currentEvent.start = this.parseICalDate(value);
                } else if (key.startsWith('DTEND')) {
                    currentEvent.end = this.parseICalDate(value);
                } else if (key === 'SUMMARY') {
                    currentEvent.summary = value;
                } else if (key === 'DESCRIPTION') {
                    currentEvent.description = value;
                } else if (key === 'UID') {
                    currentEvent.uid = value;
                }
            }
        }

        return events;
    }

    /**
     * Parse iCalendar date format (YYYYMMDDTHHMMSS or YYYYMMDD)
     * @param {string} dateStr - Date string from ICS
     * @returns {Date} JavaScript Date object
     */
    parseICalDate(dateStr) {
        // Remove timezone info if present
        dateStr = dateStr.split('Z')[0].split('T')[0];
        
        if (dateStr.length === 8) {
            // YYYYMMDD format
            const year = parseInt(dateStr.substring(0, 4));
            const month = parseInt(dateStr.substring(4, 6)) - 1;
            const day = parseInt(dateStr.substring(6, 8));
            return new Date(year, month, day);
        } else if (dateStr.length >= 15) {
            // YYYYMMDDTHHMMSS format
            const year = parseInt(dateStr.substring(0, 4));
            const month = parseInt(dateStr.substring(4, 6)) - 1;
            const day = parseInt(dateStr.substring(6, 8));
            const hour = parseInt(dateStr.substring(9, 11));
            const minute = parseInt(dateStr.substring(11, 13));
            const second = parseInt(dateStr.substring(13, 15));
            return new Date(year, month, day, hour, minute, second);
        }
        
        return new Date(dateStr);
    }

    /**
     * Format date to iCalendar format (YYYYMMDDTHHMMSS)
     * @param {Date} date - JavaScript Date object
     * @returns {string} Formatted date string
     */
    formatICalDate(date) {
        const pad = (n) => n.toString().padStart(2, '0');
        return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
    }

    /**
     * Find free time slots in a given day
     * @param {Date} date - The date to check
     * @param {Array} existingEvents - Array of existing calendar events
     * @returns {Array} Array of free time slots {start, end}
     */
    findFreeSlots(date, existingEvents) {
        const freeSlots = [];
        const dayStart = new Date(date);
        dayStart.setHours(this.workingHours.start, 0, 0, 0);
        
        const dayEnd = new Date(date);
        dayEnd.setHours(this.workingHours.end, 0, 0, 0);

        // Filter events for this specific day
        const dayEvents = existingEvents.filter(event => {
            const eventDate = new Date(event.start);
            return eventDate.toDateString() === date.toDateString();
        }).sort((a, b) => new Date(a.start) - new Date(b.start));

        let currentTime = dayStart;

        for (const event of dayEvents) {
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);

            // If there's a gap before this event
            if (currentTime < eventStart) {
                freeSlots.push({
                    start: new Date(currentTime),
                    end: new Date(eventStart)
                });
            }

            // Move current time to after this event
            currentTime = eventEnd > currentTime ? eventEnd : currentTime;
        }

        // Add remaining time until end of day
        if (currentTime < dayEnd) {
            freeSlots.push({
                start: new Date(currentTime),
                end: new Date(dayEnd)
            });
        }

        return freeSlots;
    }

    /**
     * Simple scheduling algorithm: First-fit
     * Assigns tasks to the first available slot that fits
     * @param {Array} tasks - Array of tasks {id, name, time, deadline, priority}
     * @param {Array} existingEvents - Array of existing calendar events
     * @param {Date} startDate - Start date for scheduling
     * @param {number} daysAhead - Number of days to look ahead
     * @returns {Object} {scheduled: [], unscheduled: []}
     */
    scheduleTasksFirstFit(tasks, existingEvents, startDate = new Date(), daysAhead = 7) {
        const scheduled = [];
        const unscheduled = [];

        // Sort tasks by deadline (earliest first), then by time (longest first)
        const sortedTasks = [...tasks].sort((a, b) => {
            if (a.deadline && b.deadline) {
                return new Date(a.deadline) - new Date(b.deadline);
            }
            if (a.deadline) return -1;
            if (b.deadline) return 1;
            return b.time - a.time;
        });

        for (const task of sortedTasks) {
            let taskScheduled = false;
            const taskDuration = task.time; // in minutes

            // Determine the date range to search
            const searchStartDate = new Date(startDate);
            const searchEndDate = task.deadline ? new Date(task.deadline) : new Date(startDate);
            if (!task.deadline) {
                searchEndDate.setDate(searchEndDate.getDate() + daysAhead);
            }

            // Try to schedule on each day
            for (let d = new Date(searchStartDate); d <= searchEndDate; d.setDate(d.getDate() + 1)) {
                const freeSlots = this.findFreeSlots(d, [...existingEvents, ...scheduled]);

                for (const slot of freeSlots) {
                    const slotDuration = (slot.end - slot.start) / (1000 * 60); // in minutes

                    if (slotDuration >= taskDuration + this.breakDuration) {
                        // Schedule the task
                        const taskStart = new Date(slot.start);
                        const taskEnd = new Date(taskStart);
                        taskEnd.setMinutes(taskEnd.getMinutes() + taskDuration);

                        scheduled.push({
                            ...task,
                            scheduledStart: taskStart,
                            scheduledEnd: taskEnd,
                            uid: `lifepilot-${task.id}-${Date.now()}`
                        });

                        taskScheduled = true;
                        break;
                    }
                }

                if (taskScheduled) break;
            }

            if (!taskScheduled) {
                unscheduled.push(task);
            }
        }

        return { scheduled, unscheduled };
    }

    /**
     * Priority-based scheduling algorithm with optimal time distribution
     * Considers task priority, deadline urgency, optimal time of day, and realistic scheduling
     * @param {Array} tasks - Array of tasks with priority field
     * @param {Array} existingEvents - Array of existing calendar events
     * @param {Date} startDate - Start date for scheduling
     * @param {number} daysAhead - Number of days to look ahead
     * @returns {Object} {scheduled: [], unscheduled: []}
     */
    scheduleTasksPriority(tasks, existingEvents, startDate = new Date(), daysAhead = 7) {
        const scheduled = [];
        const unscheduled = [];

        // Calculate priority scores
        const tasksWithScores = tasks.map(task => {
            let score = task.priority || 5; // Default priority

            // Increase score for tasks with deadlines
            if (task.deadline) {
                const daysUntilDeadline = (new Date(task.deadline) - startDate) / (1000 * 60 * 60 * 24);
                if (daysUntilDeadline < 1) score += 10;
                else if (daysUntilDeadline < 3) score += 5;
                else if (daysUntilDeadline < 7) score += 2;
            }

            // Longer tasks get slight priority boost
            if (task.time > 60) score += 1;

            return { ...task, priorityScore: score };
        });

        // Sort by priority score (highest first), then by deadline, then by duration (longest first)
        const sortedTasks = tasksWithScores.sort((a, b) => {
            if (b.priorityScore !== a.priorityScore) {
                return b.priorityScore - a.priorityScore;
            }
            // If same priority, schedule tasks with earlier deadlines first
            if (a.deadline && b.deadline) {
                const deadlineDiff = new Date(a.deadline) - new Date(b.deadline);
                if (deadlineDiff !== 0) return deadlineDiff;
            }
            // If same deadline or no deadlines, longer tasks first
            return b.time - a.time;
        });

        // Get all free slots for today only
        const todaySlots = this.findFreeSlots(startDate, existingEvents);
        
        // Schedule tasks sequentially without overlaps
        for (const task of sortedTasks) {
            const scheduled_task = this.scheduleTaskInSlots(
                task,
                todaySlots,
                scheduled,
                startDate
            );

            if (scheduled_task) {
                scheduled.push(scheduled_task);
            } else {
                unscheduled.push(task);
            }
        }

        return { scheduled, unscheduled };
    }

    /**
     * Schedule a single task in available slots without overlapping
     * @param {Object} task - Task to schedule
     * @param {Array} freeSlots - Array of free time slots for the day
     * @param {Array} scheduledTasks - Array of already scheduled tasks
     * @param {Date} date - The date to schedule on
     * @returns {Object|null} Scheduled task or null if cannot schedule
     */
    scheduleTaskInSlots(task, freeSlots, scheduledTasks, date) {
        const taskDuration = task.time; // in minutes
        
        // Build a list of candidate slots that don't overlap with scheduled tasks
        const candidateSlots = [];

        for (const slot of freeSlots) {
            // Generate possible start times within this slot
            const possibleStarts = this.generateOptimalStartTimes(
                slot,
                taskDuration,
                task
            );

            // Filter out start times that would overlap with already scheduled tasks
            for (const candidate of possibleStarts) {
                const taskEnd = new Date(candidate.start);
                taskEnd.setMinutes(taskEnd.getMinutes() + taskDuration);
                
                // Check if this time slot overlaps with any scheduled task
                const hasOverlap = scheduledTasks.some(scheduled => {
                    const scheduledStart = new Date(scheduled.scheduledStart);
                    const scheduledEnd = new Date(scheduled.scheduledEnd);
                    
                    // Add break duration to scheduled end
                    scheduledEnd.setMinutes(scheduledEnd.getMinutes() + this.breakDuration);
                    
                    // Check for overlap
                    return (candidate.start < scheduledEnd && taskEnd > scheduledStart);
                });

                if (!hasOverlap) {
                    candidateSlots.push(candidate);
                }
            }
        }

        if (candidateSlots.length === 0) {
            return null;
        }

        // Score each candidate slot and pick the best one
        const scoredSlots = candidateSlots.map(candidate => ({
            ...candidate,
            score: this.scoreTimeSlot(candidate, task, date)
        }));

        // Sort by score (highest first)
        scoredSlots.sort((a, b) => b.score - a.score);

        // Use the best slot
        const bestSlot = scoredSlots[0];
        const taskEnd = new Date(bestSlot.start);
        taskEnd.setMinutes(taskEnd.getMinutes() + taskDuration);

        return {
            ...task,
            scheduledStart: bestSlot.start,
            scheduledEnd: taskEnd,
            uid: `lifepilot-${task.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
    }

    /**
     * Generate optimal start times within a free slot
     * @param {Object} slot - Free time slot {start, end}
     * @param {number} taskDuration - Task duration in minutes
     * @param {Object} task - Task object
     * @returns {Array} Array of possible start times
     */
    generateOptimalStartTimes(slot, taskDuration, task) {
        const possibleStarts = [];
        const slotDuration = (slot.end - slot.start) / (1000 * 60);
        
        // Generate start times at 30-minute intervals within the slot
        const intervalMinutes = 30;
        let currentTime = new Date(slot.start);
        const slotEnd = new Date(slot.end);
        slotEnd.setMinutes(slotEnd.getMinutes() - taskDuration - this.breakDuration);

        while (currentTime <= slotEnd) {
            possibleStarts.push({
                start: new Date(currentTime),
                slotStart: slot.start,
                slotEnd: slot.end
            });
            currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes);
        }

        return possibleStarts;
    }

    /**
     * Score a time slot based on multiple factors
     * @param {Object} candidate - Candidate slot with start time
     * @param {Object} task - Task to schedule
     * @param {Date} deadline - Task deadline
     * @returns {number} Score (higher is better)
     */
    scoreTimeSlot(candidate, task, deadline) {
        let score = 0;
        const startTime = new Date(candidate.start);
        const hour = startTime.getHours();
        const minute = startTime.getMinutes();
        const timeInMinutes = hour * 60 + minute;

        // 1. Time of day preference (peak productivity hours)
        // Morning (9-11): Good for focused work
        if (hour >= 9 && hour < 11) {
            score += 15;
        }
        // Late morning (11-12): Still good
        else if (hour >= 11 && hour < 12) {
            score += 10;
        }
        // Early afternoon (13-15): Post-lunch, moderate
        else if (hour >= 13 && hour < 15) {
            score += 8;
        }
        // Late afternoon (15-17): Good for wrapping up
        else if (hour >= 15 && hour < 17) {
            score += 12;
        }
        // End of day (17-18): Lower priority
        else if (hour >= 17 && hour < 18) {
            score += 5;
        }

        // 2. Prefer times not at the very start of the day (avoid 9:00 AM bunching)
        if (hour === 9 && minute === 0) {
            score -= 5; // Slight penalty for 9:00 AM
        }

        // 3. Deadline urgency - schedule closer to deadline for urgent tasks
        const daysUntilDeadline = (deadline - startTime) / (1000 * 60 * 60 * 24);
        if (task.priority >= 8) {
            // High priority: prefer earlier in the available window
            if (daysUntilDeadline > 3) {
                score += 10; // Schedule sooner
            } else if (daysUntilDeadline > 1) {
                score += 15;
            } else {
                score += 20; // Very urgent
            }
        } else {
            // Lower priority: can be scheduled later
            if (daysUntilDeadline < 1) {
                score += 15;
            } else if (daysUntilDeadline < 3) {
                score += 8;
            } else {
                score += 5;
            }
        }

        // 4. Task duration consideration
        // Longer tasks prefer morning slots
        if (task.time > 90 && hour >= 9 && hour < 12) {
            score += 8;
        }
        // Shorter tasks can fit anywhere
        else if (task.time <= 30) {
            score += 3;
        }

        // 5. Prefer slots that aren't at the very end of the working day
        if (hour >= 17) {
            score -= 3;
        }

        // 6. Slight preference for round hours (10:00, 11:00, etc.)
        if (minute === 0) {
            score += 2;
        } else if (minute === 30) {
            score += 1;
        }

        return score;
    }

    /**
     * Export scheduled tasks to iCalendar format
     * @param {Array} scheduledTasks - Array of scheduled tasks
     * @returns {string} ICS format string
     */
    exportToICalendar(scheduledTasks) {
        let ics = 'BEGIN:VCALENDAR\r\n';
        ics += 'VERSION:2.0\r\n';
        ics += 'PRODID:-//LifePilot//Task Scheduler//EN\r\n';
        ics += 'CALSCALE:GREGORIAN\r\n';
        ics += 'METHOD:PUBLISH\r\n';
        ics += 'X-WR-CALNAME:LifePilot Tasks\r\n';
        ics += 'X-WR-TIMEZONE:UTC\r\n';

        for (const task of scheduledTasks) {
            ics += 'BEGIN:VEVENT\r\n';
            ics += `UID:${task.uid || `lifepilot-${task.id}-${Date.now()}`}\r\n`;
            ics += `DTSTAMP:${this.formatICalDate(new Date())}\r\n`;
            ics += `DTSTART:${this.formatICalDate(task.scheduledStart)}\r\n`;
            ics += `DTEND:${this.formatICalDate(task.scheduledEnd)}\r\n`;
            ics += `SUMMARY:${task.name}\r\n`;
            
            if (task.description) {
                ics += `DESCRIPTION:${task.description}\r\n`;
            }
            
            ics += `STATUS:CONFIRMED\r\n`;
            ics += `SEQUENCE:0\r\n`;
            ics += 'END:VEVENT\r\n';
        }

        ics += 'END:VCALENDAR\r\n';
        return ics;
    }

    /**
     * Download ICS file
     * @param {string} icsContent - ICS format string
     * @param {string} filename - Filename for download
     */
    downloadICS(icsContent, filename = 'lifepilot-schedule.ics') {
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    /**
     * Generate a webcal:// URL for calendar subscription
     * Note: This requires the ICS file to be hosted on a web server
     * @param {string} icsUrl - HTTP(S) URL to the ICS file
     * @returns {string} webcal:// URL
     */
    generateWebcalUrl(icsUrl) {
        return icsUrl.replace(/^https?:\/\//, 'webcal://');
    }

    /**
     * Convert scheduled tasks to a format suitable for the UI
     * @param {Array} scheduledTasks - Array of scheduled tasks
     * @returns {Object} Calendar data grouped by date
     */
    formatForUI(scheduledTasks) {
        const calendar = {};

        for (const task of scheduledTasks) {
            const dateKey = task.scheduledStart.toISOString().split('T')[0];
            
            if (!calendar[dateKey]) {
                calendar[dateKey] = [];
            }

            calendar[dateKey].push({
                id: task.id,
                name: task.name,
                start: task.scheduledStart,
                end: task.scheduledEnd,
                duration: task.time,
                originalDeadline: task.deadline
            });
        }

        // Sort tasks within each day by start time
        for (const date in calendar) {
            calendar[date].sort((a, b) => a.start - b.start);
        }

        return calendar;
    }

    /**
     * Set working hours
     * @param {number} start - Start hour (0-23)
     * @param {number} end - End hour (0-23)
     */
    setWorkingHours(start, end) {
        this.workingHours.start = start;
        this.workingHours.end = end;
    }

    /**
     * Set slot and break durations
     * @param {number} slotDuration - Duration of time slots in minutes
     * @param {number} breakDuration - Duration of breaks in minutes
     */
    setDurations(slotDuration, breakDuration) {
        this.slotDuration = slotDuration;
        this.breakDuration = breakDuration;
    }
}

// Export for use in browser or Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CalendarScheduler;
}

// Made with Bob
