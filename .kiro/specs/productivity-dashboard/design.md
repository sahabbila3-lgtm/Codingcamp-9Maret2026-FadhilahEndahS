# Design Document: Productivity Dashboard

## Overview

The Productivity Dashboard is a single-page web application built with vanilla HTML, CSS, and JavaScript that provides an integrated productivity workspace. The application consists of four main functional areas: a time/greeting display, a Pomodoro-style focus timer, a persistent to-do list manager, and a quick links manager. All data is stored locally in the browser using the Web Storage API, ensuring privacy and offline functionality.

The architecture follows a modular component-based approach where each feature is encapsulated in its own JavaScript module with clear responsibilities. The application uses the browser's native APIs exclusively—no external frameworks or libraries are required.

### Key Design Principles

1. **Separation of Concerns**: Each feature is implemented as an independent module with a single responsibility
2. **Data Persistence**: All user data is automatically saved to localStorage with immediate consistency
3. **Progressive Enhancement**: Core functionality works without JavaScript, enhanced features require it
4. **Responsive Design**: CSS Grid and Flexbox provide fluid layouts across all screen sizes
5. **Performance**: Minimal DOM manipulation, efficient event delegation, and optimized update cycles

## Architecture

### System Architecture

The application follows a simple client-side MVC-inspired pattern:

```
┌─────────────────────────────────────────────────────────┐
│                     index.html                          │
│  (Structure + Initial DOM)                              │
└─────────────────────────────────────────────────────────┘
                          │
                          ├─────────────────────────────────┐
                          │                                 │
┌─────────────────────────▼─────┐           ┌──────────────▼──────────┐
│       styles.css               │           │      app.js             │
│  (Presentation Layer)          │           │  (Application Entry)    │
└────────────────────────────────┘           └──────────────┬──────────┘
                                                             │
                          ┌──────────────────────────────────┼──────────────────────────┐
                          │                                  │                          │
              ┌───────────▼──────────┐          ┌───────────▼──────────┐   ┌──────────▼─────────┐
              │  TimeGreeting.js     │          │  FocusTimer.js       │   │  TaskManager.js    │
              │  - Clock display     │          │  - 25min countdown   │   │  - CRUD operations │
              │  - Greeting logic    │          │  - Start/Stop/Reset  │   │  - Task rendering  │
              └──────────────────────┘          └──────────────────────┘   └──────────┬─────────┘
                                                                                       │
              ┌──────────────────────────────────────────────────────────────────────┘
              │
┌─────────────▼──────────┐                    ┌─────────────────────────┐
│  QuickLinks.js         │                    │  StorageManager.js      │
│  - Link management     │◄───────────────────│  - localStorage wrapper │
│  - Navigation          │                    │  - Data serialization   │
└────────────────────────┘                    └─────────────────────────┘
```

### Module Responsibilities

**app.js** (Main Controller)
- Initializes all feature modules on DOMContentLoaded
- Coordinates inter-module communication if needed
- Handles global error boundaries

**TimeGreeting.js**
- Manages real-time clock display (HH:MM:SS format)
- Displays current date in human-readable format
- Determines and displays time-appropriate greetings
- Updates display every second using setInterval

**FocusTimer.js**
- Implements 25-minute Pomodoro countdown timer
- Manages timer state (idle, running, paused, completed)
- Handles start, stop, and reset controls
- Updates display every second when active
- Manages button enable/disable states

**TaskManager.js**
- Handles task CRUD operations (Create, Read, Update, Delete)
- Renders task list to DOM
- Manages task completion status
- Validates task input (non-empty descriptions)
- Persists changes to localStorage via StorageManager

**QuickLinks.js**
- Manages quick link CRUD operations
- Renders clickable link buttons
- Validates link input (non-empty name and URL)
- Persists changes to localStorage via StorageManager

**StorageManager.js**
- Provides abstraction over localStorage API
- Handles JSON serialization/deserialization
- Manages storage keys consistently
- Provides error handling for storage quota issues

## Components and Interfaces

### Component: TimeGreeting

**Purpose**: Display current time, date, and contextual greeting

