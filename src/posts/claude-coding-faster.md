---
title: "How I Use Claude to Write Code Faster (Without Losing Control)"
description: "Practical workflows for using Claude as an AI coding assistant — what actually works, what to watch out for, and how to keep your codebase yours."
pubDate: 2026-02-28
author: "Kanr"
tags: ["ai", "coding", "productivity", "claude", "developer tools"]
---

Last month I needed to migrate a batch processing pipeline from synchronous to async. Twelve files, three services, a mess of callbacks that needed to become proper `async/await` chains. The kind of task that would normally eat an entire afternoon of careful, tedious refactoring.

I described the migration to Claude, pointed it at the codebase, and had working code in about forty minutes — including the time I spent reviewing every change. That afternoon I shipped the feature I was *actually* supposed to be working on.

This is what AI pair programming looks like when it works well. Not magic. Not autopilot. Just a faster way to get through the mechanical parts of development so you can spend your brain on the parts that matter.

Here is how I actually use Claude for coding day-to-day, and just as importantly, where I draw the line.

## The Workflows That Actually Work

After several months of using Claude as an AI coding assistant, I have settled into a handful of patterns that consistently save time.

### Code Generation for Known Patterns

When I know exactly what I want but do not feel like typing it out, Claude is excellent. CRUD endpoints, data models, serialization logic, config boilerplate — anything where the shape is clear and the implementation is mechanical.

A typical prompt looks like this:

```python
# Prompt: "Write a FastAPI endpoint that accepts a JSON payload with
# name (str), email (str), and role (enum: admin, member, viewer),
# validates the input, and inserts into a PostgreSQL users table
# using asyncpg. Return the created user with their generated UUID."
```

What comes back is usually correct on the first pass:

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from enum import Enum
import uuid
import asyncpg

router = APIRouter()

class UserRole(str, Enum):
    admin = "admin"
    member = "member"
    viewer = "viewer"

class CreateUserRequest(BaseModel):
    name: str
    email: EmailStr
    role: UserRole

class UserResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    role: UserRole

@router.post("/users", response_model=UserResponse, status_code=201)
async def create_user(req: CreateUserRequest, db: asyncpg.Pool):
    user_id = uuid.uuid4()
    await db.execute(
        "INSERT INTO users (id, name, email, role) VALUES ($1, $2, $3, $4)",
        user_id, req.name, req.email, req.role.value,
    )
    return UserResponse(id=user_id, name=req.name, email=req.email, role=req.role)
```

Is it perfect? No — I would probably add error handling for duplicate emails and use dependency injection for the database pool. But it is a solid starting point that took seconds instead of minutes.

### Refactoring

This is where I get the most value. Refactoring is often tedious but straightforward — exactly the kind of work where an AI coding assistant shines. Extracting functions, converting class components to hooks, restructuring modules, renaming things across a codebase. Claude handles these reliably because the intent is clear and the correctness criteria are mechanical: does the code still do the same thing?

### Debugging

When I am staring at a stack trace and cannot see the problem, dropping the error and the relevant code into Claude almost always gets me to the root cause faster. It is especially good at spotting the kind of subtle issues — off-by-one errors, incorrect type coercions, race conditions — that your eyes glaze over after twenty minutes of staring.

### Writing Tests

This is the workflow I recommend to anyone getting started with AI pair programming. Point Claude at a function, ask for tests, and you will get reasonable coverage in seconds. The tests usually need some tweaking — the edge cases it picks are not always the ones that matter for your domain — but starting from a generated test file is dramatically faster than starting from scratch.

## When NOT to Trust the Output

Here is the part most "AI will 10x your productivity" posts skip. There are entire categories of work where I do not let Claude drive.

### Architecture Decisions

Claude will happily design your system architecture if you ask. It will give you a clean, reasonable-sounding answer. The problem is that architecture decisions depend on context that lives outside the code: team size, deployment constraints, expected scale, regulatory requirements, organizational politics. Claude does not know any of that, and it will confidently fill in the gaps with assumptions.

I use Claude to *explore* architectural options — "what are the trade-offs between event sourcing and a traditional CRUD approach here?" — but the decision stays with me.

### Security-Sensitive Code

Authentication flows, authorization logic, input sanitization, cryptographic operations. These are areas where "mostly correct" can be catastrophic. I will ask Claude to draft an implementation, but I review every line against known best practices, and I never skip testing edge cases around auth boundaries.

### Core Business Logic

The rules that make your product *your product* need to come from your understanding of the domain. Claude can implement business logic you describe precisely, but it should not be inventing it. If you find yourself prompting "figure out what the discount logic should be," you have a product question, not a coding question.

## The Review Loop

Faster development with AI only works if you actually review what it produces. I have a simple process:

1. **Read the diff, not the file.** When Claude modifies existing code, I review it the same way I review a pull request from a colleague. What changed? Does the change make sense?

2. **Run the tests.** Always. If there are no tests, write them first (and yes, let Claude help with that).

3. **Check the boundaries.** AI-generated code tends to handle the happy path well. I spend my review time on error cases, edge cases, and integration points.

4. **Question the dependencies.** If Claude introduced a new library or pattern, I ask why. Sometimes it is the right call. Sometimes it is pulling in a dependency for something the standard library handles fine.

5. **Run it.** This sounds obvious, but I have caught issues in generated code that looked perfect on visual inspection. Actually executing the code — especially with edge-case inputs — catches things static review misses.

The whole loop takes a few minutes per change. It is significantly faster than writing the code from scratch, but it is not free. Anyone telling you AI-generated code does not need review is selling something.

## A Realistic Assessment

After integrating Claude into my daily workflow, here is roughly how my development time breaks down:

- **~40% of my coding work** is now significantly accelerated by AI. Boilerplate, tests, refactoring, debugging assistance, documentation, and implementation of well-defined patterns.
- **~30%** benefits somewhat. I will consult Claude for ideas or a starting point, but the final implementation requires enough domain-specific knowledge or careful thinking that AI is more of a research tool than a coding tool.
- **~30%** is untouched. Architecture planning, code review, debugging subtle production issues, system design discussions, and the kind of deep thinking that requires understanding the full context of a project and its users.

The net result is real: I ship faster, and I spend less time on the parts of coding I find tedious. But the "I" in that sentence matters. Claude is a tool that amplifies what I can do. It does not replace the judgment, context, and taste that make the difference between code that works and code that is actually good.

The developers who get the most out of AI coding assistants are the ones who already know what good code looks like. They use Claude for coding the same way an experienced writer uses a thesaurus — to get to the right answer faster, not to find out what the answer should be.
