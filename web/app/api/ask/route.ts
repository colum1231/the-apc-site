import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    const response = await fetch("https://api.customgpt.ai/v1/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.CUSTOMGPT_API_KEY}`,
      },
      body: JSON.stringify({
        project_id: process.env.CUSTOMGPT_PROJECT_ID,
        query,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch from CustomGPT" },
      { status: 500 }
    );
  }
}