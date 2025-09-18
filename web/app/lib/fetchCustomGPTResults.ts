export async function fetchCustomGPTResults(query: string) {
  console.log("API key used:", process.env.NEXT_PUBLIC_CUSTOMGPT_API_KEY);
  if (!process.env.NEXT_PUBLIC_CUSTOMGPT_API_KEY) {
    console.error("API key is undefined. Try restarting the dev server to reload .env.local.");
  }
  try {
    const res = await fetch("https://app.customgpt.ai/api/v1/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_CUSTOMGPT_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        project_id: 80230,
        stream: false,
      }),
    });

    console.log("CustomGPT fetch status:", res.status);
    const text = await res.clone().text();
    console.log("CustomGPT fetch raw response:", text);
    console.log("CustomGPT raw response:", res);

    if (!res.ok) throw new Error("Failed to fetch CustomGPT results");
    const response = await res.json();
    console.log("✅ CustomGPT response JSON:", response);
    return response;
  } catch (err) {
    console.error("❌ CustomGPT fetch failed:", err);
    throw err;
  }
}