**DOM Structure**:
```html
<div id="time-greeting" class="time-greeting">
  <div class="time-display">
    <span id="current-time">00:00:00</span>
  </div>
  <div class="date-display">
    <span id="current-date">Monday, January 1, 2024</span>
  </div>
  <div class="greeting-display">
    <h1 id="greeting-message">Good Morning</h1>
  </div>
</div>
```

**Public Interface**:
```javascript
class TimeGreeting {
  constructor(timeElement, dateElement, greetingElement)
  init()                    // Start the clock update cycle
  destroy()                 // Clean up intervals
  updateDisplay()           // Update time, date, and greeting
  getGreeting(hour)         // Returns greeting based on hour (0-23)
}
```

**Greeting Logic**:
- 05:00 - 11:59: "Good Morning"
- 12:00 - 16:59: "Good Afternoon"
- 17:00 - 20:59: "Good Evening"
- 21:00 - 04:59: "Good Night"

### Component: FocusTimer

**Purpose**: Provide Pomodoro-style 25-minute countdown timer

**DOM Structure**:
```html
<div id="focus-timer" class="focus-timer">
  <h2>Focus Timer</h2>
  <div class="timer-display">
    <span id="timer-value">25:00</span>
  </div>
  <div class="timer-controls">
    <button id="timer-start" class="btn btn-primary">Start</button>
    <button id="timer-stop" class="btn btn-secondary" disabled>Stop</button>
    <button id="timer-reset" class="btn btn-secondary">Reset</button>
  </div>
  <div id="timer-status" class="timer-status"></div>
</div>
```

**Public Interface**:
```javascript
class FocusTimer {
  constructor(displayElement, startBtn, stopBtn, resetBtn, statusElement)
  init()                    // Initialize timer
  start()                   // Begin countdown
  stop()                    // Pause countdown
  reset()                   // Reset to 25 minutes
  tick()                    // Decrement by 1 second
  updateDisplay()           // Render MM:SS format
  updateButtonStates()      // Enable/disable controls based on state
  onComplete()              // Handle timer completion
}
```

**State Machine**:
- IDLE: Initial state, can start
- RUNNING: Counting down, can stop
- PAUSED: Stopped mid-countdown, can start or reset
- COMPLETED: Reached 00:00, can reset

### Component: TaskManager

**Purpose**: Manage to-do list with CRUD operations and persistence

**DOM Structure**:
```html
<div id="task-manager" class="task-manager">
  <h2>To-Do List</h2>
  <div class="task-input">
    <input type="text" id="task-input-field" placeholder="Enter a new task..." />
    <button id="task-add-btn" class="btn btn-primary">Add Task</button>
  </div>
  <ul id="task-list" class="task-list">
    <!-- Tasks rendered dynamically -->
  </ul>
</div>
```

**Task Item Structure**:
```html
<li class="task-item" data-task-id="uuid">
  <input type="checkbox" class="task-checkbox" />
  <span class="task-description">Task description</span>
  <div class="task-actions">
    <button class="task-edit-btn btn-icon">✏️</button>
    <button class="task-delete-btn btn-icon">🗑️</button>
  </div>
</li>
```

**Public Interface**:
```javascript
class TaskManager {
  constructor(inputElement, addButton, listElement, storage)
  init()                    // Load tasks from storage and render
  addTask(description)      // Create new task
  editTask(id, newDescription)  // Update task description
  toggleComplete(id)        // Toggle completion status
  deleteTask(id)            // Remove task
  renderTasks()             // Render all tasks to DOM
  validateInput(description) // Check non-empty
  saveTasks()               // Persist to storage
}
```

### Component: QuickLinks

**Purpose**: Manage customizable website shortcuts

**DOM Structure**:
```html
<div id="quick-links" class="quick-links">
  <h2>Quick Links</h2>
  <div class="link-input">
    <input type="text" id="link-name-input" placeholder="Link name..." />
    <input type="url" id="link-url-input" placeholder="https://..." />
    <button id="link-add-btn" class="btn btn-primary">Add Link</button>
  </div>
  <div id="links-container" class="links-container">
    <!-- Links rendered dynamically -->
  </div>
</div>
```

