// web/app/api/ask/route.ts

export const dynamic = "force-dynamic";

const API_BASE = "https://app.customgpt.ai/api/v1";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const apiKey = process.env.CUSTOMGPT_API_KEY!;
    const projectId = process.env.CUSTOMGPT_PROJECT_ID!;
    if (!apiKey || !projectId) {
      return new Response(
        JSON.stringify({ error: "Missing server environment variables" }),
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
      return new Response(JSON.stringify({ error: `Conversation error: ${text}` }), {
        status: 500,
      });
    }

    const conv = await convRes.json();

    // Send the user’s prompt
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
      return new Response(
        JSON.stringify({ error: data?.message || "CustomGPT error" }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify({ data }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}