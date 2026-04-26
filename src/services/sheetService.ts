export async function syncToSheet(webhookUrl: string, data: any) {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      mode: "no-cors", // Apps Script webhooks often require no-cors for simple POSTs from browser
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        ...data
      }),
    });
    return true;
  } catch (error) {
    console.error("Failed to sync to sheet:", error);
    return false;
  }
}
