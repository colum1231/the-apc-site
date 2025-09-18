export async function fetchCustomGPTResults(query: string) {
  // Call the local API route which handles the correct CustomGPT flow
  const url = "/api/ask";
  const payload = { q: query };
  console.log("CustomGPT (local) fetch URL:", url);
  console.log("CustomGPT (local) fetch method: POST");
  console.log("CustomGPT (local) fetch payload:", JSON.stringify(payload));
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log("CustomGPT (local) fetch status:", res.status);
    const text = await res.clone().text();
    console.log("CustomGPT (local) fetch raw response:", text);
    if (!res.ok) throw new Error("Failed to fetch CustomGPT results");
    const response = JSON.parse(text);
    console.log("✅ CustomGPT (local) response JSON:", response);
    return response;
  } catch (err) {
    console.error("❌ CustomGPT (local) fetch failed:", err);
    throw err;
  }
}
