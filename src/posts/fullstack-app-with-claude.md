---
title: "Building a Full-Stack App with Claude: From Idea to Deploy"
description: "A step-by-step tutorial on building a full-stack task manager with React, Express, and SQLite using Claude as your AI pair programmer. Includes real prompts and lessons learned."
pubDate: 2026-02-28
author: "Kanr"
tags: ["ai", "tutorial", "full-stack", "claude", "react", "node"]
---

Most AI coding demos show simple, isolated tasks — write a function, fix a bug, generate a component. That is useful, but it sidesteps the harder question: can an AI pair programmer hold up across a real build session, from empty directory to deployed app?

I decided to find out. I sat down with Claude and built a full-stack task manager from scratch: React frontend, Express API, SQLite database. The entire session — planning, building, debugging, deploying — took about three hours. Here is how it went, with the actual prompts I used so you can try it yourself.

## What We're Building

A simple task manager. Nothing fancy — just a clean app where you can create, complete, and delete tasks, organized by category. The stack:

- **Frontend:** React with Vite
- **Backend:** Node.js with Express
- **Database:** SQLite via better-sqlite3
- **Deploy:** Railway

This is a good test case for AI-assisted development because it touches every layer of a typical web app: data modeling, REST API design, state management, UI components, and deployment configuration. If Claude can handle this end-to-end, it can handle most CRUD apps.

## Phase 1 — Planning the Architecture

Before writing any code, I asked Claude to help define the architecture. This is where AI pair programming shines — you can think out loud and get structured feedback fast.

> **Prompt:** I want to build a simple task manager app. React frontend with Vite, Express backend, SQLite database. The app should support creating tasks with a title, optional description, category, and due date. Users can mark tasks complete and delete them. Tasks should be filterable by category and completion status. Help me define the data model and API endpoints.

Claude came back with a clean proposal:

**Data model:**

```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES categories(id),
  due_date TEXT,
  completed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

**API endpoints:**

```
GET    /api/tasks          — list tasks (query params: category, completed)
POST   /api/tasks          — create task
PATCH  /api/tasks/:id      — update task (toggle complete, edit fields)
DELETE /api/tasks/:id      — delete task
GET    /api/categories     — list categories
POST   /api/categories     — create category
```

I made one adjustment: I asked Claude to add an `ON DELETE SET NULL` to the category foreign key so deleting a category doesn't cascade-delete tasks. Small thing, but this is exactly the kind of refinement that makes AI pair programming work — you steer, the AI iterates.

## Phase 2 — Building the Backend

With the plan locked in, I started building the Express API. I scaffolded the project manually (`npm init`, installed dependencies), then handed the implementation to Claude.

> **Prompt:** Set up an Express server in `server/index.js`. It should initialize a SQLite database using better-sqlite3, create the tables if they don't exist, and expose the API endpoints we defined. Use a `db.js` module for database initialization and queries. Add proper error handling and input validation.

Claude generated the database module and server file. The first version was solid but had a few things I wanted to change. This is typical — the first pass gets you 80% there, and then you iterate.

> **Prompt:** The task creation endpoint should return the full task object including the category name, not just the ID. Also, add a `sortBy` query parameter to GET /api/tasks that supports sorting by `due_date`, `created_at`, or `title`.

Here is what the refined task query function looked like:

```javascript
function getTasks({ category, completed, sortBy = 'created_at' }) {
  const validSortFields = ['due_date', 'created_at', 'title'];
  const sort = validSortFields.includes(sortBy) ? sortBy : 'created_at';

  let query = `
    SELECT tasks.*, categories.name as category_name
    FROM tasks
    LEFT JOIN categories ON tasks.category_id = categories.id
    WHERE 1=1
  `;
  const params = [];

  if (category) {
    query += ` AND categories.name = ?`;
    params.push(category);
  }
  if (completed !== undefined) {
    query += ` AND tasks.completed = ?`;
    params.push(completed ? 1 : 0);
  }

  query += ` ORDER BY ${sort} ASC`;
  return db.prepare(query).all(...params);
}
```

Two things to note. First, Claude whitelist-validated the sort field instead of interpolating user input directly — good security hygiene without being asked. Second, the LEFT JOIN on categories was there from the start, which saved me from having to ask for it. Claude anticipated the need because the data model implied it.

I did catch one issue: the `completed` filter was comparing against the string `"true"` from query params instead of converting to a boolean first. Quick fix, but worth mentioning — always review the output, especially around type coercion.

> **Prompt:** Add a middleware that logs each request method, URL, and response time. Keep it simple, just console.log with a timestamp.

```javascript
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} ${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
  });
  next();
});
```

Clean and correct. No over-engineering.

## Phase 3 — Building the React Frontend

With the API working (tested manually with curl), I moved to the frontend.

> **Prompt:** Create a React frontend with Vite for the task manager. I need these components: TaskList (displays tasks with filter controls), TaskForm (create new task with title, description, category dropdown, due date), TaskItem (single task with complete toggle and delete button), and CategoryFilter (filter by category). Use fetch for API calls. Keep styling minimal — just enough CSS to be usable. No component libraries.

Claude generated all four components plus an `api.js` utility module. The component structure was sensible: `TaskList` managed state and passed callbacks down, `TaskForm` handled its own form state with controlled inputs, and `TaskItem` was a pure presentational component.

The initial state management used `useState` and `useEffect` in the `App` component, lifting state up in the standard React way. Nothing exotic, which is exactly what I wanted.

> **Prompt:** The category filter should show a count of tasks in each category. Also add an "All" option and a "Completed" toggle that works alongside the category filter.

This kind of incremental feature request is where the pair programming loop feels natural. Claude updated the `CategoryFilter` component to accept a task list and compute counts:

```jsx
function CategoryFilter({ categories, tasks, activeCategory, onSelect }) {
  const getCategoryCount = (categoryName) => {
    if (!categoryName) return tasks.length;
    return tasks.filter(t => t.category_name === categoryName).length;
  };

  return (
    <div className="category-filter">
      <button
        className={!activeCategory ? 'active' : ''}
        onClick={() => onSelect(null)}
      >
        All ({getCategoryCount(null)})
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          className={activeCategory === cat.name ? 'active' : ''}
          onClick={() => onSelect(cat.name)}
        >
          {cat.name} ({getCategoryCount(cat.name)})
        </button>
      ))}
    </div>
  );
}
```

One thing I liked: Claude kept the filtering logic client-side for the count display but still used server-side filtering for the actual task list fetch. That is the right call for a small app — you get instant UI feedback on counts without re-fetching.

## Phase 4 — Integration and Debugging

Connecting the frontend to the backend surfaced the usual suspects.

**CORS.** The Vite dev server runs on port 5173 and the Express API on port 3000. First request failed with a CORS error. I could have configured this myself, but I wanted to see how Claude handled it.

> **Prompt:** I'm getting CORS errors when the React frontend on localhost:5173 tries to reach the Express API on localhost:3000. Fix this for development and explain what should change for production.

Claude added the `cors` middleware with origin restricted to the dev server, and explained that in production you would either serve the frontend from the same origin or configure the allowed origin to match your domain. It also suggested using Vite's proxy config as an alternative, which is arguably cleaner for development:

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
});
```

