# LifePilot - Smart Task Scheduler

## Overview

LifePilot is an intelligent daily planning application that helps you make better decisions about how to spend your time. It combines mood-based task generation, priority-based scheduling, and calendar integration to create personalized daily plans with zero overlaps.

## Features

### 🎯 Core Features
- **Mood-Based Task Generation**: Generate task suggestions based on your mood, goals, and available time
- **Priority-Based Scheduling**: Advanced algorithm schedules tasks by priority with no overlaps
- **Single-Day Calendar View**: Beautiful timeline showing all events for the selected day
- **Calendar Integration**: Import existing calendars (ICS format) to avoid conflicts
- **Unified Task Management**: Mood-based and manual tasks in one place
- **Smart Scheduling**: All tasks scheduled for today with 15-minute breaks
- **Data Persistence**: Tasks and settings saved in browser

### ✨ Key Features
- 🎭 **Mood Selection**: Choose from Energetic, Tired, Stressed, or Unmotivated
- 🎯 **Goal-Based Planning**: Focus on Study, Health, or Social goals
- ⏱️ **Time-Based Filtering**: Tasks adjusted to your available time
- ➕ **Manual Task Entry**: Add custom tasks with duration and deadline
- 🤖 **Auto-Schedule**: One-click scheduling for all pending tasks
- 📅 **Calendar Import**: Import ICS files to avoid scheduling conflicts
- 📊 **Task Status Tracking**: See pending vs scheduled tasks
- 🗓️ **Single-Day View**: Navigate between days to see your schedule

## Quick Start

### 1. Run the Application
```bash
# Start local server
python3 -m http.server 8000

# Open in browser
http://localhost:8000/lifepilot.html
```

### 2. Generate Mood-Based Tasks
1. Select your current mood (Energetic, Tired, Stressed, Unmotivated)
2. Choose your main goal (Study, Health, Social)
3. Select available time (15 min, 1 hour, Half day, Full day)
4. Click "Generate My Plan"
5. Tasks appear in "📋 My Tasks" section

### 3. Add Manual Tasks (Optional)
1. Navigate to "Task Manager & Schedule" section
2. Enter task details:
   - Name: "Complete project report"
   - Duration: 120 minutes
   - Deadline: Select date
3. Click "Add Task"
4. Task appears in "📋 My Tasks" section

### 4. Schedule All Tasks
1. (Optional) Import your calendar as ICS file to avoid conflicts
2. Click "🤖 Auto-Schedule Tasks"
3. All pending tasks scheduled for TODAY with no overlaps
4. Tasks move to "✅ Scheduled Tasks" section
5. View in "📅 Today's Schedule" calendar

## Documentation

- **Quick Start**: [`QUICK_START.md`](QUICK_START.md) - Get started in 3 steps
- **Task Manager**: [`TASK_MANAGER_README.md`](TASK_MANAGER_README.md) - Complete task management guide
- **Scheduler**: [`SCHEDULER_README.md`](SCHEDULER_README.md) - Calendar scheduling details

## Project Structure

```
bobathon/
├── lifepilot.html              # Main application
├── calendar-scheduler.js       # Scheduling engine
├── data/
│   └── sample-calendar.ics    # Sample calendar for testing
├── README.md                   # This file
├── QUICK_START.md             # Quick start guide
├── TASK_MANAGER_README.md     # Task manager documentation
└── SCHEDULER_README.md        # Scheduler documentation
```

## Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Scheduling**: Custom CalendarScheduler class
- **Storage**: Browser localStorage
- **Calendar**: iCalendar (ICS) format support
- **No Dependencies**: Pure JavaScript, no frameworks

## Key Components

### CalendarScheduler (`calendar-scheduler.js`)
- **Parse ICS Files**: Import existing calendar events
- **Find Free Slots**: Identify available time slots in the day
- **Priority-Based Scheduling**: Advanced algorithm that:
  - Calculates priority scores based on task priority, deadline urgency, and duration
  - Sorts tasks by priority (high→low), deadline (early→late), duration (long→short)
  - Schedules sequentially with overlap detection
  - Adds 15-minute breaks between tasks
  - Ensures all tasks fit within working hours (9 AM - 6 PM)
- **Export to ICS**: Generate calendar files for scheduled tasks

### Task Management System
- **Mood-Based Generation**: Creates task suggestions based on mood/goal/time
- **Manual Task Entry**: Add custom tasks with full control
- **Unified Task List**: Both mood and manual tasks in one place
- **Status Tracking**: Pending → Scheduled workflow
- **Delete Functionality**: Remove tasks from both lists
- **localStorage Persistence**: Tasks saved across sessions

