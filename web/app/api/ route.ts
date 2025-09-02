// web/app/api/ask/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://app.customgpt.ai/api/v1";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt) return NextResponse.json({ error: "Missing prompt" }, { status: 400 });

    const apiKey = process.env.CUSTOMGPT_API_KEY!;
    const projectId = process.env.CUSTOMGPT_PROJECT_ID!;
    if (!apiKey || !projectId) {
      return NextResponse.json({ error: "Missing server envs" }, { status: 500 });
    }

    // 1) start session
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
    const conv = await convRes.json();

    // 2) send message
    const msgRes = await fetch(`${API_BASE}/projects/${projectId}/conversations/${conv.session_id}/messages`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ response_source: "default", prompt }),
      cache: "no-store",
    });

    const data = await msgRes.json();
    let payload: any = data?.message ?? data;
    if (typeof payload === "string") {
      try { payload = JSON.parse(payload); } catch {}
    }
    return NextResponse.json(payload);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}