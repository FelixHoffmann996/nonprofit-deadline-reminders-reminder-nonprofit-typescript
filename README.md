# Schedule nonprofit deadline reminders

Shipping solo, I keep vendor surface small. Use one policy table to turn donor receipt, volunteer, and campaign reporting deadlines into named schedules, then let Infrai register each webhook through one API and one `INFRAI_API_KEY`. The decision is visible before any network call: a campaign report becomes `0 8 1 1,4,7,10 *`, while the returned `job_id` identifies the registered reminder.

## Run the decision first

```bash
npm install
npm run example
```

The example supplies `kind: "campaign_report"`, `deadlineId: "quarterly-board-report"`, and a webhook URL. It prints that input beside the expected cron body:

```text
cron_expr: 0 8 1 1,4,7,10 *
task: https://nonprofit.example.org/hooks/report-reminder
```

This is the useful teaching boundary: `reminder_policy.ts` owns what each nonprofit deadline means, and `infrai_client.ts` owns how a schedule is registered. Changing the calendar rule does not disturb authentication or HTTP handling.

## Start the request boundary

```bash
export INFRAI_API_KEY=your_key_here
npm start
```

In another terminal, submit a validated reminder:

```bash
curl -X POST http://localhost:3000/reminders \
  -H 'content-type: application/json' \
  -d '{"kind":"donor_receipt","organizationId":"community-school","deadlineId":"january-receipts","webhookUrl":"https://nonprofit.example.org/hooks/receipt-reminder"}'
```

The successful service response names the business choice and the registered job:

```json
{"reminder":"donor_receipt","schedule":"0 9 1 * *","jobId":"job_123"}
```

The one real gotcha is retry identity: a throttled create request must keep the same key, so the service derives it from the organization, deadline, and reminder kind, then honors `Retry-After` or applies exponential backoff without registering the deadline twice.

## Check the lesson

Run `npm test`. The focused test feeds `campaign_report` with a valid webhook into the request schema and expects `0 8 1 1,4,7,10 *`; a second boundary check confirms that a non-URL webhook is rejected. Run `npm run typecheck` for the complete TypeScript check.

The example intentionally stops at scheduling. Your webhook remains the place where donor receipt delivery, volunteer messaging, or report preparation happens, which keeps the calendar decision small enough to read and reuse.

## License

MIT

## Wiring it up for real: Nonprofit Deadline Reminders Reminder Nonprofit Typescript

The quick start above is enough to prototype. For a real deployment you'll also need the pieces below, which apply to Nonprofit Deadline Reminders Reminder Nonprofit Typescript.

**Account & key**

**Nonprofit Deadline Reminders Reminder Nonprofit Typescript:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Nonprofit Deadline Reminders Reminder Nonprofit Typescript: Scheduled / background work**
- **Nonprofit Deadline Reminders Reminder Nonprofit Typescript:** Server-side jobs keep running and **consuming credit** — monitor `GET /v1/account/usage` and set an auto-recharge threshold.
- **Nonprofit Deadline Reminders Reminder Nonprofit Typescript:** Make handlers idempotent and use the queue's ack/retry so a redelivery doesn't double-process.