**Link Item Structure**:
```html
<div class="link-item" data-link-id="uuid">
  <a href="url" target="_blank" class="link-button">Link Name</a>
  <button class="link-delete-btn btn-icon">✕</button>
</div>
```

**Public Interface**:
```javascript
class QuickLinks {
  constructor(nameInput, urlInput, addButton, container, storage)
  init()                    // Load links from storage and render
  addLink(name, url)        // Create new quick link
  deleteLink(id)            // Remove quick link
  renderLinks()             // Render all links to DOM
  validateInput(name, url)  // Check non-empty
  saveLinks()               // Persist to storage
}
```

### Component: StorageManager

**Purpose**: Abstract localStorage operations with error handling

**Public Interface**:
```javascript
class StorageManager {
  static KEYS = {
    TASKS: 'productivity-dashboard-tasks',
    LINKS: 'productivity-dashboard-links'
  }
  
  static save(key, data)    // Serialize and save to localStorage
  static load(key)          // Load and deserialize from localStorage
  static remove(key)        // Remove item from localStorage
  static clear()            // Clear all app data
}
```

## Data Models

### Task Model

```javascript
{
  id: string,              // UUID v4 format
  description: string,     // Task description (non-empty)
  completed: boolean,      // Completion status
  createdAt: number,       // Unix timestamp (milliseconds)
  updatedAt: number        // Unix timestamp (milliseconds)
}
```

**Validation Rules**:
- `id`: Must be unique, generated using crypto.randomUUID() or fallback
- `description`: Must be non-empty after trimming whitespace
- `completed`: Boolean, defaults to false
- `createdAt`: Set on creation, immutable
- `updatedAt`: Updated on any modification

**Storage Format**:
```javascript
// localStorage key: 'productivity-dashboard-tasks'
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "description": "Complete project documentation",
    "completed": false,
    "createdAt": 1704067200000,
    "updatedAt": 1704067200000
  }
]
```

### Quick Link Model

```javascript
{
  id: string,              // UUID v4 format
  name: string,            // Display name (non-empty)
  url: string,             // Valid URL (non-empty)
  createdAt: number        // Unix timestamp (milliseconds)
}
```

**Validation Rules**:
- `id`: Must be unique, generated using crypto.randomUUID() or fallback
- `name`: Must be non-empty after trimming whitespace
- `url`: Must be non-empty after trimming whitespace
- `createdAt`: Set on creation, immutable

**Storage Format**:
```javascript
// localStorage key: 'productivity-dashboard-links'
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "GitHub",
    "url": "https://github.com",
    "createdAt": 1704067200000
  }
]
```

### Timer State Model

```javascript
{
  state: 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED',
  remainingSeconds: number,  // 0 to 1500 (25 minutes)
  intervalId: number | null  // setInterval reference
}
```

**Note**: Timer state is NOT persisted to localStorage. Each page load starts with a fresh 25-minute timer in IDLE state.


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Time Format Validation

*For any* valid Date object, the time formatting function should produce a string matching the HH:MM:SS pattern where HH is 00-23, MM is 00-59, and SS is 00-59.

**Validates: Requirements 1.1**

### Property 2: Date Format Validation

*For any* valid Date object, the date formatting function should produce a human-readable string containing the day name, month name, day number, and year.

**Validates: Requirements 1.2**

### Property 3: Greeting Correctness

*For any* hour value (0-23), the greeting function should return "Good Morning" for hours 5-11, "Good Afternoon" for hours 12-16, "Good Evening" for hours 17-20, and "Good Night" for hours 21-4.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

### Property 4: Timer Start Behavior

*For any* timer in IDLE or PAUSED state, calling start() should transition the timer to RUNNING state and begin decrementing the remaining seconds.

**Validates: Requirements 3.2**

### Property 5: Timer Stop Behavior

*For any* timer in RUNNING state, calling stop() should transition the timer to PAUSED state and preserve the current remaining seconds without further decrement.

