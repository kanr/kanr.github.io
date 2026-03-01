---
title: "How to Use AI to Migrate Your Codebase (Framework, Language, or Architecture)"
description: "A practical strategy for using AI assistants to tackle code migrations — JS to TypeScript, REST to GraphQL, class components to hooks, and more — without losing your mind."
pubDate: 2026-02-28
author: "Kanr"
tags: ["ai", "migration", "typescript", "refactoring", "developer tools"]
---

Code migrations are the root canal of software engineering. They're necessary, they're overdue, and no matter how much you prepare, the moment you start you discover problems that weren't in the plan. I've lived through enough of them — a 40,000-line JavaScript codebase to TypeScript, a Vue 2 app to Vue 3, two REST APIs extended with GraphQL — to know that AI doesn't eliminate the pain. But it compresses it into something survivable.

This is the strategy I wish I'd had from the start.

## What Kinds of Migrations This Covers

The approach here applies across the most common migration types:

- **JavaScript → TypeScript** (the most common, and the most forgiving in terms of tooling)
- **Class components → React hooks** (pure structural refactor, no behavior change)
- **Vue 2 → Vue 3** (Composition API, breaking changes in lifecycle hooks and reactivity)
- **REST → GraphQL** (schema-first thinking requires more architectural input from you)
- **Monolith → microservices patterns** (AI helps with individual service extraction, not system design)
- **Python 2 → Python 3** (largely mechanical, with some tricky string handling edge cases)

The tactics are the same across all of them. The only variable is how much human judgment the migration requires at the architectural layer.

## The Strategy: Never Migrate Everything at Once

This is the mistake every team makes, with or without AI. The instinct is to run a script (or ask an AI) to convert everything in one pass, then fix what breaks. It doesn't work. You end up with a 600-file diff that nobody can meaningfully review, a broken CI pipeline, and a team that's lost confidence in the migration.

The correct strategy is incremental, even if it feels slower.

### Step 1: Use AI to Analyze and Plan

Before writing a single line of migrated code, ask your AI assistant to analyze the existing codebase and generate a migration plan.

**Example prompt:**

> "I have a JavaScript Express API with the following structure: [paste your directory tree]. I want to migrate it to TypeScript. Analyze the structure and give me: (1) a prioritized migration order by file/module, (2) any files that will need special attention due to dynamic typing or runtime type manipulation, (3) external dependencies that may not have TypeScript definitions, and (4) a suggested branch strategy for keeping the migration reviewable."

Claude will return something genuinely useful here — a prioritized file list, a note about which files depend on which, and a flag for the gnarly ones. Save this output as a `MIGRATION_PLAN.md` in your repo. It becomes your source of truth.

### Step 2: Migrate One Representative File First

Pick one file from the middle of the dependency graph — not the simplest, not the most complex. Something representative. Migrate it manually with AI assistance, paying close attention to every decision you make.

**Example prompt:**

> "Here is a JavaScript Express route file: [paste content]. Migrate it to TypeScript strictly — add proper types to all parameters, return types to all functions, and define interfaces for any request/response shapes. Do not change the logic, only add types. Show me the migrated file and explain every type decision."

The "explain every type decision" clause is important. It forces the model to produce defensible output rather than suppressing complexity with `any`. Review this file as carefully as you would a human PR.

### Step 3: Templatize the Migration Prompt

Once you're happy with the reference migration, extract a reusable prompt template:

```
Migrate the following [source language/framework] file to [target language/framework].
Rules:
- Do not change any logic — only migrate syntax and add types
- Use the same patterns established in this reference file: [paste reference]
- Flag any line where you're uncertain about the correct type with a // TODO comment
- Do not use `any` without a // REASON comment explaining why

[paste file to migrate]
```

Include the reference file in every prompt. This is the key insight: AI is excellent at pattern-matching and consistency when you give it a concrete example. Without the reference, each file may be migrated differently, creating an inconsistent codebase.

### Step 4: Validate Every Migrated File

AI-assisted migration isn't a one-shot process. Every file needs validation:

