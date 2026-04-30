# Microsoft Graph API Integration

This module provides a client-side JavaScript implementation for connecting to the Microsoft Graph API to retrieve calendar events and tasks from Microsoft 365.

## Features

- 🔐 **Authentication**: Secure OAuth 2.0 authentication using MSAL.js
- 📅 **Calendar Events**: Fetch calendar events for the next week (or custom date range)
- ✅ **Tasks**: Retrieve tasks from Microsoft To Do
- 🔄 **Auto-formatting**: Converts Graph API data to a format compatible with CalendarScheduler
- 🎯 **Priority Mapping**: Automatically maps task importance to priority levels
- ⏱️ **Duration Estimation**: Smart estimation of task durations

## Files

- **`microsoft-graph-client.js`**: Core client library for Microsoft Graph API
- **`microsoft-graph-example.html`**: Example HTML page demonstrating usage
- **`MICROSOFT_GRAPH_README.md`**: This documentation file

## Prerequisites

1. **Azure Application Registration**
   - You need a registered application in Azure Active Directory
   - Required API permissions:
     - `User.Read`
     - `Tasks.Read`
     - `Calendars.Read`

2. **Environment Setup**
   - Your Azure application credentials should be stored in `.env` file
   - Required credentials:
     - `CLIENT_ID`: Your Azure application client ID
     - `TENANT_ID` (optional): Your Azure tenant ID (defaults to 'common')

## Azure Application Setup

### Step 1: Register an Application

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in the details:
   - **Name**: Your application name (e.g., "LifePilot Calendar")
   - **Supported account types**: Choose based on your needs
     - Single tenant: Only your organization
     - Multi-tenant: Any organization
     - Personal accounts: Include personal Microsoft accounts
   - **Redirect URI**: 
     - Platform: Single-page application (SPA)
     - URI: `http://localhost:8080` (or your domain)

### Step 2: Configure API Permissions

1. In your app registration, go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph** > **Delegated permissions**
4. Add these permissions:
   - `User.Read`
   - `Tasks.Read`
   - `Calendars.Read`
5. Click **Grant admin consent** (if you have admin rights)

### Step 3: Get Your Client ID

1. Go to **Overview** in your app registration
2. Copy the **Application (client) ID**
3. Add it to your `.env` file:
   ```
   CLIENT_ID=your-client-id-here
   TENANT_ID=common
   ```

## Usage

### Basic Setup

1. **Include MSAL.js library** (in your HTML):
   ```html
   <script src="https://alcdn.msauth.net/browser/2.38.1/js/msal-browser.min.js"></script>
   ```

2. **Include the Microsoft Graph Client**:
   ```html
   <script src="microsoft-graph-client.js"></script>
   ```

3. **Initialize the client**:
   ```javascript
   const config = {
       clientId: 'YOUR_CLIENT_ID',
       authority: 'https://login.microsoftonline.com/common',
       redirectUri: window.location.origin
   };

   const graphClient = new MicrosoftGraphClient(config);
   await graphClient.initialize();
   ```

### Authentication

```javascript
// Sign in
await graphClient.signIn();

// Check if signed in
if (graphClient.isSignedIn()) {
    console.log('User is signed in');
}

// Get account info
const account = graphClient.getAccount();
console.log(account.username);

// Sign out
await graphClient.signOut();
```

### Fetching Calendar Events

```javascript
// Get events for the next 7 days
const events = await graphClient.getCalendarEvents();

// Get events for a custom date range
const startDate = new Date();
const events = await graphClient.getCalendarEvents(startDate, 14); // 14 days

// Event format:
// {
//   id: string,
//   summary: string,
//   description: string,
//   start: Date,
//   end: Date,
//   location: string,
//   isAllDay: boolean,
//   showAs: string,
//   source: 'microsoft-calendar'
// }
```

### Fetching Tasks

```javascript
// Get all tasks for the next 7 days
const tasks = await graphClient.getAllTasks();

// Get tasks for a custom date range
const startDate = new Date();
const tasks = await graphClient.getAllTasks(startDate, 14); // 14 days

// Task format:
// {
//   id: string,
//   name: string,
//   description: string,
//   priority: number (1-10),
//   status: string,
//   listName: string,
//   deadline: Date (optional),
//   time: number (estimated duration in minutes),
//   source: 'microsoft-todo'
// }
```

### Fetching Both Calendar and Tasks

