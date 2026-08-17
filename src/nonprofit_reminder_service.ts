import { createServer } from "node:http";
import { ZodError } from "zod";
import { createInfraiClient, InfraiError } from "./infrai_client.js";
import {
  chooseReminderSchedule,
  reminderIdempotencyKey,
  reminderRequestSchema,
} from "./reminder_policy.js";

const apiKey = process.env.INFRAI_API_KEY;
if (!apiKey) throw new Error("Set INFRAI_API_KEY before starting the service");

const infrai = createInfraiClient(apiKey);
const port = Number(process.env.PORT ?? 3000);

async function readJson(request: import("node:http").IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function reply(response: import("node:http").ServerResponse, status: number, body: unknown) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

const server = createServer(async (request, response) => {
  if (request.method !== "POST" || request.url !== "/reminders") {
    reply(response, 404, { error: "Route not found" });
    return;
  }

  try {
    const reminder = reminderRequestSchema.parse(await readJson(request));
    const schedule = chooseReminderSchedule(reminder);
    const created = await infrai.cron.create(schedule, reminderIdempotencyKey(reminder));
    reply(response, 201, {
      reminder: reminder.kind,
      schedule: schedule.cron_expr,
      jobId: created.job_id,
    });
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) {
      reply(response, 400, { error: "Request body is invalid" });
      return;
    }
    if (error instanceof InfraiError) {
      const status = error.status >= 400 && error.status < 500 ? error.status : 502;
      reply(response, status, { error: error.code, message: error.message });
      return;
    }
    reply(response, 500, { error: "Service request failed" });
  }
});

server.listen(port, () => {
  console.log(`Reminder service listening on http://localhost:${port}`);
});
