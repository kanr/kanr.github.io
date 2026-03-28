---
title: "How to Write Better Prompts for Code Generation"
description: "A practical guide to prompt engineering for code generation. Six techniques with concrete before/after examples that turn vague requests into production-ready code."
pubDate: 2026-02-28
author: "Kanr"
tags: ["ai", "prompt engineering", "coding", "developer tools"]
---

The gap between "AI-generated code I immediately delete" and "AI-generated code I ship to production" almost always comes down to the prompt. The model is the same. The difference is what you asked for and how you asked for it.

Most developers start with prompts like "write a function that does X" and get back something generic, often wrong, and riddled with assumptions that do not match their codebase. Then they conclude that AI coding tools are overhyped. But prompting is a skill, and like any skill, it improves dramatically with a few deliberate techniques.

This guide covers six concrete techniques for getting better code out of AI assistants. Each one includes a before/after prompt example so you can see exactly what changes and why it matters.

## Technique 1: Provide Context

The single biggest improvement you can make to any code generation prompt is adding context. The model does not know your tech stack, your project structure, your naming conventions, or your constraints unless you tell it.

**Before:**

```
Write a function to fetch user data from an API.
```

This prompt will produce something generic — probably using `fetch` with no error handling, no types, and assumptions about the response shape that do not match your API.

**After:**

```
Write a TypeScript function to fetch user data from our REST API.

Context:
- Framework: Next.js 14 with App Router
- HTTP client: we use `ky` (already installed, import from 'ky')
- API base URL is in env var NEXT_PUBLIC_API_URL
- User type: { id: string; email: string; displayName: string; role: 'admin' | 'member' }
- Auth: Bearer token stored in cookie, accessed via cookies() from 'next/headers'
- Error handling: throw typed errors using our AppError class from '@/lib/errors'
```

The output from the second prompt will match your stack, use your existing libraries, and follow patterns the rest of your codebase already uses. No refactoring needed.

**Why it works:** AI models generate code based on the most statistically likely patterns. Without context, you get the average of every tutorial and Stack Overflow answer. With context, you constrain the output to your specific project.

## Technique 2: Specify What You Don't Want

Telling the model what to avoid is often as valuable as telling it what to do. Every developer has opinions about patterns they consider harmful, dependencies they refuse to add, or approaches that would not survive code review.

**Before:**

```
Create a React component for a dropdown menu.
```

You will likely get a class component, or one that pulls in a third-party library, or one that manages its own state when you already have a state management solution.

**After:**

```
Create a React dropdown menu component.

Constraints:
- Functional component only, no class components
- No external dependencies — use only React and plain CSS
- Do not use useEffect for click-outside detection; use a ref-based approach with pointer events
- No inline styles — use CSS modules (*.module.css)
- Must be keyboard accessible (arrow keys, Enter, Escape)
- Do not add prop types or defaultProps — we use TypeScript interfaces
```

The second prompt eliminates an entire category of unwanted output. You will not waste time ripping out a dependency you did not want or converting a class component to a function.

**Why it works:** Models default to common patterns, which often include things you have deliberately moved away from. Negative constraints are a fast way to prune the solution space.

## Technique 3: Ask for Explanations Alongside Code

When you ask for code alone, you get code alone — and you have no idea whether the model made good decisions or bad ones. Asking for explanations forces the model to reason about its choices, which usually improves the code quality and always makes it easier to review.

**Before:**

```
Write a debounce function in TypeScript.
```

**After:**

```
Write a debounce function in TypeScript.

After the implementation, explain:
1. Why you chose this approach over alternatives (e.g., throttle, requestAnimationFrame)
2. How the generic types work and what they constrain
3. Edge cases this handles (rapid calls, component unmount, leading vs trailing edge)
4. What I would need to change to add a `maxWait` option like Lodash's debounce
```

The second prompt produces the same function but with a detailed explanation that helps you understand the trade-offs, spot potential issues, and extend the code later without asking again.

**Why it works:** Explanation requests trigger more careful reasoning in the model. It is the difference between "write this quickly" and "write this and defend your choices." The quality of the code itself tends to improve, not just the documentation around it.

## Technique 4: Iterate with Follow-Up Prompts

The best code generation rarely happens in a single prompt. The real skill is knowing how to refine. Most developers treat each prompt as independent, but follow-up prompts that build on previous output are far more effective.

**First prompt:**

```
Write a Python function that parses a CSV file and returns a list of dictionaries.
```

You get a basic implementation using `csv.DictReader`. It works, but it does not handle your actual requirements.

**Follow-up prompt (instead of starting over):**

