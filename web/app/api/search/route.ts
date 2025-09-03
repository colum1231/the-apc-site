// app/api/search/route.ts
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { q } = await req.json();
    if (!q || typeof q !== "string") {
      return new Response(JSON.stringify({ error: "Missing q" }), { status: 400 });
    }
    // TODO: call CustomGPT or your search aggregator here and return its JSON
    return new Response(JSON.stringify({
      priority: "members",
      members: [],
      transcripts: [],
      resources: [],
      partnerships: [],
      events: [],
    }), { headers: { "content-type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Server error" }), { status: 500 });
  }
}