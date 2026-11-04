/**
 * Minimal OpenAI-compatible chat client.
 *
 * Configure with ZAI_API_KEY / ZAI_API_BASE (recommended, GLM-4-Flash) or any
 * OpenAI-compatible provider via AI_API_KEY / AI_BASE_URL / AI_MODEL.
 * The key is only ever read on the server.
 */

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export function isLlmConfigured(): boolean {
  return Boolean(process.env.ZAI_API_KEY || process.env.AI_API_KEY);
}

export async function completeChat(
  messages: ChatMessage[],
  options?: { temperature?: number; maxTokens?: number; timeoutMs?: number }
): Promise<string | null> {
  const key = process.env.ZAI_API_KEY ?? process.env.AI_API_KEY;
  if (!key) return null;

  const base =
    process.env.ZAI_API_BASE ??
    process.env.AI_BASE_URL ??
    "https://api.z.ai/api/paas/v4";
  const model =
    process.env.ZAI_MODEL ?? process.env.AI_MODEL ?? "glm-4-flash";

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options?.timeoutMs ?? 15_000
  );

  try {
    const response = await fetch(`${base.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options?.temperature ?? 0.2,
        max_tokens: options?.maxTokens ?? 500,
        stream: false,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error("[llm] request failed:", response.status);
      return null;
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    return content || null;
  } catch (error) {
    console.error("[llm] request error:", error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
