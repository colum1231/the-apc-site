// web/app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const API_BASE = "https://app.customgpt.ai/api/v1";

type SectionKey = "members" | "transcripts" | "resources" | "partnerships" | "events";

export async function POST(req: NextRequest) {
  try {
    const { q } = await req.json() as { q?: string };
    if (!q) return NextResponse.json({ error: "Missing q" }, { status: 400 });

    const apiKey = process.env.CUSTOMGPT_API_KEY!;
    const projectId = process.env.CUSTOMGPT_PROJECT_ID!;
    if (!apiKey || !projectId) {
      return NextResponse.json({ error: "Server missing envs" }, { status: 500 });
    }

    // 1) Start a conversation
    const convRes = await fetch(`${API_BASE}/projects/${projectId}/conversations`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ name: "APC Search Session" }),
      cache: "no-store",
    });
    if (!convRes.ok) {
      return NextResponse.json({ error: "CustomGPT conversation error" }, { status: 500 });
    }
    const conv = await convRes.json();

    // 2) Ask with your strict schema + rules
    const systemPrompt = `
You are the APC Almanac retrieval engine. Return ONLY valid JSON following this schema:

{
  "priority_category": "members" | "transcripts" | "resources" | "partnerships" | "events",
  "sections": {
    "members": [
      { "title": "Name | Role/Industry | TG: @handle // phone",
        "username": "@handle",
        "username_url": "https://t.me/handle",
        "quote": "short, verbatim, from TG",
        "context": "1-line chat context" }
    ],
    "transcripts": [
      { "name": "Speaker | Role",
        "quote": "short, verbatim fragment",
        "context": "1-line situational",
        "title": "Call Title",
        "url": "https://youtube.com/UNLISTED_ID", 
        "source": "Sources_Index_v1.csv" }
    ],
    "resources": [
      { "title": "Short Name | APC Sourced Asset",
        "summary": "why it matters",
        "url": "https://...drive|notion",
        "source": "Resources_Index_v1.csv" }
    ],
    "partnerships": [
      { "description": "Auto-generated relevance line",
        "contact_line": "Name at Business | Role/Category | web1 | web2 | phone",
        "title": "Name at Business",
        "url": "https://primary-link",
        "source": "Partners_Index_v1.csv" }
    ],
    "events": [
      { "title": "Category | Location | Dates | Enquire: 123",
        "url": "https://event-link",
        "source": "Events_Index_v1.csv" }
    ]
  },
  "ordering_right_column": ["transcripts","resources","partnerships","events"],
  "page_info": { "members": {"has_more": false}, "transcripts": {"has_more": false}, "resources": {"has_more": false}, "partnerships": {"has_more": false}, "events": {"has_more": false} }
}

Rules:
- Do NOT fabricate quotes—only include verbatim quotes if found; otherwise leave that item out.
- If a section has no high-confidence matches, return an empty array for that section.
- Default priority_category = "members" unless the query clearly asks for events or “who should I speak to” about a partner service (then "partnerships").
- Max 4 items per section on first page. Provide has_more flags if more exist.
- Titles must be clickable (we’ll render hrefs); for TG members only hyperlink the username_url while keeping the display format.
- Never output any explanation, only the JSON object.

User query: "${q}"
`.trim();

    const msgRes = await fetch(
      `${API_BASE}/projects/${projectId}/conversations/${conv.session_id}/messages`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          response_source: "default",
          prompt: systemPrompt
        }),
        cache: "no-store",
      }
    );

    const raw = await msgRes.json();
    if (!msgRes.ok) {
      return NextResponse.json({ error: raw?.message || "CustomGPT error" }, { status: 500 });
    }

    // The API sometimes nests in .message; sometimes returns string JSON.
    let payload: any = raw.message ?? raw;
    if (typeof payload === "string") {
      try { payload = JSON.parse(payload); } catch (e) {}
    }

    // Minimal guard rails
    const sections = payload?.sections ?? {};
    const priority: SectionKey = payload?.priority_category ?? "members";
    const ordering: SectionKey[] = payload?.ordering_right_column ?? ["transcripts","resources","partnerships","events"];
    const page_info = payload?.page_info ?? {};

    return NextResponse.json({ priority_category: priority, sections, ordering_right_column: ordering, page_info });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}