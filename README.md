# LifePilot - Daily Decision Assistant

## Overview

LifePilot is an intelligent daily planning application that helps you make better decisions about how to spend your time. It combines mood-based planning, smart task scheduling, and calendar integration to create personalized daily plans.

## Features

### 🎯 Core Features
- **Mood-Based Planning**: Adjust plans based on your energy level and emotional state
- **Goal-Oriented**: Focus on Work, Study, Health, Social, or Finance goals
- **Smart Scheduling**: AI-powered task scheduling with conflict avoidance
- **Calendar Integration**: Import existing calendars (ICS format)
- **Task Manager**: Add, schedule, and track manual tasks
- **Visual Timeline**: Beautiful timeline view of your day
- **Data Persistence**: Tasks and settings saved in browser

### ✨ New: Task Manager
- ➕ Add tasks with name, duration, and deadline
- 🤖 Auto-schedule tasks using smart algorithms
- 📅 Import calendar to avoid conflicts
- 💾 Persistent storage in localStorage
- ✅ Track scheduled vs unscheduled tasks
- 🎨 Visual status indicators

## Quick Start

### 1. Run the Application
```bash
# Start local server
python3 -m http.server 8000

# Open in browser
http://localhost:8000/lifepilot.html
```

### 2. Add Your First Task
1. Navigate to "Task Manager & Schedule" section
2. Enter task details:
   - Name: "Complete project report"
   - Duration: 120 minutes
   - Deadline: Select date
3. Click "Add Task"

### 3. Schedule Tasks
1. (Optional) Import your calendar as ICS file
2. Click "🤖 Auto-Schedule Tasks"
3. View scheduled tasks in timeline

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

### CalendarScheduler
- Parse ICS calendar files
- Find free time slots
- Schedule tasks with algorithms:
  - First-Fit: Fast, simple scheduling
  - Priority-Based: Considers deadlines and priorities
- Export to ICS format

### Task Manager
- CRUD operations for tasks
- Input validation
- Status tracking (pending/scheduled)
- Integration with CalendarScheduler
- localStorage persistence

### UI Components
- Mood selection interface
- Goal-based planning
- Timeline visualization
- Task management forms
- Calendar import/export

## Usage Examples

### Add a Task Programmatically
```javascript
manualTasks.push({
  id: Date.now(),
  name: "Team Meeting",
  time: 60,
  deadline: "2026-05-01",
  status: "pending"
});
saveTasks();
renderTasksList();
```

### Schedule Tasks
```javascript
const result = scheduler.scheduleTasksFirstFit(
  manualTasks,
  importedEvents,
  new Date(),
  7  // Look ahead 7 days
);
```

### Import Calendar
```javascript
const events = scheduler.parseICalendar(icsContent);
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

## Troubleshooting

### Tasks Not Scheduling
- Extend deadlines
- Reduce task durations
- Check working hours (9 AM - 6 PM)
- Verify calendar import

### Data Not Persisting
- Enable localStorage in browser
- Disable private/incognito mode
- Check storage quota

### Import Fails
- Verify ICS file format
- Check file encoding (UTF-8)
- Test with sample file

## Future Enhancements

- [ ] Task priorities and categories
- [ ] Recurring tasks
- [ ] Google Calendar API integration
- [ ] Microsoft Outlook integration
- [ ] Mobile app version
- [ ] Task dependencies
- [ ] Team collaboration
- [ ] Analytics dashboard

## Contributing

This project was built for the IBM Hackathon. Contributions and suggestions are welcome!

## License

Part of the LifePilot project - Your Daily Decision Assistant

## Credits

Built with:
- IBM-inspired Decision Intelligence
- Vanilla JavaScript
- iCalendar RFC 5545 standard
- Modern browser APIs

---

**Made with ❤️ for better daily planning**

For detailed documentation, see:
- [`QUICK_START.md`](QUICK_START.md)
- [`TASK_MANAGER_README.md`](TASK_MANAGER_README.md)
- [`SCHEDULER_README.md`](SCHEDULER_README.md)
