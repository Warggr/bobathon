# LifePilot - Smart Task Scheduler

## Team: Vibe Bobbing

**Event**: Bobathon - A fast-paced hackathon hosted by IBM and Google Developer Group (GDG) On Campus Zurich at IBM Switzerland Auditorium on April 30, 2026.

**Event Link**: [Bobathon Event Page](https://gdg.community.dev/events/details/google-gdg-on-campus-eth-zurich-zurich-switzerland-presents-bobathon-a-fast-paced-hack-event-ibm-x-gdgoc-zurich/)

**Contributors**:
- Pierre Ballif
- Sapar Charyyev
- Jun Huang
- Sena Yalcin

---

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

## How the Scheduling Algorithm Works

### Overview
LifePilot uses a **priority-based sequential scheduling algorithm** that schedules tasks one at a time in order of importance, ensuring no overlaps and optimal time placement.

### Detailed Algorithm Steps

#### Step 1: Calculate Priority Scores 📊

Each task gets a priority score based on multiple factors:

**Base Priority**: User-assigned priority (1-10)
- Critical: 10
- High: 8
- Medium: 5
- Low: 3

**Deadline Urgency Bonus**:
- Due in < 1 day: +10 points
- Due in < 3 days: +5 points
- Due in < 7 days: +2 points
- No deadline: +0 points

**Duration Bonus**:
- Tasks > 60 minutes: +1 point (longer tasks get slight priority)

**Example Calculation**:
```
Task: "Write Project Report"
- Base priority: 10 (Critical)
- Deadline: Tomorrow (+10 points)
- Duration: 90 minutes (+1 point)
= Total Score: 21 points
```

#### Step 2: Sort Tasks by Multiple Criteria 🎯

Tasks are sorted in this exact order:

1. **Priority Score** (highest first)
   - Task with score 21 comes before task with score 15

2. **Deadline** (earliest first, if same priority)
   - If both have score 15, task due tomorrow comes before task due next week

3. **Duration** (longest first, if same priority and deadline)
   - If both score 15 and due tomorrow, 2-hour task comes before 1-hour task

**Why this order?**
- Most important tasks get scheduled first
- Ensures critical deadlines are met
- Longer tasks get better time slots (morning focus time)

#### Step 3: Find Available Time Slots ⏰

For each task (in sorted order):

**3.1 Get Free Slots**
- Working hours: 9:00 AM - 6:00 PM (9 hours = 540 minutes)
- Find gaps between already scheduled tasks
- Account for imported calendar events

**3.2 Generate Candidate Start Times**
- Within each free slot, generate possible start times at 30-minute intervals
- Example: If slot is 9:00-12:00, candidates are 9:00, 9:30, 10:00, 10:30, 11:00, 11:30
- Only include times where task + break fits before slot ends

**3.3 Filter Out Overlaps**
- For each candidate start time:
  - Calculate task end time (start + duration)
  - Add 15-minute break after task
  - Check if this overlaps with ANY already scheduled task
  - Remove candidate if overlap detected

**Overlap Detection Logic**:
```
Task A: 9:00-10:00 (+ 15 min break = 9:00-10:15)
Candidate for Task B: 10:00-11:00

Check: Does 10:00 < 10:15? YES → OVERLAP → Reject
Next candidate: 10:30-11:30
Check: Does 10:30 < 10:15? NO → No overlap → Keep
```

#### Step 4: Score Remaining Time Slots 🎯

Each valid candidate slot gets scored based on time-of-day preferences:

**Time-of-Day Scoring**:
- **9:00-11:00 AM** (Morning): +15 points
  - Best for focused, deep work
  - High energy, fewer distractions
  
- **11:00 AM-12:00 PM** (Late Morning): +10 points
  - Still good focus time
  - Before lunch energy dip
  
- **1:00-3:00 PM** (Early Afternoon): +8 points
  - Post-lunch, moderate energy
  - Good for routine tasks
  
- **3:00-5:00 PM** (Late Afternoon): +12 points
  - Second wind energy
  - Good for wrapping up work
  
- **5:00-6:00 PM** (End of Day): +5 points
  - Lower priority time
  - For less demanding tasks

**Additional Scoring Factors**:
- Round hours (10:00, 11:00): +2 points
- Half hours (10:30, 11:30): +1 point
- Very start of day (9:00): -5 points (avoid bunching)
- End of day (5:00-6:00): -3 points (less ideal)

**Task-Specific Adjustments**:
- Long tasks (>90 min) in morning (9-12): +8 points
- Short tasks (≤30 min): +3 points (flexible placement)
- High priority tasks: Prefer earlier slots

#### Step 5: Schedule in Best Slot ✅

- Pick the candidate with the highest score
- Mark task as scheduled with start/end times
- Add to scheduled tasks list
- Move to next task in priority order

### Complete Example Walkthrough

**Initial State**:
- Working hours: 9:00 AM - 6:00 PM
- Imported event: 12:00-1:00 PM (Lunch meeting)
- Tasks to schedule:
  1. "Write Report" - 90 min, due tomorrow, priority 10
  2. "Code Review" - 45 min, due next week, priority 5
  3. "Email Client" - 20 min, due tomorrow, priority 8

**Step-by-Step Execution**:

**Task 1: "Write Report"**
- Priority score: 10 + 10 (deadline) + 1 (duration) = 21
- Free slots: 9:00-12:00, 1:00-6:00
- Candidates: 9:00, 9:30, 10:00, 10:30 (must fit 90 min + 15 min break)
- Scores:
  - 9:00: 15 (morning) - 5 (start penalty) + 8 (long task) = 18
  - 9:30: 15 (morning) + 8 (long task) + 1 (half hour) = 24 ← **Best**
  - 10:00: 15 (morning) + 8 (long task) + 2 (round hour) = 25 ← **Best**
- **Scheduled: 10:00-11:30 AM** (+ 15 min break = until 11:45)

**Task 2: "Email Client"**
- Priority score: 8 + 10 (deadline) = 18 (higher than Code Review)
- Free slots: 9:00-10:00, 11:45-12:00, 1:00-6:00
- Candidates: 9:00, 9:30, 11:45, 1:00, 1:30, 2:00, etc.
- Scores:
  - 9:00: 15 (morning) - 5 (start) + 3 (short) = 13
  - 9:30: 15 (morning) + 3 (short) + 1 (half) = 19 ← **Best**
- **Scheduled: 9:30-9:50 AM** (+ 15 min break = until 10:05)
- **Wait!** This overlaps with Task 1 (10:00). Reject.
- Try 1:00 PM: 8 (afternoon) + 3 (short) + 2 (round) = 13
- **Scheduled: 1:00-1:20 PM** (+ 15 min break = until 1:35)

**Task 3: "Code Review"**
- Priority score: 5 + 0 (no urgent deadline) = 5
- Free slots: 9:00-10:00, 11:45-12:00, 1:35-6:00
- Candidates: 9:00, 9:30, 1:35, 2:00, 2:30, etc.
- Best available: 2:00 PM (8 points + 2 round hour = 10)
- **Scheduled: 2:00-2:45 PM** (+ 15 min break = until 3:00)

**Final Schedule**:
```
9:30-9:50 AM:   Email Client (20 min) [Break until 10:05]
10:00-11:30 AM: Write Report (90 min) [Break until 11:45]
12:00-1:00 PM:  Lunch Meeting (imported event)
1:00-1:20 PM:   Email Client (20 min) [Break until 1:35]
2:00-2:45 PM:   Code Review (45 min) [Break until 3:00]
```

**Result**: All tasks scheduled with no overlaps, breaks included, optimal time placement! 🎉

### Key Algorithm Features

✅ **No Overlaps**: Every task checks against all scheduled tasks
✅ **Break Time**: 15 minutes automatically added after each task
✅ **Priority-Based**: Most important tasks get best time slots
✅ **Time-Aware**: Morning for focus work, afternoon for routine tasks
✅ **Conflict-Free**: Respects imported calendar events
✅ **Today Only**: All tasks scheduled within current day (9 AM - 6 PM)

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
