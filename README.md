# Surabhi Astrology — Kundali website

This Next.js application serves the Kundali landing page, common service checkout, payment confirmation page, WhatsApp bot webhook, and shared orders/admin dashboard.

**New developer?** Start with [the developer handover guide](docs/DEVELOPER_HANDOVER.md). It explains the domains, Preview/Production separation, WhatsApp and Razorpay testing, environment-variable names, shared orders, and release checklist. Do not put credential values in this repository.

## Local development

1. Run `npm ci`.
2. Obtain development-only credentials from the project owner and keep them in an untracked `.env.local` file. See the handover guide for variable names. Do not use Production payment or WhatsApp credentials locally.
3. Run `npm run dev` (default: `http://localhost:3000`). For port 3100, run `npm run dev -- -p 3100`.
4. Run `npx tsc --noEmit` and `npm run build` before proposing a deployment.

Changes to the `preview` branch deploy to the stable test domain. Production is a separate release step; see the guide before changing payment, Meta tracking, webhook, or order code.
