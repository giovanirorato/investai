import { env } from "../../config/env.js";

export type JsonCompletionRequest = {
  systemPrompt: string;
  userPrompt: string;
};

export type JsonCompleter = (request: JsonCompletionRequest) => Promise<unknown | null>;

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

export const openRouterModelVersion = `openrouter:${env.OPENROUTER_MODEL}`;

export const completeJsonWithOpenRouter: JsonCompleter = async (request) => {
  if (!env.OPENROUTER_API_KEY) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.OPENROUTER_TIMEOUT_MS);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: env.OPENROUTER_MODEL,
        response_format: {
          type: "json_object"
        },
        messages: [
          {
            role: "system",
            content: request.systemPrompt
          },
          {
            role: "user",
            content: request.userPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      console.log(response)
      return null;
    }

    const payload = (await response.json()) as OpenRouterResponse;
    const content = payload.choices?.[0]?.message?.content;

    if (!content) {
      return null;
    }
    
    const cleaned = content.trim().replace(/^json\s*/i, "").replace(/\s*$/, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.log(e)
    return null;
  } finally {
    clearTimeout(timeout);
  }
};
