# Responsive audit — November 2026

## Scope reviewed in source
- Site header, announcements, mobile drawers, search and account overlays
- Homepage hero, promotional banners, category/featured product grids and footer
- Collection filters, sorting, product cards, product detail gallery
- Cart and checkout forms, order summary, payment display
- Admin dashboard, product list, custom sale actions, product editor, media/homepage settings, payments, orders, store settings

## Changes in this patch
- Improved layout containment, border spacing, padding and touch targets on screens <= 700px, with additional narrow-screen adjustments.
- Made embedded iframe/video content scale within content columns if used.
- Prevented browser-only `window` access during product-page server rendering.
- Avoided hero-slider interval issues when fewer than two slides exist and added mobile image fallback.
- Ensured popup/drawer body scroll locking is cleaned up on navigation/unmount.

## Required QA before claiming zero glitches
Visual tests have **not** been run in this environment; source review cannot establish that a UI is glitch-free.

On actual browsers, check at minimum:
- 320px and 360px (compact mobile), 375px and 390px (common phones), 428px (large phone), 768px (tablet), 1024px and 1440px (desktop)
- iOS Safari and Android Chrome, including landscape mode
- Admin login, products listing, percent discount change/remove, add/edit product, homepage image controls, orders, payments, store settings
- Shop header/mobile menu, search modal, collections/filters, PDP gallery/quantity, cart drawer, cart page, checkout form and order states
- No page-wide horizontal scrolling, clipped form controls, inaccessible dialog actions, sticky overlay issues, unreadable long account numbers, or broken images

## Existing limitations unrelated to layout
- Admin write endpoints still require robust server-side authorization.
- Current file-based API storage is not guaranteed to persist across serverless deploys.
- Payment method labels are not payment gateway integrations.

Before promoting as fully tested, run `npm run build` and an automated cross-browser/mobile screenshot test suite in a configured CI or local browser environment.
