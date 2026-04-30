# Google Calendar & Tasks API Integration

This module provides a client-side JavaScript implementation for connecting to Google Calendar and Google Tasks APIs to retrieve calendar events and tasks.

## Features

- 🔐 **Authentication**: OAuth 2.0 authentication using Google Identity Services
- 📅 **Calendar Events**: Fetch events from one or multiple calendars
- ✅ **Tasks**: Retrieve tasks from Google Tasks
- 🔄 **Auto-formatting**: Converts Google API data to a format compatible with CalendarScheduler
- 📊 **Multiple Calendars**: Support for selecting and viewing multiple calendars
- ⏱️ **Duration Estimation**: Smart estimation of task durations

## Files

- **`google-calendar-client.js`**: Core client library for Google Calendar and Tasks APIs
- **`google-calendar-example.html`**: Example HTML page demonstrating usage
- **`GOOGLE_CALENDAR_README.md`**: This documentation file

## Prerequisites

1. **Google Cloud Project**
   - You need a project in Google Cloud Console
   - Required APIs enabled:
     - Google Calendar API
     - Google Tasks API
   - OAuth 2.0 credentials configured

2. **Environment Setup**
   - Your Google Cloud credentials should be stored in `.env` file
   - Required credentials:
     - `GOOGLE_CLIENT_ID`: Your OAuth 2.0 client ID
     - `GOOGLE_API_KEY`: Your API key

## Google Cloud Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **Select a project** > **New Project**
3. Enter a project name (e.g., "LifePilot Calendar")
4. Click **Create**

### Step 2: Enable Required APIs

1. In your project, go to **APIs & Services** > **Library**
2. Search for and enable:
   - **Google Calendar API**
   - **Google Tasks API**

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - User Type: External (or Internal for workspace)
   - App name: Your application name
   - User support email: Your email
   - Developer contact: Your email
   - Scopes: Add the following scopes:
     - `https://www.googleapis.com/auth/calendar.readonly`
     - `https://www.googleapis.com/auth/tasks.readonly`
4. Back in Credentials, create OAuth client ID:
   - Application type: **Web application**
   - Name: Your app name
   - Authorized JavaScript origins:
     - `http://localhost:8080` (for development)
     - Your production domain (e.g., `https://yourdomain.com`)
   - Authorized redirect URIs:
     - `http://localhost:8080` (for development)
     - Your production domain
5. Click **Create**
6. Copy the **Client ID** that appears

### Step 4: Create an API Key

1. In **Credentials**, click **Create Credentials** > **API key**
2. Copy the API key
3. (Optional) Click **Restrict Key** to limit usage:
   - API restrictions: Select Google Calendar API and Google Tasks API
   - Application restrictions: HTTP referrers (for web apps)

### Step 5: Configure Your Application

Add your credentials to `.env`:
```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_API_KEY=your-api-key
```

## Usage

### Basic Setup

1. **Include Google API libraries** (in your HTML):
   ```html
   <script src="https://apis.google.com/js/api.js"></script>
   <script src="https://accounts.google.com/gsi/client"></script>
   ```

2. **Include the Google Calendar Client**:
   ```html
   <script src="google-calendar-client.js"></script>
   ```

3. **Initialize the client**:
   ```javascript
   const config = {
       clientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
       apiKey: 'YOUR_API_KEY'
   };

   const googleClient = new GoogleCalendarClient(config);
   await googleClient.initialize();
   ```

### Authentication

```javascript
// Sign in
await googleClient.signIn();

// Check if signed in
if (googleClient.getIsSignedIn()) {
    console.log('User is signed in');
}

// Get user profile
const profile = await googleClient.getUserProfile();
console.log(profile.name, profile.email);

// Sign out
googleClient.signOut();
```

### Fetching Calendar Events

```javascript
// Get events from primary calendar for the next 7 days
const events = await googleClient.getCalendarEvents();

// Get events for a custom date range
const startDate = new Date();
const events = await googleClient.getCalendarEvents(startDate, 14); // 14 days

// Event format:
// {
//   id: string,
//   summary: string,
//   description: string,
//   start: Date,
//   end: Date,
//   location: string,
//   isAllDay: boolean,
//   status: string,
//   source: 'google-calendar'
// }
```