```javascript
// Get both calendar events and tasks in one call
const data = await graphClient.getCalendarAndTasks();

console.log(data.events);    // Array of calendar events
console.log(data.tasks);     // Array of tasks
console.log(data.startDate); // Start date of the range
console.log(data.endDate);   // End date of the range
```

### Integration with CalendarScheduler

The data format is compatible with the existing `CalendarScheduler` class:

```javascript
// Fetch data from Microsoft Graph
const data = await graphClient.getCalendarAndTasks();

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

### MicrosoftGraphClient Class

#### Constructor
```javascript
new MicrosoftGraphClient(config)
```
- `config.clientId` (required): Azure application client ID
- `config.authority` (optional): Azure authority URL (default: 'https://login.microsoftonline.com/common')
- `config.redirectUri` (optional): Redirect URI (default: window.location.origin)

#### Methods

##### `initialize()`
Initialize the client and handle redirect response.
```javascript
const account = await graphClient.initialize();
```

##### `signIn()`
Sign in the user with a popup window.
```javascript
const account = await graphClient.signIn();
```

##### `signOut()`
Sign out the current user.
```javascript
await graphClient.signOut();
```

##### `getUserProfile()`
Get the current user's profile information.
```javascript
const profile = await graphClient.getUserProfile();
// Returns: { displayName, mail, userPrincipalName, ... }
```

##### `getCalendarEvents(startDate, days)`
Get calendar events for a date range.
```javascript
const events = await graphClient.getCalendarEvents(new Date(), 7);
```

##### `getAllTasks(startDate, days)`
Get all tasks from all lists.
```javascript
const tasks = await graphClient.getAllTasks(new Date(), 7);
```

##### `getCalendarAndTasks(startDate, days)`
Get both calendar events and tasks.
```javascript
const data = await graphClient.getCalendarAndTasks(new Date(), 7);
```

##### `isSignedIn()`
Check if a user is currently signed in.
```javascript
if (graphClient.isSignedIn()) {
    // User is signed in
}
```

##### `getAccount()`
Get the current account information.
```javascript
const account = graphClient.getAccount();
```

## Task Duration Estimation

The client includes smart duration estimation for tasks:

1. **Pattern Detection**: Looks for time indicators in task title/description
   - "2 hours" → 120 minutes
   - "30 min" → 30 minutes
   - "1 hr" → 60 minutes

2. **Priority-Based Defaults**:
   - High priority: 60 minutes
   - Normal priority: 30 minutes
   - Low priority: 15 minutes

You can customize this by modifying the `estimateTaskDuration()` method.

## Security Considerations

1. **Client ID**: While the client ID is not a secret, it should be managed carefully
2. **Token Storage**: Tokens are stored in session storage by default
3. **HTTPS**: Always use HTTPS in production
4. **Redirect URI**: Ensure your redirect URI is registered in Azure
5. **Permissions**: Only request the minimum required permissions

## Troubleshooting

### Common Issues

1. **"AADSTS50011: The redirect URI specified in the request does not match"**
   - Solution: Ensure the redirect URI in your code matches the one registered in Azure

2. **"Consent required"**
   - Solution: User needs to consent to the requested permissions
   - Admin consent may be required for some permissions

3. **"Invalid client"**
   - Solution: Check that your client ID is correct

4. **CORS errors**
   - Solution: Ensure you're using the correct redirect URI type (SPA)

### Debug Mode

Enable console logging to debug issues:
```javascript
// Check MSAL logs
const msalConfig = {
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                console.log(message);
            },
            logLevel: msal.LogLevel.Verbose
        }
    }
};
```

## Example Application

See `microsoft-graph-example.html` for a complete working example that demonstrates:
- User authentication
- Fetching calendar events
- Fetching tasks
- Displaying data in a user-friendly interface
- Error handling

To run the example:
1. Update the `clientId` in the HTML file
2. Open the file in a web browser
3. Click "Sign In with Microsoft"
4. Grant the requested permissions
5. View your calendar events and tasks

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (requires HTTPS)
- IE11: ❌ Not supported (use MSAL.js v1 for IE11)

## License

This code is provided as-is for use with the LifePilot project.

## Support

For issues related to:
- **Microsoft Graph API**: See [Microsoft Graph documentation](https://docs.microsoft.com/graph/)
- **MSAL.js**: See [MSAL.js documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- **Azure AD**: See [Azure AD documentation](https://docs.microsoft.com/azure/active-directory/)