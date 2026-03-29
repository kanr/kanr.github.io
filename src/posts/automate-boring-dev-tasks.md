---
title: "Automating Boring Dev Tasks with Claude and Scripts"
description: "Seven repetitive development tasks that AI handles exceptionally well, with reusable prompt templates you can copy straight into your workflow."
pubDate: 2026-02-28
author: "Kanr"
tags: ["ai", "productivity", "developer tools", "automation"]
---

There is an 80/20 rule hiding inside AI-assisted development. Most of the conversation focuses on the flashy end — generating entire features, architecting systems, writing complex algorithms. But 80% of the practical value comes from the boring stuff. The tasks every developer does regularly, hates doing, and knows could be automated if they just had the time to set it up.

AI assistants are unreasonably good at these tasks. Not because they require brilliance, but because they require patience. Formatting, boilerplate, data transformation, documentation — this is mechanical work that follows clear patterns. It is exactly the kind of work that language models were made for.

Here are seven tasks where AI pays for itself immediately, with reusable prompt templates you can drop into your workflow today.

## 1. Writing Documentation for Existing Functions

The pain: You wrote the code six months ago. It works. Nobody documented it. Now someone (possibly future you) needs to understand what `processEntityBatch` does with its seven parameters. You know you should write docs, but staring at a function you already understand and describing it in English feels like homework.

**Prompt template:**

```
Write documentation for the following function. Include:
- A brief summary of what the function does (1-2 sentences)
- @param descriptions for each parameter with types and expected values
- @returns description with the return type and possible values
- @throws for any errors the function might raise
- One usage example

Use [JSDoc / Google-style docstrings / NumPy-style docstrings] format.
Match the voice and style of this existing docstring from our codebase:
[paste an example]

Function:
[paste the function]
```

**Example output (abbreviated):**

```typescript
/**
 * Processes a batch of entities by validating, transforming, and persisting
 * them to the database in a single transaction.
 *
 * @param entities - Array of raw entity objects from the API response
 * @param options - Processing configuration
 * @param options.dryRun - If true, validates without persisting (default: false)
 * @param options.batchSize - Number of entities per DB insert (default: 100)
 * @returns Object containing counts of processed, skipped, and failed entities
 * @throws {DatabaseError} If the transaction fails and cannot be rolled back
 *
 * @example
 * const result = await processEntityBatch(rawEntities, { batchSize: 50 });
 * console.log(`Processed: ${result.processed}, Failed: ${result.failed}`);
 */
```

You paste the function, get back documentation that matches your project style, review it for accuracy, and move on. A task that would have taken ten minutes of reluctant effort takes thirty seconds.

## 2. Writing Regex Patterns with Explanations

The pain: You need a regex to validate a specific format. You know it is possible. You also know that you will spend twenty minutes on regex101, get something that mostly works, forget what half the groups do, and leave a `// TODO: explain this regex` comment that will never get resolved.

**Prompt template:**

```
Write a regex pattern that matches: [describe the format]

Requirements:
- Must match: [list of strings that should match]
- Must NOT match: [list of strings that should reject]
- Language/engine: [JavaScript/Python/Go/etc.]
- Named capture groups: [yes/no, and which parts to capture]

Provide:
1. The pattern
2. A line-by-line breakdown explaining each part
3. Edge cases it handles and any it does NOT handle
```

**Example output (for matching semantic version strings):**

```python
import re

SEMVER_PATTERN = re.compile(
    r'^'
    r'(?P<major>0|[1-9]\d*)\.'       # Major version (no leading zeros)
    r'(?P<minor>0|[1-9]\d*)\.'       # Minor version (no leading zeros)
    r'(?P<patch>0|[1-9]\d*)'         # Patch version (no leading zeros)
    r'(?:-(?P<pre>[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?' # Optional pre-release
    r'(?:\+(?P<build>[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?' # Optional build metadata
    r'$'
)
```

You get the pattern, you understand the pattern, and the next person who reads it will understand it too. No regex101 rabbit hole required.

## 3. Generating Boilerplate Code

The pain: You need another CRUD endpoint. You have written this same pattern forty times. The model definition, the validation schema, the route handler, the error responses — it is all the same structure, just different field names. Your fingers know the keystrokes. Your brain checked out three endpoints ago.

**Prompt template:**

```
Generate a complete CRUD boilerplate for a [resource name] with the following fields:
[list fields with types]

Stack: [e.g., Express + Prisma + Zod, FastAPI + SQLAlchemy + Pydantic]

Generate:
1. Database model/schema
2. Validation schemas (create and update, with update having all fields optional)
3. Route handlers for GET (list + single), POST, PUT, DELETE
4. Follow this existing endpoint as a style reference: [paste an example]

Conventions:
- [list any naming conventions, error handling patterns, etc.]
```

