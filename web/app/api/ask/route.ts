// web/app/api/ask/route.ts
import { NextResponse } from "next/server";

const API_BASE = "https://app.customgpt.ai/api/v1";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const apiKey = process.env.CUSTOMGPT_API_KEY;
    const projectId = process.env.CUSTOMGPT_PROJECT_ID;

    if (!apiKey || !projectId) {
      return NextResponse.json({ error: "Missing server envs" }, { status: 500 });
    }

    // 1) Start a conversation session
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
      const t = await convRes.text();
      return NextResponse.json({ error: `Conversation error: ${t}` }, { status: 502 });
    }
    const conv = await convRes.json();

    // 2) Ask the question in that session
    const msgRes = await fetch(
      `${API_BASE}/projects/${projectId}/conversations/${conv.session_id}/messages`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ response_source: "default", prompt }),
        cache: "no-store",
      }
    );

    const data = await msgRes.json();
    if (!msgRes.ok) {
      return NextResponse.json({ error: data?.message || "CustomGPT error" }, { status: 502 });
    }

    // Some projects return a string; some return a JSON payload. Normalize:
    let payload: unknown = (data && (data.message ?? data)) as unknown;
    if (typeof payload === "string") {
      try { payload = JSON.parse(payload); } catch { /* string is fine */ }
    }

    return NextResponse.json(payload);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}