### UI Components
- **Mood Selection**: Interactive mood/goal/time picker
- **Task Lists**: Separate sections for pending and scheduled tasks
- **Single-Day Calendar**: Timeline view with navigation
- **Auto-Schedule Button**: One-click scheduling for all tasks
- **Calendar Import**: ICS file upload with conflict detection

## How It Works

### 1. Task Generation & Entry
```javascript
// Mood-based tasks are generated
currentPlan = [
  { id: 'study-1', name: 'Library Study Session', time: 120, priority: 8, status: 'pending' },
  { id: 'study-2', name: 'Practice Problems', time: 45, priority: 7, status: 'pending' }
];

// Manual tasks are added
manualTasks.push({
  id: Date.now(),
  name: "Team Meeting",
  time: 60,
  deadline: new Date(),
  status: "pending"
});
```

### 2. Priority-Based Scheduling
```javascript
// All pending tasks scheduled together
const result = scheduler.scheduleTasksPriority(
  [...currentPlan, ...manualTasks],  // All pending tasks
  importedEvents,                     // Existing calendar events
  new Date(),                         // Today
  0                                   // Only schedule for today
);

// Result: { scheduled: [...], unscheduled: [...] }
```

### 3. Calendar Display
```javascript
// All scheduled events shown in single-day view
renderCalendar(); // Shows mood tasks + manual tasks + imported events
```

## Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

**Requirements**:
- JavaScript ES6+
- LocalStorage API
- FileReader API

## Development

### Local Development
```bash
# Clone repository
git clone <repository-url>
cd bobathon

# Start server
python3 -m http.server 8000

# Open browser
open http://localhost:8000/lifepilot.html
```

### Testing
1. Open `lifepilot.html` in browser
2. Add sample tasks
3. Import `data/sample-calendar.ics`
4. Test scheduling functionality
5. Verify localStorage persistence

## Scheduling Algorithm

The priority-based scheduling algorithm ensures optimal task placement:

1. **Priority Calculation**
   - Base priority from task
   - +10 points if deadline < 1 day
   - +5 points if deadline < 3 days
   - +2 points if deadline < 7 days
   - +1 point for tasks > 60 minutes

2. **Task Sorting**
   - Sort by priority score (highest first)
   - Then by deadline (earliest first)
   - Then by duration (longest first)

3. **Sequential Scheduling**
   - For each task in priority order:
     - Find all available time slots
     - Filter out slots that overlap with scheduled tasks
     - Score remaining slots by time-of-day preferences
     - Schedule in best available slot
     - Add 15-minute break after task

4. **Overlap Prevention**
   - Check each candidate slot against all scheduled tasks
   - Include break duration in overlap detection
   - Ensure no conflicts with imported calendar events

## Troubleshooting

### Tasks Not Scheduling
- **Not enough time**: Reduce task durations or remove some tasks
- **Working hours**: Tasks only scheduled 9 AM - 6 PM
- **Overlaps**: Check imported calendar for conflicts
- **Today only**: All tasks scheduled for current day

### Tasks Not Appearing in List
- **Mood tasks**: Click "Generate My Plan" first
- **Manual tasks**: Fill all required fields before adding
- **Refresh**: Reload page if tasks don't appear

### Calendar Not Updating
- **After scheduling**: Calendar updates automatically
- **Navigation**: Use Prev/Next buttons to change days
- **Refresh**: Reload page if calendar doesn't update

### Data Not Persisting
- **localStorage**: Enable in browser settings
- **Private mode**: Disable incognito/private browsing
- **Storage quota**: Clear browser data if full

## Future Enhancements

- [ ] Multi-day scheduling (currently today only)
- [ ] Recurring tasks support
- [ ] Task categories and tags
- [ ] Google Calendar API integration
- [ ] Microsoft Outlook integration
- [ ] Mobile responsive design
- [ ] Task dependencies
- [ ] Team collaboration features
- [ ] Analytics and insights dashboard
- [ ] Custom working hours per day
- [ ] Break duration preferences

## Contributing

This project was built for the IBM Hackathon. Contributions and suggestions are welcome!

## License

Part of the LifePilot project - Smart Task Scheduling

## Credits

Built with:
- Vanilla JavaScript (no frameworks)
- iCalendar RFC 5545 standard
- Modern browser APIs
- Priority-based scheduling algorithms

---

**Made with ❤️ for better daily planning**

For detailed documentation, see:
- [`QUICK_START.md`](QUICK_START.md)
- [`TASK_MANAGER_README.md`](TASK_MANAGER_README.md)
- [`SCHEDULER_README.md`](SCHEDULER_README.md)
