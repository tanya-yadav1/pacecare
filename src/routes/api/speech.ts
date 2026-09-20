import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const requestSchema = z.object({ text: z.string().trim().min(1).max(1200) });

export const Route = createFileRoute("/api/speech")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = requestSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return Response.json({ message: "There are no instructions to read." }, { status: 400 });
        const apiKey = process.env['LOVABLE_API_KEY'];
        if (!apiKey) return Response.json({ message: "Spoken instructions are not configured." }, { status: 401 });

        let response: Response | null = null;
        for (let attempt = 0; attempt < 2; attempt += 1) {
          if (attempt > 0) {
            const retryAfter = Number(response?.headers.get("retry-after"));
            await new Promise((resolve) => setTimeout(resolve, Number.isFinite(retryAfter) ? retryAfter * 1000 : 750));
          }
          response = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "google/gemini-3.1-flash-tts-preview",
              stream_format: "sse",
              contents: [{ role: "user", parts: [{ text: `Speak slowly, clearly, and warmly: ${parsed.data.text}` }] }],
              generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } },
              },
            }),
          });
          if (response.ok || (response.status !== 429 && response.status < 500)) break;
        }
        if (!response?.ok) {
          const payload = await response?.json().catch(() => null) as { message?: string } | null;
          return Response.json({ message: payload?.message ?? "Spoken instructions are unavailable right now." }, { status: response?.status ?? 502 });
        }
        return new Response(response.body, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-store" } });
      },
    },
  },
});