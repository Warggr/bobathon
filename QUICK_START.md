# LifePilot Task Manager - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Open the App
```bash
# Start local server
python3 -m http.server 8000

# Open in browser
http://localhost:8000/lifepilot.html
```

### Step 2: Add Your Tasks
1. Scroll to "Task Manager & Schedule" section
2. Fill in the form:
   - **Task Name**: "Complete project report"
   - **Duration**: 120 (minutes)
   - **Deadline**: Select date (optional)
3. Click "Add Task"

### Step 3: Auto-Schedule
1. Click "🤖 Auto-Schedule Tasks" button
2. View your scheduled tasks in the timeline
3. Check for any unscheduled tasks

## 📋 Example Tasks

Try adding these sample tasks:

```
Task 1:
- Name: Write documentation
- Duration: 90 minutes
- Deadline: Tomorrow

Task 2:
- Name: Code review
- Duration: 60 minutes
- Deadline: Today

Task 3:
- Name: Team meeting prep
- Duration: 30 minutes
- Deadline: (no deadline)
```

## 📥 Import Your Calendar (Optional)

1. Export calendar from Google/Outlook as `.ics`
2. Click "📥 Import ICS File"
3. Select your file
4. Schedule tasks to avoid conflicts

## 🎯 Key Features

- ✅ **Add Tasks**: Name, duration, deadline
- ✅ **Auto-Schedule**: Smart time slot assignment
- ✅ **Persist Data**: Tasks saved in browser
- ✅ **Import Calendar**: Avoid scheduling conflicts
- ✅ **Visual Status**: See pending/scheduled/unscheduled
- ✅ **Delete Tasks**: Remove with × button

## 🔧 Keyboard Shortcuts

- `Tab` - Navigate form fields
- `Enter` - Submit task (when in form)
- `Esc` - Clear form (custom)

## 💡 Tips

1. **Set realistic durations** - Add 10-20% buffer time
2. **Use deadlines** - Helps prioritize scheduling
3. **Import calendar first** - Avoids conflicts
4. **Break large tasks** - Split into 60-90 min chunks
5. **Schedule daily** - Review and adjust each morning

## 🐛 Common Issues

### Tasks won't schedule?
- Extend deadline
- Reduce duration
- Check working hours (9 AM - 6 PM)

### Tasks disappear?
- Check localStorage is enabled
- Not in private/incognito mode

### Import fails?
- Verify ICS file format
- Try sample file: `data/sample-calendar.ics`

## 📚 Full Documentation

- **Task Manager Guide**: `TASK_MANAGER_README.md`
- **Scheduler Details**: `SCHEDULER_README.md`
- **Main README**: `README.md`

## 🎉 You're Ready!

Start adding tasks and let LifePilot organize your day!

---

**Questions?** Check the full documentation or test with sample data.