### Fetching from Multiple Calendars

```javascript
// Get list of all calendars
const calendars = await googleClient.getCalendars();
console.log(calendars); // Array of calendar objects

// Get events from specific calendars
const calendarIds = ['primary', 'calendar-id-1', 'calendar-id-2'];
const events = await googleClient.getEventsFromMultipleCalendars(
    calendarIds,
    new Date(),
    7
);
```

### Fetching Tasks

```javascript
// Get all task lists
const taskLists = await googleClient.getTaskLists();

// Get tasks from a specific list
const tasks = await googleClient.getTasksFromList(taskListId);

// Get all tasks for the next 7 days
const tasks = await googleClient.getAllTasks();

// Get tasks for a custom date range
const startDate = new Date();
const tasks = await googleClient.getAllTasks(startDate, 14); // 14 days

// Task format:
// {
//   id: string,
//   name: string,
//   description: string,
//   priority: number (default: 5),
//   status: string,
//   listName: string,
//   deadline: Date (optional),
//   time: number (estimated duration in minutes),
//   source: 'google-tasks'
// }
```

### Fetching Both Calendar and Tasks

```javascript
// Get both calendar events and tasks in one call
const data = await googleClient.getCalendarAndTasks();

console.log(data.events);    // Array of calendar events
console.log(data.tasks);     // Array of tasks
console.log(data.startDate); // Start date of the range
console.log(data.endDate);   // End date of the range
```

### Integration with CalendarScheduler

The data format is compatible with the existing `CalendarScheduler` class:

```javascript
// Fetch data from Google Calendar
const data = await googleClient.getCalendarAndTasks();

// Use with CalendarScheduler
const scheduler = new CalendarScheduler();
const result = scheduler.scheduleTasksPriority(
    data.tasks,
    data.events,
    new Date(),
    7
);

console.log(result.scheduled);   // Successfully scheduled tasks
console.log(result.unscheduled); // Tasks that couldn't be scheduled
```

## API Reference

### GoogleCalendarClient Class

#### Constructor
```javascript
new GoogleCalendarClient(config)
```
- `config.clientId` (required): Google OAuth 2.0 client ID
- `config.apiKey` (required): Google API key

#### Methods

##### `initialize()`
Initialize the Google API client.
```javascript
await googleClient.initialize();
```

##### `signIn()`
Sign in the user with Google OAuth.
```javascript
await googleClient.signIn();
```

##### `signOut()`
Sign out the current user.
```javascript
googleClient.signOut();
```

##### `getIsSignedIn()`
Check if a user is currently signed in.
```javascript
if (googleClient.getIsSignedIn()) {
    // User is signed in
}
```

##### `getUserProfile()`
Get the current user's profile information.
```javascript
const profile = await googleClient.getUserProfile();
// Returns: { name, email, picture, ... }
```

##### `getCalendarEvents(startDate, days)`
Get calendar events from the primary calendar.
```javascript
const events = await googleClient.getCalendarEvents(new Date(), 7);
```

##### `getCalendars()`
Get list of all user's calendars.
```javascript
const calendars = await googleClient.getCalendars();
```

##### `getEventsFromMultipleCalendars(calendarIds, startDate, days)`
Get events from multiple calendars.
```javascript
const events = await googleClient.getEventsFromMultipleCalendars(
    ['primary', 'work-calendar-id'],
    new Date(),
    7
);
```

##### `getTaskLists()`
Get all task lists.
```javascript
const lists = await googleClient.getTaskLists();
```

##### `getTasksFromList(taskListId)`
Get tasks from a specific list.
```javascript
const tasks = await googleClient.getTasksFromList('list-id');
```

##### `getAllTasks(startDate, days)`
Get all tasks from all lists.
```javascript
const tasks = await googleClient.getAllTasks(new Date(), 7);
```

