import assert from "node:assert/strict";
import test from "node:test";
import { chooseReminderSchedule, reminderRequestSchema } from "../src/reminder_policy.js";

test("quarterly campaign reporting is scheduled on each quarter's first morning", () => {
  const request = reminderRequestSchema.parse({
    kind: "campaign_report",
    organizationId: "reading-room",
    deadlineId: "board-report-2026",
    webhookUrl: "https://nonprofit.example.org/hooks/campaign-report",
  });

  assert.deepEqual(chooseReminderSchedule(request), {
    cron_expr: "0 8 1 1,4,7,10 *",
    task: "https://nonprofit.example.org/hooks/campaign-report",
  });
});

test("a malformed webhook is rejected at the request boundary", () => {
  const parsed = reminderRequestSchema.safeParse({
    kind: "volunteer_reminder",
    organizationId: "reading-room",
    deadlineId: "orientation",
    webhookUrl: "send-email-now",
  });

  assert.equal(parsed.success, false);
});