I went with the proxy approach and removed the CORS middleware. One less dependency.

**Error states.** The initial frontend code had no error handling on API calls. This is a common gap in AI-generated code — the happy path is well-covered, but edge cases get skipped.

> **Prompt:** Add error handling to all API calls. Show a toast-style error message when a request fails. Don't use a library — just a simple div that appears at the top of the screen and auto-dismisses after 4 seconds.

Claude created a lightweight `useToast` hook and wired it through the app. The implementation was clean — a state array of messages, each with a timeout ID for auto-dismiss. No over-engineering.

**The one bug that took manual work.** When deleting a task and immediately filtering by category, the UI would briefly flash stale data. The issue was a race condition between the delete request completing and the filter re-fetch. Claude's fix was to use optimistic updates — remove the task from local state immediately and only revert if the API call fails. Correct solution, and it got there after one follow-up prompt where I described the exact symptom.

## Phase 5 — Deploy to Railway

Deployment was the fastest phase.

> **Prompt:** I want to deploy this to Railway. The Express server should serve the React build in production. Give me the necessary config: build script, start script, and any changes to the Express server for serving static files.

Claude added a build script that builds the React app and copies it to a `dist` folder, configured Express to serve static files from that directory, and generated a `railway.json` with the build and start commands:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server/index.js",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

It also updated the Express server to serve the React app for any non-API route, which handles client-side routing:

```javascript
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  }
});
```

Deployed on the first try. The SQLite database file lives on Railway's ephemeral disk, which means it resets on redeploy — Claude flagged this unprompted and suggested switching to PostgreSQL for persistence if this were a real production app. Good awareness.

## Lessons Learned

**What worked well:**

- **Architecture and planning.** Claude is excellent at defining data models, API structures, and component hierarchies. The planning phase is where you get the most leverage.
- **Iterative refinement.** The prompt-refine-prompt loop feels natural. First pass gets you most of the way, follow-ups handle the details.
- **Boilerplate elimination.** Setting up Express middleware, writing CRUD endpoints, creating React form components — this is all code that takes time to write but doesn't require deep thinking. Claude handles it reliably.
- **Explaining trade-offs.** When I asked about CORS or deployment, Claude didn't just give me code — it explained the "why" and flagged production considerations.

**What needed manual intervention:**

- **Type coercion bugs.** The query parameter parsing issue would have caused a subtle bug if I hadn't caught it during testing.
- **Race conditions.** Claude didn't anticipate the optimistic update need until I described the symptom. Complex state timing issues still need a human eye.
- **Styling.** The generated CSS was functional but bland. I spent about 20 minutes manually adjusting spacing, colors, and responsive breakpoints.

**Time estimate:** The entire build took roughly three hours. Without Claude, this same app would have taken me six to eight hours — standard CRUD app work, but a lot of wiring. The biggest time savings were in the backend (endpoints and database queries) and the React component scaffolding. The biggest time sink was still debugging and polish, which tracks with my experience on every project, AI-assisted or not.

## The Bottom Line

Claude works well as a pair programmer for full-stack builds. It won't replace your judgment — you still need to review every line, catch edge cases, and make architectural decisions. But it compresses the boring parts dramatically. The key is knowing when to prompt and when to code: use Claude for structure, boilerplate, and iteration; handle timing issues, security review, and polish yourself.

If you want to try this yourself, start with the planning prompt. A good architecture conversation up front makes every subsequent prompt more effective. And review everything before you commit — AI-generated code is a first draft, not a final product.
