---
title: "Using AI to Write Tests for Legacy Code"
description: "A practical guide to using Claude to generate unit and integration tests for existing codebases that lack test coverage. Includes real prompts, examples, and a workflow for incremental adoption."
pubDate: 2026-02-28
author: "Kanr"
tags: ["ai", "testing", "legacy code", "developer tools", "automation"]
---

You know the feeling. You join a new team, clone the repo, and the `tests/` directory is either empty or contains a single file from 2019 that imports a module that no longer exists. The codebase works — mostly — but nobody knows exactly why. Changing anything feels like defusing a bomb while blindfolded.

Adding test coverage to a codebase like this is one of the most important and least glamorous jobs in software engineering. It is also one of the places where AI can make a genuine, immediate difference.

I have been using Claude to generate tests for legacy codebases over the past year, and it has fundamentally changed how I approach the problem. Not because the AI writes perfect tests — it does not — but because it eliminates the blank-page paralysis that makes the task feel impossible.

## Start With a Strategy, Not a Coverage Target

The instinct when facing an untested codebase is to aim for some coverage number. "Let's get to 80%." This is a trap. Coverage is a lagging indicator, not a goal. Chasing it leads to shallow tests that inflate the number without catching real bugs.

Instead, start with the critical paths. Ask yourself: what breaks and costs us money? What do we deploy changes to most frequently? What code do new team members struggle to understand?

Map those areas first. You are building a safety net, and the net should go under the tightrope, not across the entire circus tent.

A practical order of priority:

1. **Pure utility functions** — no dependencies, clear inputs and outputs. Quick wins.
2. **Core business logic** — the rules that make the application what it is.
3. **API endpoints** — the external contract your consumers depend on.
4. **Data transformations** — anything that reshapes data between systems.

This is where AI-generated tests pay off fastest. Categories 1 and 2 are often straightforward for Claude to handle with minimal context. Categories 3 and 4 require more guidance but still save significant time.

## Giving Claude Enough Context

The quality of AI-generated tests is directly proportional to the context you provide. Dumping a single function into the prompt and asking for tests will get you something, but it will be generic. To get meaningful tests, Claude needs to understand:

- **The function or module under test** — the actual source code
- **Type definitions and data models** — what the inputs and outputs look like
- **Dependencies** — what the module imports and interacts with
- **The testing framework** — Jest, pytest, vitest, etc., and any custom helpers or fixtures already in use

A good prompt includes all of this explicitly. Do not assume Claude knows your project structure.

## Example 1: Unit Tests for a Utility Module

Say you have inherited a Python utility module that handles price calculations. It works, but nobody has ever tested it.

Here is a prompt that generates useful tests:

```
I need unit tests for this Python module. Use pytest.

## Source: pricing.py

def calculate_discount(price: float, tier: str, quantity: int) -> float:
    """Apply tiered discount to a line item."""
    rates = {"bronze": 0.05, "silver": 0.10, "gold": 0.15, "platinum": 0.20}
    base_discount = rates.get(tier, 0.0)

    # Bulk bonus: extra 5% over 100 units
    if quantity > 100:
        base_discount += 0.05

    discounted = price * quantity * (1 - base_discount)
    return round(discounted, 2)


def calculate_tax(subtotal: float, region: str) -> float:
    """Look up tax rate by region and apply."""
    tax_rates = {"US-CA": 0.0725, "US-NY": 0.08, "US-TX": 0.0625, "EU": 0.20}
    rate = tax_rates.get(region, 0.0)
    return round(subtotal * rate, 2)

## Testing requirements:
- Test every discount tier including an invalid/unknown tier
- Test the bulk discount threshold (boundary at 100 and 101)
- Test tax calculation for each known region and an unknown one
- Include edge cases: zero price, zero quantity, negative values
- Use parametrize for the tier and region variations
```

Claude produces tests like this:

