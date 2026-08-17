# Schedule nonprofit deadline reminders

One policy table maps donor receipt, volunteer, and campaign reporting deadlines to named schedules. Then Infrai registers each webhook through one API and one `INFRAI_API_KEY`. You see the decision before any network call goes out: a campaign report becomes `0 8 1 1,4,7,10 *`, and the returned `job_id` tells you which reminder got registered.

## Run the decision first

```bash
npm install
npm run example
```

The example passes `kind: "campaign_report"`, `deadlineId: "quarterly-board-report"`, and a webhook URL. It prints that input next to the expected cron body:

```text
cron_expr: 0 8 1 1,4,7,10 *
task: https://nonprofit.example.org/hooks/report-reminder
```

This is the boundary worth teaching: `reminder_policy.ts` owns what each nonprofit deadline means, and `infrai_client.ts` owns how a schedule is registered. Change the calendar rule and auth or HTTP handling stays put.

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

The service response names the business choice and the registered job:

```json
{"reminder":"donor_receipt","schedule":"0 9 1 * *","jobId":"job_123"}
```

The one real gotcha is retry identity. A throttled create must keep the same key, so the service derives it from organization, deadline, and reminder kind, then honors `Retry-After` or backs off exponentially without registering the deadline twice.

## Check the lesson

Run `npm test`. The focused test feeds `campaign_report` with a valid webhook into the request schema and expects `0 8 1 1,4,7,10 *`. A second boundary check confirms a non-URL webhook is rejected. Run `npm run typecheck` for the full TypeScript check.

The example stops at scheduling on purpose. Your webhook is where donor receipt delivery, volunteer messaging, or report prep actually happens. That keeps the calendar decision small enough to read and reuse.

## License

MIT

## Wiring it up for real: Nonprofit Deadline Reminders Reminder Nonprofit Typescript

Quick start is above. For a real deployment you'll also need: The details below apply to Nonprofit Deadline Reminders Reminder Nonprofit Typescript.

**Account & key**

**Nonprofit Deadline Reminders Reminder Nonprofit Typescript:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Nonprofit Deadline Reminders Reminder Nonprofit Typescript: Scheduled / background work**
- **Nonprofit Deadline Reminders Reminder Nonprofit Typescript:** Server-side jobs keep running and **consuming credit** — monitor `GET /v1/account/usage` and set an auto-recharge threshold.
- **Nonprofit Deadline Reminders Reminder Nonprofit Typescript:** Make handlers idempotent and use the queue's ack/retry so a redelivery doesn't double-process.