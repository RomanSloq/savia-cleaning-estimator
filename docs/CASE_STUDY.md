# Savia — Case Study

## Context

Savia began with a brief for a local cleaning business. The portfolio project keeps the useful product constraints from that setting—people need to understand the service, describe their task, and request an individual quote—without exposing the original business identity, contacts, or materials.

## Problem

The first roadmap included a price calculator. Discovery showed that cleaning work is not reliably priced from a small set of public inputs: the final scope depends on the condition of the property, the requested work, and details found during clarification.

## Product decision

The response was to split two use cases rather than compromise either one:

```text
Real-business direction
  → individual quote request

Portfolio edition
  → deterministic demo estimator
```

For the real-business direction, an individual quote request was more honest than a calculator that could imply a final price. The portfolio edition uses a deterministic estimator intentionally: it creates a bounded, testable interaction that demonstrates frontend state handling, TypeScript pricing logic, validation, and a complete lead path. The estimate is a starting point, not a promise of the final commercial price.

## What I built

- A responsive Russian-language landing page for desktop, tablet, and mobile
- An estimator UI for property type, cleaning type, area, frequency, and add-ons
- A separate TypeScript pricing engine
- Automated tests for pricing, payloads, validation, endpoint behavior, and Telegram delivery
- A lead form that can receive the current valid estimate
- An on-demand server endpoint at `/api/lead`
- Server-side input validation and estimate recalculation
- Telegram delivery through a dedicated server adapter

## Important implementation decisions

### Pricing is separate from the UI

`calculatePrice()` is the pricing source of truth. The calculator UI renders its result, while server validation calls the same function again instead of duplicating the formula.

### The server verifies the browser estimate

The browser sends an estimate only as useful context for a lead. The server validates every estimate field, rejects malformed data, and recalculates the price before delivery. A client-provided number is never treated as authoritative.

### The lead model is transport-agnostic

`LeadPayload` represents the request independently from its delivery channel. This keeps form collection separate from the current Telegram implementation and avoids coupling browser code to credentials or messaging details.

### Telegram stays on the server

The route reads its configuration from server-side environment variables, then passes a verified lead to the Telegram adapter. Tokens and chat identifiers do not belong in the browser bundle.

### Static-first architecture

Astro prerenders the landing page as static output. Only `/api/lead` opts into server execution, through the Vercel adapter. The page remains lightweight while the sensitive delivery step stays server-side.

## QA

The completed project was checked through:

- Visual review at desktop, tablet, and mobile widths
- Accessibility review of semantics, labels, focus states, native controls, and live form feedback
- Estimator edge cases: empty input, valid limits, invalid limits, cleared values, frequency, and add-on combinations
- Estimate-to-form synchronization and stale-state clearing
- 45 automated tests in 5 test files
- A real Telegram end-to-end delivery check with local server configuration
- Astro type checking and production builds
- Verification that the landing page is prerendered and the lead route remains server-only

## Result

Savia demonstrates how product reasoning can shape implementation choices: it preserves individual quoting where that is the honest business flow, while using a deterministic estimator where it is useful for a portfolio demonstration.

The finished project shows responsive UX/UI implementation, TypeScript business logic, automated testing, server-side API validation, and a server-side third-party integration—without claiming commercial results or real client work.