```
Good start. Now modify this function to:
1. Accept both file paths and file-like objects (use typing.Union)
2. Add a `required_columns` parameter that raises ValueError if any are missing
3. Strip whitespace from all header names and string values
4. Skip rows where all values are empty
5. Add type hints and a docstring following Google style

Keep the csv.DictReader approach but wrap it to handle these cases.
```

This iterative approach produces better results than trying to specify everything upfront because the model can see its own previous output and make targeted modifications.

**Why it works:** Follow-up prompts give the model concrete code to modify rather than generating from scratch. Each refinement is a smaller, more focused task, which models handle more reliably than large multi-requirement prompts.

## Technique 5: Use Examples to Guide Style

When you need code that matches a specific style or pattern, showing the model an example is far more effective than describing the style in words. Input/output pairs are the most powerful prompting technique for controlling code style.

**Before:**

```
Write a validation function for email addresses.
```

**After:**

```
Write a validation function for email addresses following the same pattern as this existing validator:

```typescript
type ValidationResult = { valid: true } | { valid: false; error: string };

function validateUsername(input: unknown): ValidationResult {
  if (typeof input !== 'string') {
    return { valid: false, error: 'Username must be a string' };
  }
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Username is required' };
  }
  if (trimmed.length < 3 || trimmed.length > 30) {
    return { valid: false, error: 'Username must be between 3 and 30 characters' };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { valid: false, error: 'Username may only contain letters, numbers, hyphens, and underscores' };
  }
  return { valid: true };
}
```

Write `validateEmail` using the same pattern: same return type, same guard clause ordering (type check → empty check → format check), same error message style.
```

The model will produce a function that looks like it belongs in the same file as the example. No style mismatches, no inconsistent error message formats, no different return type patterns.

**Why it works:** Examples are unambiguous. Describing "Google-style docstrings" or "our error pattern" leaves room for interpretation. Showing an actual function from your codebase eliminates that ambiguity entirely.

## Technique 6: Request Specific Formats

Vague prompts produce vague structures. When you need code organized a specific way — particular function signatures, error handling patterns, test structures — say so explicitly.

**Before:**

```
Write tests for a user registration function.
```

**After:**

```
Write tests for the `registerUser` function using pytest.

Function signature:
async def register_user(email: str, password: str, db: AsyncSession) -> User

Test structure requirements:
- Use pytest-asyncio with `@pytest.mark.asyncio`
- Group tests in a class `TestRegisterUser`
- Use factory_boy fixtures for test data (we have `UserFactory` in `tests/factories.py`)
- Mock the database session using `AsyncMock`
- Test these cases:
  1. Successful registration returns User with hashed password
  2. Duplicate email raises `DuplicateEmailError`
  3. Weak password (< 8 chars) raises `ValidationError`
  4. Email is normalized to lowercase before storage
- Assert pattern: use `assert result.field == expected`, not `assertEqual`
- Each test method name should start with `test_register_user_`
```

The second prompt produces tests you can actually drop into your test suite. The first prompt produces tests that use `unittest`, the wrong assertion style, and mock patterns that do not match your codebase.

**Why it works:** Code structure is where AI assistants diverge most from your project conventions. Testing patterns, error handling, file organization — these are highly project-specific. The model cannot guess your conventions, but it can follow them precisely when told.

## The Prompt Checklist

Before sending a code generation prompt, run through this checklist:

1. **Language and framework** — Did I specify the language, version, and framework?
2. **Existing patterns** — Did I include an example of how similar code looks in my project?
3. **Dependencies** — Did I list what libraries are available and what to avoid?
4. **Types and interfaces** — Did I provide relevant type definitions, API shapes, or database schemas?
5. **Constraints** — Did I specify what I do not want? (No classes, no external deps, no inline styles, etc.)
6. **Error handling** — Did I describe how errors should be handled, thrown, or returned?
7. **Output format** — Did I specify function signatures, return types, test structure, or file organization?
8. **Explanation request** — Did I ask the model to explain its decisions so I can review them?

You do not need all eight for every prompt. A simple utility function might only need items 1 and 4. A complex feature might need all of them. The point is to be deliberate rather than hoping the model reads your mind.

## The Bigger Picture

Better prompts are not about tricking the model into producing good code. They are about giving it the same context a human colleague would have. When a senior developer joins your team, you do not hand them a one-line ticket and expect perfect code. You explain the codebase, the conventions, the constraints, and the why behind the how.

AI coding assistants are the same. The investment in writing a good prompt pays for itself immediately — in code you do not have to rewrite, in review cycles you skip, and in patterns that stay consistent across your codebase. Treat your prompts like you treat your code: with intention, specificity, and an awareness that someone (or something) has to turn your words into working software.
