# Developer handover: domains, payments, WhatsApp, and testing

Last reviewed: 28 October 2026. This maps the code and setup tested by the team. Check the current Vercel and Meta dashboards before changing external configuration; those settings are not version-controlled. Never add credential values to this document, Git, tickets, chat, or screenshots.

## Repositories and domains

| Address / branch | Purpose | Boundary |
| --- | --- | --- |
| `kundalireport.surabhiastrology.com` | Production landing page, common checkout, success page, WhatsApp webhook, and `/admin/orders` for this repository. | Real customers and live payments. |
| `test.surabhiastrology.com` | Stable domain assigned to the `preview` Git branch of the same Vercel project. | Preview uses Razorpay test keys and Meta's WhatsApp test number. |
| Vercel-generated `*.vercel.app` Preview URLs | URLs for individual deployments. | They change after deployments; use the stable test domain in WhatsApp checkout links. |
| `matchmaking.surabhiastrology.com` | Separate matchmaking website/repository: `surabhiastrology/matchmaking-report-astro`. | Its orders include a second person's details. Verify its current Vercel domain mapping separately. |
| `surabhiastrology.com` | Main business website. | Not this checkout deployment. |

This repository is `surabhiastrology/astro-landing`. `origin/preview` is the testing branch; `origin/master` is the Production branch. At this review, both remote branches pointed to commit `00d4e28`. Future pushes to Preview do **not** automatically reach Production. Verify the Vercel deployment after each push.

### Code map

| Feature | Files |
| --- | --- |
| Service/plan catalogue, prices, urgent-delivery eligibility | `lib/checkout-plans.ts` |
| Common checkout UI and service-specific image/copy | `app/checkout/page.tsx` |
| Razorpay order creation with trusted server-side price | `app/api/create-order/route.ts` |
| Payment verification, saved order, email and WhatsApp confirmation | `app/api/payment-success/route.ts`, `app/api/webhook/razorpay/route.ts` |
| Receipt and next steps | `app/success/page.tsx`, `app/api/order-receipt/route.ts` |
| WhatsApp flow and checkout-link generation | `lib/waFlow.ts`, `app/api/whatsapp/webhook/route.ts` |
| Test/live WhatsApp selection and payment template names | `lib/whatsappEnvironment.ts`, `lib/payment-whatsapp-template.ts` |
| Shared orders dashboard | `app/admin/orders/page.tsx`, `app/api/admin/orders/route.ts` |
| Meta browser events and Preview guard | `app/layout.tsx`, `lib/meta-checkout-events.ts` |
| Preview no-index rules | `app/layout.tsx`, `next.config.ts` |

## Environment variables

Set values in **Vercel → Project → Settings → Environment Variables** for the right environment. If a test value must apply to every future Preview branch, choose the **Preview environment**, not the single `preview` branch selector. Changing a value requires a new deployment before the change reaches running code. `VERCEL_ENV` and `NODE_ENV` are supplied by the platform/runtime; do not create project secrets for them.

