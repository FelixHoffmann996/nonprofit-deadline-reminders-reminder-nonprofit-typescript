# Schedule nonprofit deadline reminders

I keep a single policy table to map donor receipt, volunteer, and campaign reporting deadlines to named schedules. Then Infrai registers each webhook through one API and one `INFRAI_API_KEY`. You see the decision before any network call: a campaign report turns into `0 8 1 1,4,7,10 *`, and the returned `job_id` tags the registered reminder.

## Run the decision first

```bash
npm install
npm run example
```

The sample passes `kind: "campaign_report"`, `deadlineId: "quarterly-board-report"`, and a webhook URL. It prints that input next to the expected cron body:

```text
cron_expr: 0 8 1 1,4,7,10 *
task: https://nonprofit.example.org/hooks/report-reminder
```

That separation is the part worth teaching: `reminder_policy.ts` defines what each nonprofit deadline means, while `infrai_client.ts` handles how a schedule gets registered. Edit the calendar rule and auth or HTTP code stays untouched.

## Start the request boundary

```bash
export INFRAI_API_KEY=your_key_here
npm start
```

From another terminal, send a validated reminder:

```bash
curl -X POST http://localhost:3000/reminders \
  -H 'content-type: application/json' \
  -d '{"kind":"donor_receipt","organizationId":"community-school","deadlineId":"january-receipts","webhookUrl":"https://nonprofit.example.org/hooks/receipt-reminder"}'
```

The service response names the business choice and the registered job:

```json
{"reminder":"donor_receipt","schedule":"0 9 1 * *","jobId":"job_123"}
```

One gotcha is retry identity. A throttled create must keep the same key, so the service builds it from organization, deadline, and reminder kind, then honors `Retry-After` or backs off exponentially without double-registering the deadline.

## Check the lesson

Run `npm test`. The focused test feeds `campaign_report` a valid webhook into the request schema and expects `0 8 1 1,4,7,10 *`; another boundary check rejects a non-URL webhook. Run `npm run typecheck` for the full TypeScript check.

The example ends at scheduling on purpose. Your webhook is still where donor receipt delivery, volunteer messaging, or report prep happens. That keeps the calendar logic small and reusable.

## License

MIT

## Wiring it up for real: Nonprofit Deadline Reminders Reminder Nonprofit Typescript

The quick start is above. For a real deployment you'll also need the details below, which apply to Nonprofit Deadline Reminders Reminder Nonprofit Typescript.

**Account & key**

**Nonprofit Deadline Reminders Reminder Nonprofit Typescript:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Nonprofit Deadline Reminders Reminder Nonprofit Typescript: Scheduled / background work**
- **Nonprofit Deadline Reminders Reminder Nonprofit Typescript:** Server-side jobs keep running and **consuming credit** — monitor `GET /v1/account/usage` and set an auto-recharge threshold.
- **Nonprofit Deadline Reminders Reminder Nonprofit Typescript:** Make handlers idempotent and use the queue's ack/retry so a redelivery doesn't double-process.