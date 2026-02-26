---
title: "Mobile-Optimizing an Astro Portfolio Site"
description: "A walkthrough of the changes I made to fix layout overflow, build a hamburger menu, and ensure every page looks great on iPhone."
pubDate: 2026-02-25
author: "Kanr"
tags: ["astro", "css", "mobile", "responsive design", "web development"]
---

My portfolio looked fine on a desktop browser. On my iPhone? Not so much. Navigation links were wrapping onto multiple rows, the homepage required horizontal scrolling, and tap targets were far too small to hit reliably. This post covers the full set of fixes I worked through.

## The Problems

Running a quick audit across all pages surfaced five main categories of issues:

1. **Navigation wrapping** — five links plus a theme toggle all crammed into a single `flex` row with `flex-wrap: wrap`. On a 390px screen they pushed onto two or three rows.
2. **Fixed-width homepage** — `main { width: 800px }` in `index.astro` caused horizontal scroll on every phone.
3. **Grids that didn't collapse** — several pages used `minmax(280px–400px, 1fr)` grids with no mobile override, so cards would overflow rather than stack.
4. **Tiny touch targets** — nav links had no minimum height, and icon buttons were exactly 20×20px — well below Apple's recommended 44×44pt minimum.
5. **No global `box-sizing`** — padding was being added *on top of* element widths, shifting layouts in subtle ways.

## Building a Hamburger Menu

The nav was the most impactful change. The plan: show all links normally on desktop, hide them on mobile behind a toggle button.

### HTML structure

I split the nav into three pieces inside `.nav-container`:

```html
<a class="nav-brand">kanr</a>

<div class="nav-links" id="nav-menu">
  <!-- links -->
</div>

<div class="nav-actions">
  <!-- theme toggle + hamburger button -->
</div>
```

The hamburger button (`#nav-toggle`) holds two SVG icons — a three-line hamburger and an X — only one is visible at a time.

### CSS

On desktop the links are a standard flex row. On mobile I hide them and position them as a full-width dropdown below the nav bar:

```css
@media (max-width: 768px) {
  .nav-toggle {
    display: flex;
  }

  .nav-links {
    display: none;
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    flex-direction: column;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    box-shadow: var(--shadow-md);
  }

  .nav-links.open {
    display: flex;
  }

  .nav-link {
    padding: 0.875rem 1.5rem;
    min-height: 52px;
    border-bottom: 1px solid var(--border-color);
  }
}
```

### JavaScript

Three behaviours to wire up: open/close on toggle click, close when any link is tapped, close when tapping outside the nav.

```js
const navToggle = document.getElementById('nav-toggle');
const navMenu   = document.getElementById('nav-menu');

navToggle?.addEventListener('click', () => {
  const isOpen = navMenu?.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});

navMenu?.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle?.classList.remove('open');
  });
});

document.addEventListener('click', (e) => {
  const nav = document.querySelector('.site-nav');
  if (nav && !nav.contains(e.target) && navMenu?.classList.contains('open')) {
    navMenu.classList.remove('open');
    navToggle?.classList.remove('open');
  }
});
```

## Fixing the Homepage Overflow

This one was a one-liner:

```css
/* Before */
main { width: 800px; }

/* After */
main { max-width: 800px; width: 100%; }
```

`max-width` means "grow up to 800px but no further"; `width: 100%` means "shrink below 800px when the viewport is smaller." The old `width: 800px` was an absolute value that ignored the viewport entirely.

## Global Box-Sizing

Without `box-sizing: border-box`, adding `padding` to an element increases its total rendered width. This caused subtle overflows across multiple components. The fix goes in the global stylesheet:

```css
html {
  box-sizing: border-box;
}
*, *::before, *::after {
  box-sizing: inherit;
}

body {
  overflow-x: hidden;
}
```

This is widely considered a CSS reset best practice and should really be in every project from day one.

## Responsive Grid Breakpoints

Several pages needed additional breakpoints. The pattern is consistent across all of them:

```css
/* Two columns below 768px */
@media (max-width: 768px) {
  .contact-grid { grid-template-columns: 1fr 1fr; }
}

/* Single column below 480px */
@media (max-width: 480px) {
  .contact-grid { grid-template-columns: 1fr; }
}
```

The same treatment went to:
- `about.astro` — `.skills-grid`
- `projects.astro` — `.other-grid` (`.featured-grid` already had a 768px override)
- `repos.astro` — reduced `minmax(300px, 1fr)` to `minmax(280px, 1fr)` so cards fit on narrower phones

## Touch Targets

Apple's Human Interface Guidelines recommend a minimum tap area of 44×44 points. All interactive elements now meet that:

```css
.nav-link {
  min-height: 44px;
  display: flex;
  align-items: center;
}

.theme-toggle,
.nav-toggle {
  min-width: 44px;
  min-height: 44px;
}

.social-links a {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

## Result

The site now handles mobile correctly end-to-end: no horizontal scroll, a clean drawer navigation that opens and closes reliably, all grids stacking appropriately at each breakpoint, and every tappable element large enough to hit without zooming in. All built with vanilla CSS and a small inline script — no dependencies required.