The model generates hundreds of lines of boilerplate that follows your existing patterns. You review it, adjust the business logic that is actually unique to this resource, and save yourself twenty minutes of copy-paste-modify tedium.

## 4. Converting Data Between Formats

The pain: Someone sends you a CSV. You need JSON. Or your config is in YAML and you need to port it to TOML. Or you have a SQL schema dump and need TypeScript interfaces. This is pure mechanical transformation — no creativity, no decisions, just reshaping.

**Prompt template:**

```
Convert the following [source format] to [target format].

Rules:
- [any specific mapping rules, e.g., "snake_case keys to camelCase"]
- [handling for nulls, empty strings, nested objects, etc.]
- [whether to preserve comments, add type annotations, etc.]

Source data:
[paste data]
```

**Example — SQL table to TypeScript interface:**

Input:

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    total_cents INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Output:

```typescript
interface Order {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalCents: number;
  notes: string | null;
  createdAt: Date;
}
```

No manual field-by-field translation. No wondering whether `TIMESTAMPTZ` maps to `Date` or `string`. Paste, prompt, done.

## 5. Creating Database Migration Scripts

The pain: You changed a model and now you need a migration. You know the ALTER TABLE syntax. You also know that you will forget a NOT NULL constraint, mess up a default value, or write the down migration incorrectly. Every migration is high-stakes boilerplate.

**Prompt template:**

```
Write a database migration script for the following schema change:

Before: [paste current schema or model]
After: [paste updated schema or model]

Requirements:
- Migration tool: [Prisma / Alembic / Knex / raw SQL]
- Include both up and down migrations
- Handle data migration if needed (e.g., splitting a column into two)
- Add appropriate indexes for any new foreign keys
- Make the migration idempotent where possible
```

The model diffs the schemas, generates the correct ALTER statements, writes the rollback, and flags potential data loss issues. You review it instead of writing it from scratch.

## 6. Writing Commit Messages and PR Descriptions

The pain: You have been coding for three hours. The diff is 400 lines across twelve files. You need to write a commit message that explains what changed and why. Your brain is empty. You type "fix stuff" and feel a small piece of your professional dignity evaporate.

**Prompt template:**

```
Write a commit message and PR description from the following diff.

Commit message format: [conventional commits / your team's format]
PR description should include:
- Summary of changes (3-5 bullet points)
- Motivation / why this change was needed
- Testing done
- Any breaking changes or migration steps

Diff:
[paste git diff output]
```

This is one of the highest-ROI uses of AI in a development workflow. Good commit messages and PR descriptions make code review faster, make git history searchable, and make your future self grateful. The model reads the diff and writes what you would have written if you had the energy.

## 7. Generating API Client Code from Specs

The pain: The backend team published an OpenAPI spec. You need typed client functions for every endpoint. This is pure translation work — reading a spec and writing fetch calls with proper types, error handling, and parameter serialization. It is tedious, error-prone, and entirely mechanical.

**Prompt template:**

```
Generate a typed API client from the following OpenAPI spec (or endpoint list).

Requirements:
- Language: [TypeScript/Python/etc.]
- HTTP client: [fetch/ky/axios/httpx/etc.]
- Return types: generate interfaces from response schemas
- Error handling: [throw on non-2xx / return Result type / etc.]
- Include request parameter types (path params, query params, body)
- Group methods by resource (e.g., users.getById, users.create)

Spec:
[paste relevant portions of the OpenAPI spec]
```

Instead of hand-writing twenty endpoint wrappers, you get a typed client in your preferred style that you can review and ship. When the spec changes, you paste the updated section and regenerate.

## Building Your Prompt Library

The real productivity unlock is not any single prompt — it is building a personal library of prompt templates tailored to your stack and conventions. Here is how to do it effectively:

**Start with friction.** For one week, notice every task that makes you think "ugh, this again." Those are your candidates.

**Include a style reference.** Every template should include a slot for pasting an example from your actual codebase. This is the difference between generic output and output that matches your project.

**Store them where you will use them.** A markdown file in your project root, a snippet manager, a shell alias that pipes a template into your clipboard — whatever reduces the friction between "I need this" and "it is in my prompt."

**Iterate on the templates.** When a prompt produces output that needs consistent manual fixes, update the template to prevent those issues. Your prompt library should improve over time, just like your code.

The developers getting the most value from AI tools are not the ones writing the most ambitious prompts. They are the ones who automated the boring work so thoroughly that they barely think about it anymore. Every minute you do not spend writing boilerplate, formatting data, or documenting obvious code is a minute you spend on the problems that actually need a human brain.
