import { z } from "zod";

export const reminderRequestSchema = z.object({
  kind: z.enum(["donor_receipt", "volunteer_reminder", "campaign_report"]),
  organizationId: z.string().min(1),
  deadlineId: z.string().min(1),
  webhookUrl: z.string().url(),
});

export type ReminderRequest = z.infer<typeof reminderRequestSchema>;

const schedules: Record<ReminderRequest["kind"], string> = {
  donor_receipt: "0 9 1 * *",
  volunteer_reminder: "0 16 * * 4",
  campaign_report: "0 8 1 1,4,7,10 *",
};

export function chooseReminderSchedule(request: ReminderRequest) {
  return {
    cron_expr: schedules[request.kind],
    task: request.webhookUrl,
  };
}

export function reminderIdempotencyKey(request: ReminderRequest): string {
  return `reminder:${request.organizationId}:${request.deadlineId}:${request.kind}`;
}
