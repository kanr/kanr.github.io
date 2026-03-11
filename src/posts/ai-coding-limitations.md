---
title: "What AI Can't Do (Yet): The Limits of AI-Assisted Coding"
description: "An honest look at what AI coding assistants still struggle with — architecture, novel algorithms, security, performance, and more — and why understanding these limits makes you a better developer."
pubDate: 2026-02-28
author: "Kanr"
tags: ["ai", "coding", "developer tools", "opinion"]
---

I use AI coding assistants every day. They have genuinely changed how I work — I write boilerplate faster, explore unfamiliar codebases more confidently, and spend less time on mechanical tasks that used to eat hours. I am not here to argue that these tools are overhyped.

But I have also watched them fail in ways that are instructive. Not the obvious failures, like hallucinating a library that does not exist. The subtle ones, where the code looks correct, passes a casual review, and breaks in production three weeks later. Understanding where AI assistants fall short is not pessimism — it is the difference between using a tool well and using it blindly.

Here are six areas where AI coding assistants consistently struggle, and why those gaps matter.

## 1. System Architecture and Design Decisions

AI assistants are excellent implementers and unreliable architects. Ask one to build a feature within a well-defined system and it will do a good job. Ask it to decide how to structure that system in the first place and the results get shaky.

The problem is that architecture is about trade-offs that depend on context the model does not have: team size, expected load, deployment constraints, how fast requirements are likely to change, which parts of the system are most likely to need modification next year. These are judgment calls, not pattern-matching exercises.

**What goes wrong:** You ask an AI to design the data layer for a multi-tenant SaaS app. It produces a clean schema with shared tables and a `tenant_id` column on everything — the textbook approach. But your actual situation requires strict data isolation for compliance reasons, which means separate schemas or separate databases per tenant. The AI picked the most common pattern, not the right one for your constraints. If you accepted that architecture without thinking critically, you would discover the problem during a compliance audit, not during development.

## 2. Novel Algorithm Design

AI assistants are pattern remixers. They have seen enormous amounts of code and can recombine known patterns in useful ways. What they cannot do is invent genuinely new approaches to problems that do not have well-known solutions.

This rarely matters in day-to-day application development — most code does not require novel algorithms. But when you hit a problem that does, the AI will confidently produce something that looks like a solution by stitching together related patterns. It will not tell you it is guessing.

**What goes wrong:** You are working on a scheduling algorithm with unusual constraints — say, assigning shifts where employees have complex overlapping availability windows and hard caps on consecutive days. The AI produces something that resembles a constraint solver, but it is actually a greedy algorithm with heuristics that fail on edge cases. It works for your test data but produces invalid schedules for certain input combinations. The output looks sophisticated enough that you might not notice the flaw until real users complain.

## 3. Understanding Business Context and Domain Nuance

Code does not exist in a vacuum. A function called `calculateDiscount` is not just a math problem — it encodes business rules that depend on pricing strategy, legal requirements, contractual obligations, and edge cases that someone in the business learned the hard way.

AI assistants have no access to this institutional knowledge. They will write a `calculateDiscount` function that is logically coherent but does not match your actual discount rules, because those rules live in a product manager's head, a Confluence page, or a Slack thread from 2023.

**What goes wrong:** You ask the AI to implement a pro-rated refund calculation. It produces a clean function that divides the subscription cost by the days remaining. Reasonable. But your finance team rounds to the nearest cent in the customer's favor for amounts under $10 and in the company's favor for amounts over $10, because of a policy decision made two years ago. The AI cannot know this. The code is mathematically correct and business-wrong — the kind of bug that shows up as angry customer support tickets, not test failures.

## 4. Security-Critical Code Review

AI assistants can catch obvious security issues: SQL injection from string concatenation, missing authentication checks, hardcoded credentials. These are pattern-matchable vulnerabilities with clear signatures.

What they miss are the subtle ones. Time-of-check-to-time-of-use (TOCTOU) bugs. Confused deputy problems in permission systems. Side-channel leaks through timing differences. These vulnerabilities require understanding the interaction between components across time, not just the static shape of the code.

**What goes wrong:** You ask an AI to review an authorization middleware. It confirms that every route checks the user's role. Looks good. But it misses that the role is checked against a cached value that can be stale for up to five minutes after an admin revokes access. An attacker who knows they are about to be deactivated has a five-minute window to exfiltrate data. The AI verified the presence of a check without reasoning about the temporal properties of the data behind it.

## 5. Performance Optimization at Scale

AI assistants write correct code. Correctness is the floor, not the ceiling. At scale, the difference between code that works and code that works under load is not a bug — it is an entirely different set of concerns that models handle poorly.

The issue is that performance problems are emergent. They arise from the interaction of your code with your data distribution, your infrastructure, your traffic patterns, and your resource constraints. The AI does not know that your users table has 50 million rows, that your hot path runs 10,000 times per second, or that your database connection pool is limited to 20.

**What goes wrong:** You ask the AI to write a function that finds duplicate records across two tables. It produces a correct solution using a nested query with a subselect. On your development database with 1,000 rows, it runs in 50 milliseconds. On production with 8 million rows, it takes eleven minutes because the query plan does a sequential scan instead of using an index. The AI wrote correct SQL. It did not write performant SQL for your data volume, because it does not know your data volume.

## 6. Debugging Complex Distributed Systems

When something breaks in a distributed system, the root cause is almost never in a single file. It is in the interaction between services, in timing, in network conditions, in the order of operations across boundaries that no single code snippet can capture.

AI assistants can help you debug isolated functions effectively. They are much weaker at the kind of reasoning required to trace a problem across multiple services, message queues, caches, and databases — especially when the issue is non-deterministic.

**What goes wrong:** Users report intermittent 500 errors on checkout. You paste the error logs and stack trace into your AI assistant. It suggests the null pointer on line 47 of the payment handler is the problem and recommends adding a null check. But the real cause is an upstream service that occasionally returns an empty response body under high load due to a misconfigured timeout — the null on line 47 is a symptom, not the disease. The AI fixed the crash without diagnosing the actual failure, which will resurface as a different symptom somewhere else.

## What This Means for Developers

None of this is a reason to stop using AI coding assistants. It is a map of the territory where human judgment remains essential.

The skills worth sharpening are the ones AI handles poorly: system design thinking, understanding the business domain you work in, security reasoning, performance intuition, and the patience to trace problems across system boundaries. These were always the skills that separated senior developers from junior ones. AI has not changed that — it has made the distinction sharper.

The most effective way to use AI tools is to understand where they are strong (implementation, boilerplate, exploration, translation) and where they are weak (architecture, judgment calls, context-dependent decisions). Use them aggressively in the first category. Stay skeptical in the second.

AI coding assistants are getting better fast, and some of these limitations will erode over time. But the core gap — that models optimize for the most likely pattern while real software requires the right pattern for a specific context — is not a simple problem to solve. Until it is, the developers who understand both the capabilities and the limits will get the most out of these tools.