| Variable name | Purpose and scope |
| --- | --- |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Browser checkout key: Razorpay **test** in Preview, **live** in Production. Public identifier, but it must match the server-side key pair. |
| `RAZORPAY_KEY_ID` | Used by a server-side Razorpay helper; align with the selected environment. |
| `RAZORPAY_KEY_SECRET` | Server-side secret matching that environment's Razorpay key ID. |
| `RAZORPAY_WEBHOOK_SECRET` | Secret for the corresponding test/live Razorpay webhook. Never mix test and live webhook settings. |
| `WHATSAPP_TEST_PHONE_ID` | Meta test sender phone-number ID, **Preview only**. Code checks it against the expected test ID. |
| `WHATSAPP_TEST_TOKEN` | Meta access token authorized for the test sender, **Preview only**. |
| `WHATSAPP_TEST_VERIFY_TOKEN` | Phrase used for Meta's test webhook verification, **Preview only**. It is **not** the API access token. |
| `WHATSAPP_TEST_APP_SECRET` | Meta app secret for verifying Preview webhook signatures, **Preview only**. |
| `WHATSAPP_PHONE_ID` | Live WhatsApp sender ID, **Production**. |
| `WHATSAPP_TOKEN` | Live WhatsApp API access token, **Production**. |
| `WHATSAPP_VERIFY_TOKEN` | Live webhook verification phrase, **Production**. |
| `WHATSAPP_APP_SECRET` | Meta app secret for live webhook signature verification when Production checkout recovery is enabled. |
| `NEXT_PUBLIC_CHECKOUT_RECOVERY_PREVIEW`, `CHECKOUT_RECOVERY_TEST_TEMPLATE`, `CHECKOUT_RECOVERY_TEST_PHONES` | Preview checkout-recovery checkbox, approved test-WABA template, and recipient allowlist. |
| `CHECKOUT_RECOVERY_PRODUCTION_ENABLED`, `NEXT_PUBLIC_CHECKOUT_RECOVERY_PRODUCTION`, `CHECKOUT_RECOVERY_LIVE_TEMPLATE` | Off-by-default server/UI switches and approved live-WABA template for Production checkout recovery. See `docs/checkout-recovery-preview.md` before enabling. |
| `CHECKOUT_RECOVERY_RUN_SECRET` | Separate secret in each environment for the checkout-recovery run and metrics endpoints. Not the existing `CRON_SECRET`. |
| `MONGODB_URI` | Order/chat database. Per current operational setup, test and live orders appear in a shared database/admin dashboard; confirm actual configured targets in Vercel before changing them. |
| `REDIS_URL` | WhatsApp conversation state/deduplication. Preview keys are prefixed in code even if the service is shared. |
| `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO_FALLBACK` | Customer/admin email and general notification settings. Preview tests can still send real email. |
| `GEMINI_API_KEY` | AI-assisted WhatsApp replies. |
| `ADMIN_ID`, `ADMIN_PASSWORD` | Admin access; treat both as secrets. |
| `CRON_SECRET` | Authenticates the scheduled follow-up endpoint; schedule is in `vercel.json`. |
| `NEXT_PUBLIC_BASE_URL` | Fallback for WhatsApp checkout URLs. The webhook normally supplies its request origin; keep the fallback correct anyway. |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_SMS_FROM`, `TWILIO_WHATSAPP_FROM` | Used by general/legacy notification helpers; check route usage before removal. |

`VERCEL_ENV=preview` selects the test-order label and test WhatsApp setup. Local `NODE_ENV=development` also selects the test WhatsApp sender: local development must use **test** credentials and must never fall back to the live number. If Vercel displays **Needs Attention** on a variable, resolve it in the dashboard and redeploy; do not assume an existing deployment picked up the change.

## WhatsApp: test versus live

The current Meta app is **Astro Chatbot**, with a live WhatsApp business account/number and a separate Meta-generated test number. `lib/whatsappEnvironment.ts` expects test phone-number ID `1082615518258503`; the live ID comes from `WHATSAPP_PHONE_ID`. Sender ID, access token, WABA, and webhook subscription must match.

| Environment | Callback URL | Checks |
| --- | --- | --- |
| Production | `https://kundalireport.surabhiastrology.com/api/whatsapp/webhook` | Live verify token and sender. |
| Preview | `https://test.surabhiastrology.com/api/whatsapp/webhook` | Test verify token and sender; `POST` requires valid Meta app signature and matching test phone-number ID. |

Meta may need a **Vercel Protection Bypass for Automation** query parameter on the Preview callback while Deployment Protection is active. Its value is a secret; retrieve it from the Vercel project rather than storing it here. The test WABA uses a callback override/subscription for the same Meta app. Do **not** replace the live app-level callback as a shortcut. Meta's verification request is handled by webhook `GET`; incoming message events are handled by `POST`.

Preview conversation state uses `wa_preview:` Redis prefixes and a separate `whatsapp_preview_chats` Mongo collection. Its checkout links are built from the webhook request origin. Preview welcome media deliberately comes from the public Production host because Meta cannot fetch media behind Preview authentication; checkout links still point to Preview.

**Templates belong to the WhatsApp business account.** The test WABA has an approved checkout-reminder template; payment-confirmation templates may still differ from the live WABA. A Preview Razorpay payment can therefore succeed and send email without sending the same WhatsApp payment template. Confirm template status in the correct WABA before testing template messages. Urgent orders select `payment_priority_en` or `payment_priority_hi`; normal orders select the existing general/career variants in `lib/payment-whatsapp-template.ts`.