##### `getCalendarAndTasks(startDate, days)`
Get both calendar events and tasks.
```javascript
const data = await googleClient.getCalendarAndTasks(new Date(), 7);
```

## Task Duration Estimation

The client includes smart duration estimation for tasks:

1. **Pattern Detection**: Looks for time indicators in task title/notes
   - "2 hours" → 120 minutes
   - "30 min" → 30 minutes
   - "1 hr" → 60 minutes

2. **Complexity-Based Defaults**:
   - Tasks with long descriptions (>100 chars): 60 minutes
   - Tasks with descriptions: 30 minutes
   - Subtasks: 15 minutes
   - Default: 30 minutes

You can customize this by modifying the `estimateTaskDuration()` method.

## Security Considerations

1. **API Key**: While the API key is not highly sensitive, it should be restricted
2. **Client ID**: The client ID is public but should be managed carefully
3. **Token Storage**: Access tokens are managed by the Google Identity Services library
4. **HTTPS**: Always use HTTPS in production
5. **Authorized Origins**: Ensure your domain is added to authorized JavaScript origins
6. **Scopes**: Only request the minimum required scopes (readonly in this case)

## Differences from Microsoft Graph

| Feature | Google Calendar | Microsoft Graph |
|---------|----------------|-----------------|
| Authentication | Google Identity Services | MSAL.js |
| Calendar API | Google Calendar API | Microsoft Graph Calendar |
| Tasks API | Google Tasks API | Microsoft To Do |
| Priority Support | No (default: 5) | Yes (high/normal/low) |
| Multiple Calendars | Yes (built-in) | Single calendar by default |
| Subtasks | Yes | No |

## Troubleshooting

### Common Issues

1. **"idpiframe_initialization_failed"**
   - Solution: Ensure cookies are enabled and you're not in incognito mode
   - Check that your domain is in authorized JavaScript origins

2. **"popup_closed_by_user"**
   - Solution: User closed the popup before completing sign-in
   - Ensure popups are not blocked

3. **"access_denied"**
   - Solution: User denied permission or scopes are incorrect
   - Check that required APIs are enabled in Google Cloud Console

4. **"invalid_client"**
   - Solution: Check that your client ID is correct
   - Verify the client ID matches your Google Cloud project

5. **CORS errors**
   - Solution: Ensure your domain is added to authorized JavaScript origins
   - For localhost, use `http://localhost:8080` (with port)

### Debug Mode

Enable console logging to debug issues:
```javascript
// The Google API client logs to console by default
// Check browser console for detailed error messages
```

## Example Application

See `google-calendar-example.html` for a complete working example that demonstrates:
- User authentication
- Fetching calendar events from multiple calendars
- Calendar selection interface
- Fetching tasks from all task lists
- Displaying data in a user-friendly interface
- Error handling

To run the example:
1. Update the `clientId` and `apiKey` in the HTML file
2. Serve the file from a web server (required for OAuth)
   ```bash
   # Using Python
   python -m http.server 8080
   
   # Using Node.js
   npx http-server -p 8080
   ```
3. Open `http://localhost:8080/google-calendar-example.html`
4. Click "Sign In with Google"
5. Grant the requested permissions
6. View your calendar events and tasks

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (requires HTTPS in production)
- IE11: ❌ Not supported

## Rate Limits

Google Calendar API has the following default quotas:
- **Queries per day**: 1,000,000
- **Queries per 100 seconds per user**: 1,000

Google Tasks API has similar quotas. For most personal use cases, these limits are more than sufficient.

## License

This code is provided as-is for use with the LifePilot project.

## Support

For issues related to:
- **Google Calendar API**: See [Google Calendar API documentation](https://developers.google.com/calendar)
- **Google Tasks API**: See [Google Tasks API documentation](https://developers.google.com/tasks)
- **Google Identity Services**: See [Google Identity documentation](https://developers.google.com/identity)
- **Google Cloud Console**: See [Google Cloud documentation](https://cloud.google.com/docs)