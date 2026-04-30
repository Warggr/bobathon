# LifePilot Task Manager - User Guide

## Overview

The Task Manager feature allows you to manually add tasks with deadlines and automatically schedule them using the CalendarScheduler engine. Tasks are persisted in localStorage and can be integrated with imported calendar events.

## Features

### ✅ Manual Task Addition
- Add tasks with name, duration (in minutes), and optional deadline
- Input validation ensures data quality
- Tasks are saved automatically to localStorage

### 📅 Smart Scheduling
- Automatically schedule tasks using the CalendarScheduler
- Avoid conflicts with imported calendar events
- Respects working hours (9 AM - 6 PM by default)
- Adds break time between tasks (15 minutes)

### 📊 Task Status Tracking
- **Pending** (⏳): Tasks waiting to be scheduled
- **Scheduled** (✅): Tasks with assigned time slots
- Visual indicators show task status

### 💾 Data Persistence
- All tasks saved to browser localStorage
- Data persists across page reloads
- No server required

### 📥 Calendar Integration
- Import existing calendar events from ICS files
- Scheduler avoids conflicts with imported events
- Supports Google Calendar, Outlook, Apple Calendar exports

## How to Use

### 1. Add a Task

1. Navigate to the "Task Manager & Schedule" section
2. Fill in the form:
   - **Task Name** (required): e.g., "Complete project report"
   - **Duration** (required): Time in minutes, e.g., 120
   - **Deadline** (optional): Select a date from the date picker
3. Click "Add Task"
4. Task appears in "My Tasks" list with pending status

### 2. Import Calendar (Optional)

1. Export your calendar as an ICS file from:
   - Google Calendar: Settings → Import & Export → Export
   - Outlook: File → Save Calendar → iCalendar Format
   - Apple Calendar: File → Export → Export
2. Click "📥 Import ICS File" button
3. Select your ICS file
4. Confirmation message shows number of imported events

### 3. Schedule Tasks

1. Click "🤖 Auto-Schedule Tasks" button
2. The scheduler will:
   - Analyze all pending tasks
   - Find free time slots in your calendar
   - Assign tasks to optimal time slots
   - Respect deadlines and working hours
3. View results:
   - **Scheduled Tasks**: Successfully scheduled with time slots
   - **Unscheduled Tasks**: Tasks that couldn't fit (if any)

### 4. View Scheduled Tasks

- Scheduled tasks appear in the timeline view
- Each task shows:
  - Task name
  - Duration
  - Scheduled date and time
- Tasks are sorted chronologically

### 5. Manage Tasks