Checkout recovery is operational in Preview and production-capable in code but **disabled by default in Production**. Its authenticated runner is separate from the existing daily follow-up cron. Do not enable live recovery before the live template, signed webhook, scheduler, consent review, and end-to-end checks in `docs/checkout-recovery-preview.md` are complete.

## Payments, orders, and Meta

The customer picks a service/plan on common `/checkout`. `lib/checkout-plans.ts` is the price source of truth: the server calculates the charge and does not trust a browser-supplied price. Eligible reports may add **₹199 urgent delivery** (24 hours); this does not automatically apply to consultations. The payment handler confirms Razorpay's order/payment state before saving a paid order. Both the browser callback and Razorpay webhook may complete an order and guard against duplicate order creation.

Preview-created orders are marked `isTestOrder` when `VERCEL_ENV=preview`. The shared admin dashboard and admin email show **TEST ORDER**. They are not real sales. The separate matchmaking repo writes the second person's data under the order's `partner` field; this repo's shared admin dashboard displays those fields.

Meta Pixel/GTM and browser checkout events are gated to `kundalireport.surabhiastrology.com` with a live Razorpay key. The browser Purchase event is intended to fire after verified payment. Preview purchases should not enter the live browser dataset. This does not retroactively correct Ads Manager counts; inspect any separately configured GTM or server-side Conversions API connection before changing attribution. Raw Events Manager browser/server counts are not the same as unique paid orders.

## Preview access and indexing

Preview sends `X-Robots-Tag: noindex`, and Preview page metadata asks search engines not to index. **Noindex is not access control.** Vercel Authentication currently protects Preview, so a test checkout link opened on a personal phone may redirect to Vercel sign-in.

For phone testing without sign-in, the owner can choose a Vercel **Deployment Protection Exception for only `test.surabhiastrology.com`**. This makes that domain and its API routes public, including future deployments, while other protected Preview URLs remain protected. Do not turn protection off project-wide without reviewing shared data and integrations. Check Vercel for the actual exception status; this guide does not claim one has been enabled.

## Test and release checklist

1. Inspect `git status` and keep unrelated files/credentials out of commits. Before changing Next.js code, read the relevant bundled guide under `node_modules/next/dist/docs/` as required by `AGENTS.md`.
2. Run `npm ci` if needed, then `npx tsc --noEmit` and `npm run build`. Local builds may require legitimate development credentials and network access for fonts; do not use Production secrets casually.
3. Deploy to `preview`; check the latest deployment is assigned to `test.surabhiastrology.com` and uses Preview variables. Vercel's deployment button may still show a unique temporary URL.
4. From an allowed tester phone, message `hi` to the **test** WhatsApp number. Check welcome image, language selection, service/plan selection, and a checkout link beginning `https://test.surabhiastrology.com/checkout`.
5. Complete a **Razorpay test-mode** payment with safe test data. Check amount, success page, email, and **TEST ORDER** badge in `/admin/orders`. To test WhatsApp payment confirmation, first verify the required templates exist on the **test** WABA.
6. Confirm Preview did not emit live Meta Purchase events; check live dataset/GTM/CAPI separately if applicable.
7. Promote the tested commit to `master` only after approval. Verify the Production deployment and perform a non-payment smoke test on the live domain. Do not make a live charge solely as a smoke test without business approval.

## Troubleshooting

| Symptom | First checks |
| --- | --- |
| Test link opens Vercel login | Preview protection; use authorized login, controlled shareable link, or an approved exception for only the test domain. |
| Test WhatsApp message gets no reply | Test recipient allowlist, `WHATSAPP_TEST_*` variables, test WABA subscription/override, Vercel logs, incoming sender ID, Meta signature. Do not alter the live callback. |
| WhatsApp checkout link opens the wrong host | Check which webhook received it, Preview domain assignment, and `lib/waFlow.ts` URL construction. |
| Test payment appears in live admin | Expected with the current shared database; find the **TEST ORDER** label. Do not count it as a live sale. |
| Email arrives but WhatsApp confirmation does not | Verify the template in the **test** WABA, language/name, token permissions, and logs. Payment success and template delivery are separate outcomes. |
| Meta shows more purchases than paid orders | Compare order IDs and Razorpay live captures; check Pixel, GTM, CAPI, deduplication, domain restrictions, and historical test events. |

**Handover rule:** Keep actual credentials in the service dashboards/secret manager, and update this guide when a domain, sender, payment setup, shared database, or release process changes.
