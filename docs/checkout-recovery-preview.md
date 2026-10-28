# Checkout recovery — Preview and Production

Checkout recovery records explicit WhatsApp consent only when a submitted checkout creates a Razorpay order. It does not capture half-filled forms. Before each reminder it checks Razorpay and paid orders, checks STOP opt-outs, and makes at most one template-send attempt. A phone that received a reminder is suppressed for seven days. Preview waits at least two minutes; Production waits at least one hour. The feature is **off by default in Production**.

## Preview configuration

Set these variables in Vercel's **Preview environment** (not Production), then redeploy Preview:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_CHECKOUT_RECOVERY_PREVIEW` | Set to `true` to display the optional checkbox on Preview. |
| `CHECKOUT_RECOVERY_RUN_SECRET` | A new random secret for the protected run and metrics endpoints. |
| `CHECKOUT_RECOVERY_TEST_PHONES` | Comma-separated E.164 digits of verified test recipients, for example `919999999999`. No plus signs. Required fail-closed allowlist. |
| `CHECKOUT_RECOVERY_TEST_TEMPLATE` | Approved test-WABA template name, for example `checkout_reminder_test_en`. |

The existing `WHATSAPP_TEST_PHONE_ID`, `WHATSAPP_TEST_TOKEN`, and Razorpay test keys remain unchanged. Do not paste any token or secret into source control or chat.

## Meta test template

Create and approve a **Marketing** template in the **test WhatsApp Business Account**, language **English** (`en`). Suggested body:

> Radhe Radhe 🙏 You started an order with Surabhi Astrology. If you would still like to complete it, use the button below. If you already paid, please ignore this message. Reply STOP to stop reminders.

Add one URL button labelled **Continue checkout**. Its URL must be:

`https://test.surabhiastrology.com/api/checkout-recovery/continue?token={{1}}`

Supply a harmless sample token when Meta asks for a variable example. The code supplies the actual random token when sending. If Meta changes the template category or rejects the wording, follow its review result and update the configuration; do not send a free-form substitute.

## Running the Preview test

Vercel's existing cron is for the production follow-up flow; it does **not** run this route. After two minutes from an opted-in test checkout, invoke `POST https://test.surabhiastrology.com/api/checkout-recovery/run` with header `Authorization: Bearer <CHECKOUT_RECOVERY_RUN_SECRET>`. If Vercel Authentication protects the site, the caller also needs an authorized deployment-protection bypass header. Do not put bypass values in the public URL or WhatsApp message. This endpoint is **not scheduled yet**.

Read `GET https://test.surabhiastrology.com/api/checkout-recovery/metrics` with the same Authorization header for aggregate counts. This reports truly paid orders recovered through the reminder link. It does not fabricate message cost: compare delivered count with actual Meta WhatsApp Manager billing for the test WABA. Test-number messages may have no charge during Meta's trial.

Test cases: no checkbox → no record; checked and unpaid → one reminder; paid before run → none; repeated run → no duplicate; STOP before run → none; STOP after send → future proactive follow-ups suppressed; reminder click followed by captured test payment → one recovered paid order. Use only allowlisted verified test recipients.

## Production release checklist

Production code can be merged while disabled. Do not enable it until all of the following are complete:

1. Create and approve a separate Marketing reminder template in the **live WABA**, English (`en`), with one dynamic URL button. The live button URL must be `https://kundalireport.surabhiastrology.com/api/checkout-recovery/continue?token={{1}}`. Keep the paid-order disclaimer and STOP instruction in the approved body. The test template and test sender cannot be used for live customers.
2. Review the exact checkout consent wording and privacy notice with the business owner. Consent is unchecked by default and stored with its text and timestamp. Do not use half-filled form data to send messages.
3. Set these variables in the **Production environment only**: `CHECKOUT_RECOVERY_LIVE_TEMPLATE` (approved live template name), `CHECKOUT_RECOVERY_RUN_SECRET` (a separate random Production secret), and `WHATSAPP_APP_SECRET` (the Meta app secret used to verify live webhooks). Keep the existing `WHATSAPP_PHONE_ID` and `WHATSAPP_TOKEN` for the live sender; do not replace them with test credentials. Keep `CHECKOUT_RECOVERY_PRODUCTION_ENABLED` and `NEXT_PUBLIC_CHECKOUT_RECOVERY_PRODUCTION` unset or `false` until the launch decision.
4. Confirm the existing live Meta webhook still points to `/api/whatsapp/webhook` on `kundalireport.surabhiastrology.com` and delivers a valid `x-hub-signature-256` header. As soon as `WHATSAPP_APP_SECRET` is installed in Production and redeployed, invalid signatures are rejected for **all** live webhook traffic, so verify the app secret and live chat flow before proceeding. Leave this secret configured if new recovery sends are later disabled: signed STOP messages and delivery statuses must still be processed.
5. Arrange a trusted external scheduler to call `POST https://kundalireport.surabhiastrology.com/api/checkout-recovery/run` with `Authorization: Bearer <Production CHECKOUT_RECOVERY_RUN_SECRET>` at an appropriate interval. The route is not in `vercel.json`; the existing daily Vercel cron is unrelated and cannot provide an hourly recovery cadence. A successful HTTP 200 only means the batch completed; inspect `checked/sent/skipped/failed` and delivery webhooks.
6. After deployment and configuration, set `CHECKOUT_RECOVERY_PRODUCTION_ENABLED=true` and `NEXT_PUBLIC_CHECKOUT_RECOVERY_PRODUCTION=true` in Production and redeploy. The first enables server-side recording/sending; the second displays the consent checkbox. Both must be true for the Production runner to send. Keep Preview variables scoped to Preview.
7. Verify an unpaid opt-in order, a paid-before-run order, the live return link, a captured recovered payment with admin-email label, STOP, and actual delivered/read statuses. Read aggregate Production metrics using the authenticated `/api/checkout-recovery/metrics` endpoint. Reconcile real message cost in WhatsApp Manager. Disable the two Production flags and redeploy to stop new recovery collection and sends if needed; retain the app secret so prior links, STOP, and delivery callbacks still work. Existing live chatbot/payment flows must be checked after any such change.

Never copy a test token, test phone ID, or Preview webhook bypass into Production. Never paste access tokens, webhook URLs containing bypass values, or recovery return tokens into chat or tickets.
