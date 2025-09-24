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
    console.error("[API/ask] Missing CUSTOMGPT_API_KEY or CUSTOMGPT_PROJECT_ID", { apiKey, projectId });
    return Response.json(
      { ok: false, error: "Missing CUSTOMGPT_API_KEY or CUSTOMGPT_PROJECT_ID", apiKey, projectId },
      { status: 500 }
    );
  }

  // 1) Create conversation
  let convRes, convBody;
  try {
    convRes = await fetch(`${API_BASE}/projects/${projectId}/conversations`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ name: "APC session" }),
      cache: "no-store",
    });
    convBody = await jsonSafe(convRes);
  } catch (err) {
    console.error("[API/ask] Error creating conversation:", err);
    return Response.json(
      { ok: false, step: "create_conversation", error: String(err) },
      { status: 500 }
    );
  }
  if (!convRes.ok) {
    console.error("[API/ask] Conversation creation failed", { status: convRes.status, body: convBody });
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
    console.error("[API/ask] No session_id returned", { convBody });
    return Response.json(
      { ok: false, step: "create_conversation", status: 500, body: convBody, error: "No session_id returned" },
      { status: 500 }
    );
  }

  // 2) Send message
  let msgRes, msgBody;
  try {
    msgRes = await fetch(
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
    msgBody = await jsonSafe(msgRes);
  } catch (err) {
    console.error("[API/ask] Error sending message:", err);
    return Response.json(
      { ok: false, step: "send_message", error: String(err) },
      { status: 500 }
    );
  }
  if (!msgRes.ok) {
    console.error("[API/ask] Message send failed", { status: msgRes.status, body: msgBody });
    return Response.json(
      { ok: false, step: "send_message", status: msgRes.status, body: msgBody },
      { status: msgRes.status }
    );
  }

  return Response.json({ ok: true, data: msgBody?.data ?? msgBody }, { status: 200 });
}