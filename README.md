# Savia — Cleaning Service Estimator

Savia is a responsive cleaning-service portfolio project built around a Russian-language landing page, a deterministic price estimator, and a complete lead-request flow. A valid estimate can be carried into the contact form, verified server-side, and delivered to Telegram.

## Preview

![Savia landing page hero](screenshots/01-hero.png)

![Savia services section](screenshots/02-services.png)

![Cleaning estimator with a valid result](screenshots/03-estimator.png)

![Lead form with the transferred estimate](screenshots/04-quote-flow.png)

## What it demonstrates

- Responsive landing-page implementation for desktop, tablet, and mobile
- Astro and TypeScript without a heavy UI framework
- Custom CSS and accessible native controls
- A deterministic cleaning estimator with clear validation states
- Estimate-to-form state transfer
- Client and server validation for lead requests
- Server-side price recalculation before delivery
- Telegram lead delivery through a server-only adapter
- Automated tests for pricing, payloads, validation, endpoint behavior, and Telegram delivery
- Secrets kept outside browser code

## Product decision

The starting point was a real local cleaning-business brief. Its early roadmap included a price calculator, but discovery showed that actual jobs are priced individually: the scope depends on the specific property and task.

That led to two deliberate directions. The real-business direction kept an individual quote request instead of forcing a calculator into the customer journey. This separate portfolio edition adds a deterministic estimator on purpose, so the implementation can demonstrate interactive frontend logic, validation, and a complete lead flow without presenting demonstrational pricing as a real business promise.

## Key features

- Service overview, process explanation, gallery, calculator, and quote form in one responsive page
- Estimator inputs for property type, cleaning type, area, frequency, and add-on services
- Empty, valid, and invalid estimator states with Russian price formatting
- Valid estimate summary shown in the lead form and cleared when the source estimate becomes invalid
- Required name and contact fields, optional comment, visible validation, live status updates, and a honeypot field
- Bounded JSON request handling and server-side validation
- Explicit success, configuration-error, and delivery-error behavior

## Architecture

```text
Estimator
  → Lead form
  → POST /api/lead
  → server validation
  → calculatePrice()
  → Telegram adapter
  → Telegram Bot API
```

The browser can include an estimate as context, but the server does not trust the submitted price. It validates the estimate and recalculates it with `calculatePrice()` before creating the Telegram message. `LeadPayload` stays independent of the delivery transport, while Telegram-specific code remains in server-only modules.

## Tech stack

- Astro
- TypeScript
- CSS
- Vitest
- pnpm
- Vercel adapter and server function
- Telegram Bot API

## Testing

The repository currently contains **45 automated tests in 5 test files**. They cover pricing boundaries and rounding, lead-payload shaping, server-side validation and recalculation, endpoint responses, and Telegram message/delivery handling.

The interface was also reviewed across desktop, tablet, and mobile layouts, including estimator edge cases, form states, keyboard behavior, and accessible control semantics.

## Local development

```bash
pnpm install
pnpm dev
```

Useful checks:

```bash
pnpm test
pnpm check
pnpm build
```

To enable local Telegram delivery, create a local `.env` from `.env.example` and provide these server-side variables:

```text
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
```

Do not expose these values in browser code or commit them to the repository.

## Deployment

The landing page is prerendered as static output. The `/api/lead` route is the on-demand server component and is bundled through the Vercel adapter. The intended deployment platform is Vercel, where Telegram credentials belong in environment variables.

No public deployment is claimed by this repository.

## Demo note

Savia is a portfolio project. Its pricing rules and imagery are demonstrational, and the project does not claim completed client work by a real Savia company.