1. **TypeScript compiler / linter**: Run `tsc --noEmit` (or your equivalent) on each migrated file before moving to the next
2. **Automated tests**: If you have them, run the test suite after each batch. If you don't — add at least smoke tests before starting the migration
3. **Manual review**: Read the diff. Look specifically for behavioral changes. AI sometimes "improves" code during migration, which is a problem we'll discuss in the pitfalls section
4. **Type coverage audit**: Tools like `typescript-coverage-report` show you what percentage of your codebase is genuinely typed vs. silently `any`

## A Detailed Example: JavaScript Express to TypeScript

Let's walk through migrating a real file. Here's a simplified JavaScript Express route:

```js
// routes/users.js
const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/:id', async (req, res) => {
  try {
    const user = await db.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    if (!user.rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
```

**The analysis prompt:**

> "Before migrating this file, tell me: what types does this route depend on that I need to define or import? What assumptions is it making about the database query result shape?"

Claude will correctly identify that you need a `User` interface, a typed db client, and proper Express request/response generics.

**The migration prompt (using our template):**

> "Migrate this JavaScript Express route to TypeScript. Do not change logic. Define a `User` interface based on the SELECT *. Use Express's `Request` and `Response` generics. Flag uncertain types with TODO comments."

**The migrated output:**

```ts
// routes/users.ts
import { Router, Request, Response } from 'express';
import { db } from '../db';

interface User {
  id: number;
  email: string;
  created_at: Date;
  // TODO: add remaining columns once schema is confirmed
}

const router = Router();

router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const result = await db.query<User>('SELECT * FROM users WHERE id = $1', [req.params.id]);
    if (!result.rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

**Validation steps:**

```bash
# Run tsc on just this file
npx tsc --noEmit routes/users.ts

# Check for any suppressed types
grep -n "any\|TODO" routes/users.ts

# Run relevant tests
npm test -- --grep "users route"
```

The `grep` for `TODO` is a habit worth keeping throughout the migration. It surfaces every decision Claude flagged as uncertain.

## Pitfalls to Watch For

### AI assumes the simple case

Edge cases are where AI-assisted migration breaks. If your code has runtime type manipulation, conditional `require()` calls, or metaprogramming patterns, AI will migrate the easy 80% and quietly simplify the complex 20%. Review those files especially carefully.

### AI "improves" code during migration

This is subtle and dangerous. Claude might see a `callback`-style function and convert it to a `Promise` during a JS→TS migration, since "that's more idiomatic TypeScript." It's not wrong, but it changed the behavior. The mitigation is explicit in the prompt: *"Do not change any logic."* Repeat it, and still check diffs carefully. Behavioral changes are bugs waiting to happen.

### Context window limits

A 500-line file often exceeds what you can comfortably include alongside a full reference file and a system prompt. When you hit this:

- Migrate one function or class at a time rather than one file at a time
- Ask Claude to "migrate only the exported functions, leaving internal helpers as stubs I'll fill in"
- Use a tool like `aider` that manages context across files automatically

### Dependency changes AI misses

AI reliably migrates your source files but frequently misses the plumbing: `package.json` devDependencies, `tsconfig.json` path aliases that need updating, `jest.config.js` transform settings, Webpack or Vite config changes. Run `tsc` from the project root — not just individual files — after each batch to surface these systematically.

## The Realistic Timeline

Here's an honest comparison for a mid-sized JavaScript Express API (roughly 80 files, 15,000 lines) I migrated recently:

| Task | Without AI | With AI |
|---|---|---|
| Migration plan | 1–2 days | 2 hours |
| Reference file migration | 2–4 hours | 30 minutes |
| Bulk migration (80 files) | 3–4 weeks | 4–5 days |
| Validation and fixes | 1 week | 3–4 days |
| **Total** | **~5–6 weeks** | **~8–10 days** |

The time savings are real, but notice that validation takes almost as long proportionally. AI speeds up the mechanical transformation dramatically; it does not speed up the careful review and testing that makes the migration trustworthy. Budget for that, and you'll ship a migration that your teammates can actually depend on.

The pattern here mirrors every previous step-change in developer tooling. Compilers didn't eliminate the need to think about code. IDEs didn't eliminate the need to understand what you're typing. AI doesn't eliminate the need to understand what you're migrating. It just gets you to the hard parts faster.
