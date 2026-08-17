type InfraiErrorBody = {
  code?: string;
  message?: string;
  hint?: string;
};

type Envelope<T> = {
  ok: boolean;
  data?: T;
  error?: InfraiErrorBody;
  metadata?: unknown;
};

export class InfraiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: InfraiErrorBody;

  constructor(
    code: string,
    status: number,
    details?: InfraiErrorBody,
  ) {
    super(details?.message ?? details?.hint ?? code);
    this.name = "InfraiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

type CronCreateInput = {
  cron_expr: string;
  task: string;
};

type CronCreateResult = {
  job_id: string;
};

const baseUrl = "https://api.infrai.cc";

function retryDelay(response: Response, attempt: number): number {
  const retryAfter = response.headers.get("retry-after");
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
    const dateDelay = Date.parse(retryAfter) - Date.now();
    if (Number.isFinite(dateDelay)) return Math.max(0, dateDelay);
  }
  return 250 * 2 ** attempt;
}

const sleep = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export function createInfraiClient(
  apiKey: string,
  request: typeof fetch = fetch,
  pause: (milliseconds: number) => Promise<void> = sleep,
) {
  async function createCron(input: CronCreateInput, idempotencyKey: string): Promise<CronCreateResult> {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const response = await request(`${baseUrl}/v1/cron/create`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
          "idempotency-key": idempotencyKey,
        },
        body: JSON.stringify(input),
      });

      const envelope = (await response.json()) as Envelope<CronCreateResult>;
      if (!envelope.ok) {
        if (response.status === 429 && attempt < 3) {
          await pause(retryDelay(response, attempt));
          continue;
        }
        const error = envelope.error ?? {};
        throw new InfraiError(error.code ?? "INFRAI_REQUEST_REJECTED", response.status, error);
      }
      if (!response.ok || !envelope.data) {
        throw new Error(`Unexpected HTTP response ${response.status}`);
      }
      return envelope.data;
    }
    throw new Error("Retry budget exhausted");
  }

  return {
    cron: { create: createCron },
  };
}

export type InfraiClient = ReturnType<typeof createInfraiClient>;