**Validates: Requirements 3.4**

### Property 6: Timer Reset Behavior

*For any* timer state (IDLE, RUNNING, PAUSED, or COMPLETED), calling reset() should return the timer to IDLE state with 1500 seconds (25 minutes) remaining.

**Validates: Requirements 3.5**

### Property 7: Timer Completion Behavior

*For any* timer in RUNNING state, when remaining seconds reaches 0, the timer should transition to COMPLETED state and stop decrementing.

**Validates: Requirements 3.6**

### Property 8: Timer Button States

*For any* timer state, the start button should be disabled when state is RUNNING, and the stop button should be disabled when state is not RUNNING.

**Validates: Requirements 3.7, 3.8**


### Property 9: Task Creation

*For any* valid (non-empty, non-whitespace) task description, adding the task should result in a new task appearing in the task list with that exact description and completed status set to false.

**Validates: Requirements 4.1**

### Property 10: Task Order Preservation

*For any* sequence of task additions, the rendered task list should display tasks in the same order they were created (chronological order by createdAt timestamp).

**Validates: Requirements 4.2**

### Property 11: Task Edit

*For any* existing task and any valid new description, editing the task should update its description to the new value while preserving its id, completed status, and createdAt timestamp.

**Validates: Requirements 4.3**

### Property 12: Task Completion Toggle

*For any* existing task, toggling its completion status should flip the completed boolean value (false to true, or true to false) while preserving all other task properties.

**Validates: Requirements 4.4**

### Property 13: Task Deletion

*For any* existing task, deleting the task should remove it from the task list such that the list length decreases by one and the task id no longer appears in the list.

**Validates: Requirements 4.5**

### Property 14: Task Visual Distinction

*For any* task, the rendered HTML should include a visual indicator (CSS class or attribute) that differs between completed and incomplete tasks.

**Validates: Requirements 4.6**

### Property 15: Task Input Validation

*For any* string composed entirely of whitespace characters (spaces, tabs, newlines) or empty string, attempting to add it as a task should be rejected and the task list should remain unchanged.

**Validates: Requirements 4.7**

### Property 16: Task Persistence Round-Trip

*For any* sequence of task operations (add, edit, toggle, delete), after performing the operations and saving to storage, loading from storage should produce a task list that matches the expected final state.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**


### Property 17: Quick Link Creation

*For any* valid (non-empty, non-whitespace) link name and URL, adding the link should result in a new quick link appearing in the links list with that exact name and URL.

**Validates: Requirements 6.1**

### Property 18: Quick Link Rendering

*For any* quick link in the links list, the rendered HTML should include a clickable anchor element with href attribute set to the link's URL and target="_blank" attribute.

**Validates: Requirements 6.2, 6.3**

### Property 19: Quick Link Deletion

*For any* existing quick link, deleting the link should remove it from the links list such that the list length decreases by one and the link id no longer appears in the list.

**Validates: Requirements 6.4**

### Property 20: Quick Link Input Validation

*For any* link name or URL that is an empty string or composed entirely of whitespace characters, attempting to add the link should be rejected and the links list should remain unchanged.

**Validates: Requirements 6.5**

### Property 21: Quick Link Persistence Round-Trip

*For any* sequence of link operations (add, delete), after performing the operations and saving to storage, loading from storage should produce a links list that matches the expected final state.

**Validates: Requirements 7.1, 7.2, 7.3**

## Error Handling

### Storage Errors

**Quota Exceeded**: When localStorage quota is exceeded during save operations:
- Catch the QuotaExceededError exception
- Display user-friendly error message: "Storage limit reached. Please delete some items."
- Prevent the operation from completing
- Log error to console for debugging

**Storage Unavailable**: When localStorage is disabled or unavailable:
- Detect using try-catch around localStorage access
- Display warning message: "Local storage is disabled. Your data will not be saved."
- Allow application to function with in-memory storage only
- Gracefully degrade to session-only functionality

### Input Validation Errors

**Empty Task Description**: When user attempts to add empty or whitespace-only task:
- Prevent task creation
- Display inline validation message: "Task description cannot be empty"
- Keep focus on input field
- Clear error message when user starts typing

