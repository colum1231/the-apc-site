// app/api/ask/route.ts
import { NextResponse } from "next/server";

const API_BASE = "https://app.customgpt.ai/api/v1";

function getEnv(name: string) {
  const v = process.env[name];
  return (typeof v === "string" && v.trim().length > 0) ? v.trim() : null;
}

async function askCustomGPT(prompt: string) {
  const apiKey = getEnv("CUSTOMGPT_API_KEY");
  const projectId = getEnv("CUSTOMGPT_PROJECT_ID");

  if (!apiKey || !projectId) {
    const missing = [
      !apiKey ? "CUSTOMGPT_API_KEY" : null,
      !projectId ? "CUSTOMGPT_PROJECT_ID" : null,
    ].filter(Boolean);
    return NextResponse.json(
      { ok: false, error: `Missing env: ${missing.join(", ")}` },
      { status: 500 }
    );
  }

  // Create a conversation
  const convRes = await fetch(`${API_BASE}/projects/${projectId}/conversations`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ name: "APC session" }),
    cache: "no-store",
  });

  if (!convRes.ok) {
    const text = await convRes.text();
    return NextResponse.json(
      { ok: false, step: "create_conversation", status: convRes.status, body: text },
      { status: convRes.status || 500 }
    );
  }

  const conv = await convRes.json();
  const sessionId = conv.session_id;

  // Send message
  const msgRes = await fetch(
    `${API_BASE}/projects/${projectId}/conversations/${sessionId}/messages`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ prompt }),
      cache: "no-store",
    }
  );

  const bodyText = await msgRes.text();
  let json: any = null;
  try { json = JSON.parse(bodyText); } catch { /* leave as text */ }

  if (!msgRes.ok) {
    return NextResponse.json(
      { ok: false, step: "send_message", status: msgRes.status, body: json ?? bodyText },
      { status: msgRes.status || 500 }
    );
  }

  const payload = (json && (json.message ?? json)) ?? bodyText;
  return NextResponse.json({ ok: true, data: payload });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  if (!q) return NextResponse.json({ ok: false, error: "Missing q" }, { status: 400 });
  return askCustomGPT(q);
}

export async function POST(req: Request) {
  let q = "";
  try {
    const body = await req.json();
    q = body?.q || body?.prompt || "";
  } catch {
    // ignore
  }
  if (!q) return NextResponse.json({ ok: false, error: "Missing q" }, { status: 400 });
  return askCustomGPT(q);
}