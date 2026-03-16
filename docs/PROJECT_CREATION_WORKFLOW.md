# Project Creation Workflow

Now I fully understand how it works. The `projects/[slug]/page.tsx` has **special logic specifically for `slug === 'taskmanager'`** — it converts the Markdown content through a custom `parseTaskmanagerContent()` renderer that produces the full doc-theme layout (sidebar, progress bar, screenshot components, callout boxes).

The content field just needs Markdown in a specific format. Here's exactly what to paste into the **Content** editor at `/admin/projects/new`:

---

**Form fields:**

| Field | Value |
|---|---|
| Title | `Standalone Taskmanager` |
| Slug | `taskmanager` ← must be exactly this |
| Technologies | `React Native, Expo, SQLite, Google Drive API` |
| Cover Image URL | `/taskmanager-new.png` |
| Excerpt | `A mobile task manager with calendar view, voice input, contact integration, financial tracking and Google Drive backup. Available in 4 languages.` |

**Content** (paste this into the Markdown editor):

```markdown
## Welcome Screen

### Overview

The **Welcome Screen** is the first thing you see when launching the application. It provides a quick introduction to the app's key features and capabilities.

![Welcome Screen](docs/images-user-manual/welcome.png)

### Features

- **Key Features Overview**: A scrolling list of cards highlighting what the app can do:
  - **Organize Your Tasks**: Create and manage tasks with priorities and deadlines.
  - **Contact Integration**: Link tasks to people in your address book.
  - **Voice Input**: Use speech-to-text for hands-free task creation.
  - **Calendar View**: Visualize your schedule.
  - **Multi-Language Support**: Available in English, Hungarian, French, and German.
  - **Google Drive Export**: Backup your completed tasks.

### Actions

- **Get Started**: Tap the large button at the bottom to dismiss the welcome screen and enter the main application.
- **Screen Capture**: A camera icon in the top-right corner allows you to take a screenshot of this view.

*Note: You can disable this screen in the Settings if you prefer to go straight to your tasks.*

## Create Task Screen

### Overview

The **Create Task Screen** allows you to add new tasks to your list, ensuring you never miss an important deadline or activity.

### Accessing the Screen

- Tap the **"+" Add new task** button located in the center of the bottom navigation bar from any main screen.

![Create Task Screen 1](docs/images-user-manual/create-1.png)

![Create Task Screen 2](docs/images-user-manual/create-2.png)

### Features & Fields

#### 1. Task Creation

- **Title**: Enter a concise name for your task. This is a required field.
  - *Tip*: Use the **microphone icon** next to the input to dictate the title using your voice.
- **Description** (optional): Add detailed information about the task.
  - *Voice Input*: Use the microphone button below the field to dictate long descriptions.
- **Comment** (optional): Add any initial comments or notes relevant to the task.

#### 2. Financials (optional)

- **Bill Amount**: Toggle the switch if this task involves a payment or expense.
  - Enter the amount in the field provided.
  - The currency is set to your default currency.
  - Tap the currency dropdown button (showing a symbol like $, €, Ft) to change the billing currency (USD, EUR, GBP, HUF).

#### 3. Priority

Select a priority level to categorize the urgency of the task:

- **Low** (Green)
- **Medium** (Blue — Default)
- **High** (Orange)
- **Urgent** (Red)

#### 4. Contacts (optional)

- **Link Contact**: Tap the **Search Button** to associate a person from your device's contacts with this task.
- **Remove Contact**: If a contact is selected, tap the **Remove** button to unlink them.

#### 5. Scheduling (optional)

- **Due Date**: Tap the calendar input to open the calendar and set a deadline.
- **Time**: Once a date is picked, a time field appears.
- **Reminders**: Enable the "Reminders" switch to set notifications (requires a Due Date). Select one or more options (e.g. "10 minutes before", "1 hour before", "1 day before").

### Actions

- **Save**: Tap the solid button at the bottom to save the task to your list.
- **Create & Mark Complete**: Tap the outlined button to create the task and immediately mark it as finished.

## Task List Screen

### Overview

The **Task List Screen** is the main hub of the application. It displays all your tasks, categorized by their status, and provides quick access to search and management tools.

### Accessing the Screen

- Tap the **"Tasks" (List)** icon on the left side of the bottom navigation bar.
- This is usually the default screen when you open the app.

![Task List Screen](docs/images-user-manual/tasks.png)

### Features

#### 1. Filtering Tasks

Use the chips (buttons) at the top of the list to filter tasks:

- **Pending**: Shows tasks that are active and not yet overdue.
- **Overdue**: Critical tasks that have passed their due date.
- **Completed**: A history of all your finished tasks.
- **All**: Displays every task, categorized and sorted by urgency.

#### 2. Search

- Tap the **Magnifying Glass** icon in the top right header to open the search bar.
- Type any part of a task's title or description to instantly filter the list.

#### 3. Task Cards

Each task is displayed as a card containing:

- **Status Icon**: A checkbox icon indicates if the task is complete (green) or pending (square).
- **Title & Description**: The main details of the task. Completed tasks appear crossed out.
- **Priority Label**: A colored tag showing the urgency (Low, Medium, High, Urgent).
- **Dates**: Creation date and Due date (overdue dates appear in red with an alert icon).

### Actions

#### Viewing Task Details

- **Tap any task card** to open its detailed view, where you can edit, complete, or delete it.

#### Exporting Tasks

*(Only available in the "Completed" filter)*

- Tap the **Cloud Upload** icon in the top right header.
- This generates a CSV file of your completed tasks and uploads it to your Google Drive.
- You will be asked to sign in to your Google account.

## Task Details Screen

### Overview

The **Task Details Screen** provides a comprehensive view of a specific task, showing all its associated information and allowing for management actions.

### Accessing the Screen

- Tap on any **Task Card** from the **Task List Screen** or **Calendar Screen**.

![Task Details Screen](docs/images-user-manual/details.png)

### Features

- **Header**: Contains the "Back" button, title, and buttons for **Screen Capture** and **Edit** (Pencil icon).
- **Task Information**: Displays the task's Title, Status, and Priority level.
- **Description & Notes**: Content of the description and any added comments.
- **Financial Details**: Bill amount and currency (if applicable).
- **Dates**: Created date, Due date, and Completed date.
- **Contact Card**: If a contact is linked, their details are shown here.

### Actions

- **Mark Complete**: Tap the green button to finish the task.
- **Edit Task**: Tap the "Edit Task" button (if pending) or the pencil icon to modify the task.
- **Delete Task**: Tap the red "Delete Task" button to permanently remove the item.

## Edit Task Screen

### Overview

The **Edit Task Screen** allows you to update or correct information for an existing task. It works similarly to the Create Task Screen but comes pre-filled with the task's current data.

### Accessing the Screen

- From the **Task Details Screen**, tap the **Pencil icon** in the top header or the **"Edit Task" button** at the bottom of the details view.

![Edit Task Screen 1](docs/images-user-manual/edit-1.png)

![Edit Task Screen 2](docs/images-user-manual/edit-2.png)

### Features

- **Pre-filled Fields**: All fields (Title, Description, Priority, Due Date, etc.) are populated with the existing data.
- **Status Indicator**: Shows the current status of the task (e.g., Pending).
- **Modifiable Fields**: Title & Description, Priority, Dates & Reminders, Financials, Contacts.

### Actions

- **Update Task**: Tap the solid button to save your changes.
- **Update & Mark Complete**: Tap the outlined button to save changes and immediately mark the task as finished.
- **Cancel**: Tap the "Cancel" text button to discard changes and return to the details view.

## Calendar Screen

### Overview

The **Calendar Screen** offers a visual overview of your schedule, allowing you to plan ahead and quickly identify busy days.

### Accessing the Screen

- Tap the **"Calendar"** icon on the bottom navigation bar.

![Calendar Screen](docs/images-user-manual/calendar.png)

### Features

#### 1. Monthly View

- Swipe left or right to switch between months.
- **Dots** under dates indicate scheduled tasks:
  - **Red Dot**: Indicates overdue tasks or high-priority items.
  - **Blue/Green Dot**: Indicates scheduled or completed tasks.

#### 2. Date Selection

- Tap any date on the calendar to select it. The selected date is highlighted.
- The list below the calendar updates to show tasks for that specific day.

#### 3. Daily Task List

Below the calendar, you will see the "Tasks Due" section:

- **Overdue Tasks**: Tasks from previous dates that are still pending.
- **Due Today**: Tasks specifically scheduled for the selected date.

*Note: Completed tasks are hidden from this view to help you focus on what needs to be done.*

### Actions

- **Open Task**: Tap any task card in the list to view or edit its details.

## Dashboard Screen

### Overview

The **Dashboard Screen** provides deep insights into your productivity and financial tracking over time.

### Accessing the Screen

- Tap the **"Dashboard" (Chart)** icon on the bottom navigation bar.

![Dashboard Screen](docs/images-user-manual/dashboard.png)

### Features

#### 1. Quick Stats & Alerts

- **Overdue Alert**: If you have missed deadlines, a red banner appears at the top.
- **Statistics Grid**:
  - **Total Tasks**: The all-time count of tasks you've created.
  - **Completed**: Number of finished tasks.
  - **Pending**: Number of active tasks remaining.
  - **Completion Rate**: Your efficiency score as a percentage.

#### 2. Financial Overview

- **Currency Selector**: Tap the button to switch views between currencies.
- **Total Billing**: Displays the total monthly amount for the selected currency.
- **Monthly Chart**: A bar graph showing your spending trends over recent months.
- **Category Breakdown**: A pie chart visualizing where your money is going.

#### 3. Priority Breakdown

- A list showing how your tasks are distributed across importance levels (Urgent, High, Medium, Low).
- Helps you understand if you are overloaded with urgent tasks.

#### 4. App Info

- Displays the current version of the app and storage method (Local Device).

## Settings Screen

### Overview

The **Settings Screen** allows you to customize the application to your preferences, manage data, and access developer tools.

### Accessing the Screen

- Tap the **"Settings" (Gear)** icon on the right side of the bottom navigation bar.

![Settings Screen](docs/images-user-manual/settings.png)

### Features

#### 1. Appearance

- **Theme**: Toggle between **Light Mode** and **Dark Mode**.

#### 2. Notifications & General

- **Show Welcome Screen**: Toggle this switch to enable or disable the introductory slideshow when the app starts.

#### 3. Language

- Use the language switcher to change the application's interface language (English, Hungarian, German, French).

#### 4. Developer & About

- **Preview Welcome Screen**: Replays the onboarding tutorial.
- **About**: Displays the app version (1.0.0), credits, and copyright information.
```

---

Tick **Publish Project** and save. The slug `taskmanager` triggers the special doc-theme renderer in the page component, so it will display exactly as before with the sidebar, progress bar, and screenshot components.