- **Delete Task**: Click the × button on any task
- **View Status**: Color-coded borders indicate status
  - 🟢 Green: Scheduled
  - 🟠 Orange: Pending
  - 🔴 Red: Unscheduled (couldn't fit)

## Task Data Structure

```javascript
{
  id: 1714489200000,              // Unique timestamp ID
  name: "Complete project report", // Task description
  time: 120,                       // Duration in minutes
  deadline: "2026-05-01",         // ISO date string (optional)
  status: "pending",              // "pending" | "scheduled"
  scheduledStart: null,           // Date object (set by scheduler)
  scheduledEnd: null              // Date object (set by scheduler)
}
```

## Scheduling Algorithm

The system uses the **First-Fit Algorithm** from CalendarScheduler:

1. **Sort Tasks**: By deadline (earliest first), then duration (longest first)
2. **Find Free Slots**: Identify available time slots in working hours
3. **Assign Tasks**: Place each task in the first available slot
4. **Add Breaks**: Automatically add 15-minute breaks between tasks
5. **Handle Conflicts**: Skip slots occupied by imported events

### Working Hours
- Default: 9:00 AM - 6:00 PM
- Can be customized in CalendarScheduler settings

### Scheduling Rules
- Tasks must fit within working hours
- Minimum 15-minute break between tasks
- Deadlines are respected (tasks scheduled before deadline)
- No overlapping with imported calendar events

## API Functions

### Core Functions

```javascript
// Add a new task
addManualTask()

// Delete a task by ID
deleteTask(taskId)

// Schedule all pending tasks
scheduleAllTasks()

// Import calendar from ICS file
handleICSImport(event)

// Load tasks from localStorage
loadTasks()

// Save tasks to localStorage
saveTasks()

// Render tasks list UI
renderTasksList()

// Display scheduled/unscheduled results
displayScheduledTasks(scheduled, unscheduled)

// Update timeline with scheduled tasks
updateTimelineWithTasks(scheduledTasks)

// Show notification message
showMessage(message, type)
```

### Usage Examples

```javascript
// Manually add a task via code
manualTasks.push({
  id: Date.now(),
  name: "Team Meeting",
  time: 60,
  deadline: "2026-05-01",
  status: "pending"
});
saveTasks();
renderTasksList();

// Schedule tasks programmatically
scheduleAllTasks();

// Access scheduled tasks
const scheduledTasks = manualTasks.filter(t => t.status === 'scheduled');
```

## LocalStorage Structure

Tasks are stored in localStorage under the key `lifepilot_tasks`:

```json
[
  {
    "id": 1714489200000,
    "name": "Complete project report",
    "time": 120,
    "deadline": "2026-05-01",
    "status": "scheduled",
    "scheduledStart": "2026-04-30T10:00:00.000Z",
    "scheduledEnd": "2026-04-30T12:00:00.000Z"
  }
]
```

## Troubleshooting

### Tasks Not Scheduling

**Problem**: Some tasks show as "unscheduled"

**Solutions**:
1. Extend the deadline to give more scheduling flexibility
2. Reduce task duration to fit in available slots
3. Check if working hours are too restrictive
4. Remove or reschedule conflicting imported events
5. Increase the look-ahead days (default: 7 days)

### Tasks Not Persisting

**Problem**: Tasks disappear after page reload

**Solutions**:
1. Check browser localStorage is enabled
2. Ensure not in private/incognito mode
3. Check browser storage quota
4. Clear browser cache and try again

### Import Fails

**Problem**: ICS file import shows error

**Solutions**:
1. Verify file is valid ICS format
2. Check file encoding (should be UTF-8)
3. Try exporting calendar again from source
4. Test with the sample file: `data/sample-calendar.ics`

### Validation Errors

**Problem**: Can't add task

**Solutions**:
1. Ensure task name is not empty
2. Duration must be a positive number
3. Deadline must be a valid date (or leave empty)
4. Check browser console for specific errors

## Best Practices

### Task Management
- ✅ Add realistic task durations
- ✅ Set deadlines for important tasks
- ✅ Break large tasks into smaller chunks
- ✅ Schedule tasks at least a day in advance
- ✅ Review and adjust unscheduled tasks

### Scheduling
- ✅ Import your calendar before scheduling
- ✅ Schedule tasks in batches
- ✅ Leave buffer time for unexpected events
- ✅ Re-schedule if plans change
- ✅ Mark completed tasks as done

### Performance
- ✅ Keep task list under 100 items
- ✅ Clear old completed tasks regularly
- ✅ Import only relevant calendar date range
- ✅ Use specific deadlines when possible

## Integration with CalendarScheduler

The Task Manager uses the existing CalendarScheduler class:

```javascript
// Initialize scheduler
const scheduler = new CalendarScheduler();

// Schedule tasks
const result = scheduler.scheduleTasksFirstFit(
  manualTasks,      // Your manual tasks
  importedEvents,   // Imported calendar events
  new Date(),       // Start date
  7                 // Days to look ahead
);

// Access results
console.log(result.scheduled);    // Successfully scheduled
console.log(result.unscheduled);  // Couldn't fit
```

## Future Enhancements

Planned features:
- [ ] Task priorities (high, medium, low)
- [ ] Task categories/tags
- [ ] Recurring tasks
- [ ] Task dependencies
- [ ] Drag-and-drop rescheduling
- [ ] Export tasks to ICS
- [ ] Task completion tracking
- [ ] Statistics and analytics
- [ ] Mobile-responsive design
- [ ] Keyboard shortcuts

## Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

**Requirements**:
- JavaScript ES6+
- LocalStorage API
- FileReader API
- Date API

## Support

For issues or questions:
1. Check this documentation
2. Review `SCHEDULER_README.md` for scheduler details
3. Test with `data/sample-calendar.ics`
4. Check browser console for errors

## Credits

Built with:
- CalendarScheduler.js (existing)
- Vanilla JavaScript (no dependencies)
- LocalStorage API
- Modern browser APIs

---

**Made with ❤️ for LifePilot - Your Daily Decision Assistant**