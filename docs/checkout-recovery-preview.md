# Checkout recovery — Preview pilot

This pilot is intentionally **Preview only**. It records consent on a submitted checkout, waits at least 60 minutes, checks Razorpay and paid orders, and makes at most one WhatsApp template-send attempt. A half-filled form is not captured. Production never sends these reminders.

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

Vercel's existing cron is for the production follow-up flow; it does **not** run on Preview. This pilot has a separate authenticated endpoint. After 60 minutes from an opted-in test checkout, invoke `POST https://test.surabhiastrology.com/api/checkout-recovery/run` with header `Authorization: Bearer <CHECKOUT_RECOVERY_RUN_SECRET>`. If Vercel Authentication protects the site, the caller also needs an authorized deployment-protection bypass header. Do not put bypass values in the public URL or WhatsApp message. The endpoint can later be connected to a trusted scheduler for automatic testing; it is **not scheduled yet**.

Read `GET https://test.surabhiastrology.com/api/checkout-recovery/metrics` with the same Authorization header for aggregate counts. This reports truly paid orders recovered through the reminder link. It does not fabricate message cost: compare delivered count with actual Meta WhatsApp Manager billing for the test WABA. Test-number messages may have no charge during Meta's trial.

Test cases: no checkbox → no record; checked and unpaid → one reminder; paid before run → none; repeated run → no duplicate; STOP before run → none; STOP after send → future proactive follow-ups suppressed; reminder click followed by captured test payment → one recovered paid order. Use only allowlisted verified test recipients.

Before live rollout, create/approve a separate template in the **live WABA**, review consent wording and privacy notice, provision a production scheduler, and add signature verification to the live WhatsApp webhook before enabling live STOP writes. Remove the Preview-only send guard only after an explicit release decision. Never copy the test token or test phone ID into Production.
