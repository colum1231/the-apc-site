// web/app/api/ask/route.ts

export const runtime = "nodejs";           // ensure Node (not Edge)
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const API_BASE = "https://app.customgpt.ai/api/v1";

type AskPayload = { q?: string };

async function jsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    try {
      return await res.text();
    } catch {
      return null;
    }
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  // delegate to POST for single codepath
  return POST(new Request(req.url, { method: "POST", body: JSON.stringify({ q }) }));
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({})));
  const q = body.q || "";
  // Prefer credentials from POST body, fallback to env
  const apiKey = body.apiKey || process.env.CUSTOMGPT_API_KEY;
  const projectId = body.projectId || process.env.CUSTOMGPT_PROJECT_ID;

  if (!apiKey || !projectId) {
    return Response.json(
      { ok: false, error: "Missing CUSTOMGPT_API_KEY or CUSTOMGPT_PROJECT_ID" },
      { status: 500 }
    );
  }

  // 1) Create conversation
  const convRes = await fetch(`${API_BASE}/projects/${projectId}/conversations`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      // NOTE: canonical-cased header
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ name: "APC session" }),
    cache: "no-store",
  });

  const convBody = await jsonSafe(convRes);
  if (!convRes.ok) {
    return Response.json(
      { ok: false, step: "create_conversation", status: convRes.status, body: convBody },
      { status: convRes.status }
    );
  }

  // CustomGPT sometimes nests the payload:
  const sessionId =
    convBody?.data?.session_id ??
    convBody?.session_id ??
    convBody?.data?.id ?? // fallback, just in case
    null;

  if (!sessionId) {
    return Response.json(
      { ok: false, step: "create_conversation", status: 500, body: convBody, error: "No session_id returned" },
      { status: 500 }
    );
  }

  // 2) Send message
  const msgRes = await fetch(
    `${API_BASE}/projects/${projectId}/conversations/${sessionId}/messages`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: q,
        response_source: "default",
      }),
      cache: "no-store",
    }
  );

  const msgBody = await jsonSafe(msgRes);
  if (!msgRes.ok) {
    return Response.json(
      { ok: false, step: "send_message", status: msgRes.status, body: msgBody },
      { status: msgRes.status }
    );
  }

  return Response.json({ ok: true, data: msgBody?.data ?? msgBody }, { status: 200 });
}