**Empty Link Fields**: When user attempts to add link with empty name or URL:
- Prevent link creation
- Display inline validation message: "Both name and URL are required"
- Highlight invalid fields with red border
- Clear error when user corrects input


### Timer Errors

**Invalid State Transitions**: When attempting invalid timer operations:
- Silently ignore start() when already running
- Silently ignore stop() when not running
- Always allow reset() from any state
- Log warnings to console for debugging

### DOM Errors

**Missing Elements**: When required DOM elements are not found during initialization:
- Throw descriptive error: "Required element #element-id not found"
- Halt initialization of affected component
- Log error with stack trace to console
- Display error message in UI if possible

**Event Handler Errors**: When errors occur in event handlers:
- Catch all errors in event listeners
- Log error details to console
- Display user-friendly error message
- Prevent error from breaking other functionality

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests** focus on:
- Specific examples that demonstrate correct behavior
- Edge cases (empty storage, boundary times like 04:59 and 05:00)
- Error conditions (invalid input, storage failures)
- Integration between components
- DOM manipulation and rendering

**Property-Based Tests** focus on:
- Universal properties that hold for all inputs
- Comprehensive input coverage through randomization
- Invariants that must be maintained across operations
- Round-trip properties (serialize/deserialize, save/load)

### Property-Based Testing Configuration

**Framework**: Use fast-check library for JavaScript property-based testing

**Test Configuration**:
- Minimum 100 iterations per property test
- Each property test references its design document property
- Tag format: `// Feature: productivity-dashboard, Property {number}: {property_text}`

**Example Property Test Structure**:
```javascript
// Feature: productivity-dashboard, Property 3: Greeting Correctness
fc.assert(
  fc.property(
    fc.integer({ min: 0, max: 23 }), // Generate random hour
    (hour) => {
      const greeting = getGreeting(hour);
      if (hour >= 5 && hour <= 11) return greeting === "Good Morning";
      if (hour >= 12 && hour <= 16) return greeting === "Good Afternoon";
      if (hour >= 17 && hour <= 20) return greeting === "Good Evening";
      return greeting === "Good Night";
    }
  ),
  { numRuns: 100 }
);
```

### Unit Testing Focus Areas

**Time and Greeting Component**:
- Test time formatting with specific dates
- Test date formatting with specific dates
- Test greeting transitions at boundary hours (04:59→05:00, 11:59→12:00, etc.)
- Test initialization and cleanup of intervals

**Focus Timer Component**:
- Test initial state (25 minutes, IDLE)
- Test complete countdown sequence
- Test pause and resume functionality
- Test reset from various states
- Test completion notification
- Test button state management

**Task Manager Component**:
- Test adding first task to empty list
- Test editing task with special characters
- Test deleting last remaining task
- Test loading from empty storage
- Test loading from corrupted storage data
- Test task rendering with completed/incomplete states

**Quick Links Component**:
- Test adding first link to empty list
- Test URL validation and sanitization
- Test deleting last remaining link
- Test loading from empty storage
- Test link rendering with target="_blank"

**Storage Manager Component**:
- Test save and load with valid data
- Test handling of quota exceeded error
- Test handling of disabled localStorage
- Test JSON serialization edge cases
- Test clearing all data

### Test File Organization

```
tests/
├── unit/
│   ├── TimeGreeting.test.js
│   ├── FocusTimer.test.js
│   ├── TaskManager.test.js
│   ├── QuickLinks.test.js
│   └── StorageManager.test.js
└── property/
    ├── TimeGreeting.property.test.js
    ├── FocusTimer.property.test.js
    ├── TaskManager.property.test.js
    ├── QuickLinks.property.test.js
    └── Storage.property.test.js
```

### Testing Tools

- **Test Runner**: Jest or Vitest (for vanilla JS compatibility)
- **Property Testing**: fast-check library
- **DOM Testing**: jsdom for simulating browser environment
- **Coverage Target**: Minimum 80% code coverage, 100% property coverage

