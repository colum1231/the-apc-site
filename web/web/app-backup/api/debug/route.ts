// app/api/debug/route.ts
import { NextResponse } from "next/server";

const API_BASE = "https://app.customgpt.ai/api/v1";

export async function GET() {
  const apiKey = process.env.CUSTOMGPT_API_KEY || "";
  const projectId = process.env.CUSTOMGPT_PROJECT_ID || "";

  const envSummary = {
    hasApiKey: !!apiKey,
    apiKeyPrefix: apiKey ? apiKey.slice(0, 8) : null, // don't leak full key
    projectId,
  };

  // Try the same two-step flow your app uses:
  try {
    // 1) create conversation
    const convRes = await fetch(`${API_BASE}/projects/${projectId}/conversations`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ name: "debug session" }),
      cache: "no-store",
    });

    const convText = await convRes.text();
    let convJson: any = null; try { convJson = JSON.parse(convText); } catch {}

    if (!convRes.ok) {
      return NextResponse.json({
        ok: false,
        where: "create_conversation",
        env: envSummary,
        status: convRes.status,
        body: convJson ?? convText,
      }, { status: 200 });
    }

    const sessionId = convJson?.data?.session_id || convJson?.session_id;

    // 2) send message
    const msgRes = await fetch(
      `${API_BASE}/projects/${projectId}/conversations/${sessionId}/messages`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ prompt: "ping" }),
        cache: "no-store",
      }
    );

    const msgText = await msgRes.text();
    let msgJson: any = null; try { msgJson = JSON.parse(msgText); } catch {}

    return NextResponse.json({
      ok: msgRes.ok,
      env: envSummary,
      status: msgRes.status,
      body: msgJson ?? msgText,
    });
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      where: "exception",
      env: envSummary,
      error: String(e?.message || e),
    }, { status: 200 });
  }
}