```python
import pytest
from pricing import calculate_discount, calculate_tax


class TestCalculateDiscount:
    @pytest.mark.parametrize("tier,expected_rate", [
        ("bronze", 0.05),
        ("silver", 0.10),
        ("gold", 0.15),
        ("platinum", 0.20),
    ])
    def test_discount_tiers(self, tier, expected_rate):
        result = calculate_discount(100.0, tier, 1)
        assert result == round(100.0 * (1 - expected_rate), 2)

    def test_unknown_tier_no_discount(self):
        assert calculate_discount(100.0, "diamond", 10) == 1000.0

    def test_bulk_discount_at_boundary(self):
        # Exactly 100 units: no bulk bonus
        result_100 = calculate_discount(10.0, "bronze", 100)
        assert result_100 == 950.0  # 10 * 100 * 0.95

        # 101 units: bulk bonus kicks in
        result_101 = calculate_discount(10.0, "bronze", 101)
        assert result_101 == round(10.0 * 101 * 0.90, 2)

    def test_zero_price(self):
        assert calculate_discount(0.0, "gold", 50) == 0.0

    def test_zero_quantity(self):
        assert calculate_discount(99.99, "silver", 0) == 0.0

    def test_negative_price(self):
        result = calculate_discount(-50.0, "bronze", 10)
        assert result == round(-50.0 * 10 * 0.95, 2)


class TestCalculateTax:
    @pytest.mark.parametrize("region,rate", [
        ("US-CA", 0.0725),
        ("US-NY", 0.08),
        ("US-TX", 0.0625),
        ("EU", 0.20),
    ])
    def test_known_regions(self, region, rate):
        assert calculate_tax(100.0, region) == round(100.0 * rate, 2)

    def test_unknown_region_zero_tax(self):
        assert calculate_tax(100.0, "MARS") == 0.0

    def test_zero_subtotal(self):
        assert calculate_tax(0.0, "US-CA") == 0.0
```

This is not revolutionary code. But it took seconds instead of thirty minutes, and it covers the cases that matter. The boundary test at 100 vs 101 units is exactly the kind of test that catches real regressions.

## Example 2: Integration Tests With Mocking

Now consider a TypeScript API endpoint that hits a database. You cannot test it without mocking, and getting the mocking right is where most people give up.

```
Write Jest integration tests for this Express route handler.

## Source: routes/orders.ts

import { db } from "../db";
import { Request, Response } from "express";

export async function getOrder(req: Request, res: Response) {
  const { id } = req.params;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: "Invalid order ID" });
  }

  const order = await db.orders.findById(Number(id));

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  return res.status(200).json(order);
}

## Context:
- db.orders.findById returns a Promise<Order | null>
- Mock the db module entirely — do not hit a real database
- Test: valid ID returns order, missing order returns 404, invalid ID returns 400
- Use supertest if appropriate, or mock req/res directly
```

Claude generates tests that correctly mock the database layer and cover the three code paths. The key insight it handles well: mocking `db.orders.findById` to return different values per test, and verifying the response status and body for each case.

The mocking pattern Claude suggests is usually clean and follows established conventions for whichever framework you specify. When it does not, the fix is almost always a one-line adjustment rather than a rewrite.

## Validating AI-Generated Tests

Here is the uncomfortable truth: a test that passes is not the same as a test that works. AI-generated tests can have a specific failure mode — they can be syntactically correct, pass against the current code, and test absolutely nothing useful.

Watch for these red flags:

**Tests that just mirror the implementation.** If your test literally reimplements the function logic to compute the expected value, it will always pass but catch no bugs. The expected value should be a hardcoded, independently verified constant.

**Over-mocking.** If you mock so much that the test never exercises real code paths, you are testing your mocks, not your application. Mock at the boundaries (databases, HTTP clients, file systems), not in the middle of your business logic.

**Missing assertion specificity.** `expect(result).toBeDefined()` passes for virtually any return value. Assert on specific values, specific properties, specific error messages.

A practical validation technique: after generating tests, deliberately break the code under test. Change a comparison operator, swap a return value, alter a constant. If your tests still pass, they are not testing what you think they are. This is manual mutation testing, and it takes two minutes but saves you from false confidence.

## Common Pitfalls

**Asking for "tests for this file" with no other context.** Claude will generate something, but without knowing your testing framework conventions, assertion styles, or what actually matters about the code, the tests will be generic.

**Generating all tests at once.** Write tests module by module. Review and run each batch before moving on. AI-generated tests compound errors if you generate hundreds of lines before verifying any of them.

**Treating generated tests as final.** They are a first draft. You will need to adjust expected values, add edge cases the AI missed, and remove cases that test implementation details rather than behavior.

## A Realistic Workflow

Here is what actually works for incrementally adding test coverage with AI:

1. Pick one module from your critical path list.
2. Read the code yourself first. Understand what it does and what could go wrong.
3. Write a detailed prompt including the source, types, dependencies, and specific scenarios you want tested.
4. Review the generated tests. Run them. Verify they fail when the code is wrong.
5. Commit the tests. Move to the next module.
6. Repeat weekly. Do not try to test everything in one sprint.

This is not the glamorous "AI writes all your tests" narrative. It is slower, more deliberate, and it works. After a few weeks, you have a meaningful safety net around the code that matters most. After a few months, you have the confidence to refactor the parts that have been keeping the team up at night.

The codebase did not get untested overnight. It will not get fully tested overnight either. But with AI handling the mechanical parts of test writing, the task stops being impossible and starts being just work — the kind you can chip away at, one module at a time.
