export async function fetchCustomGPTResults(query: string) {
  // Hardcoded CustomGPT credentials
  const apiKey = "8352|mvmrkQwCNY2JZ72qgUwcbBksdbvq8BJHqDMIWDhl1ca744f6";
  const projectId = 80230;
  const url = "/api/ask";
  const payload = { q: query, apiKey, projectId };
  console.log("CustomGPT (local) fetch URL:", url);
  console.log("CustomGPT (local) fetch method: POST");
  console.log("CustomGPT (local) fetch payload:", JSON.stringify(payload));
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await res.clone().text();
    console.log("CustomGPT (local) fetch status:", res.status);
    console.log("CustomGPT (local) fetch raw response:", text);
    if (!res.ok) {
      console.error(`CustomGPT fetch failed with status ${res.status}. Response:`, text);
      throw new Error(`Failed to fetch CustomGPT results (status: ${res.status})\n${text}`);
    }
    const response = JSON.parse(text);
    console.log("✅ CustomGPT (local) response JSON:", response);
    return response;
  } catch (err) {
    console.error("❌ CustomGPT (local) fetch failed:", err);
    throw err;
  }
}
