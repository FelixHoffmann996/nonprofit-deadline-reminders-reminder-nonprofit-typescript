import { reminderRequestSchema, chooseReminderSchedule } from "./reminder_policy.js";

const request = reminderRequestSchema.parse({
  kind: "campaign_report",
  organizationId: "learning-library",
  deadlineId: "quarterly-board-report",
  webhookUrl: "https://nonprofit.example.org/hooks/report-reminder",
});

console.log({ input: request, expectedSchedule: chooseReminderSchedule(request) });
