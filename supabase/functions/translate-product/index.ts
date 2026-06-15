import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LANGS: Record<string, string> = {
  en: "English",
  es: "Spanish",
  de: "German",
  fr: "French",
  pt: "Portuguese (Brazil)",
  ja: "Japanese",
  ar: "Arabic",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { name, description } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const prompt = `Translate the product name and description into these languages: ${Object.values(LANGS).join(", ")}.
Return STRICT JSON only, no commentary, shape:
{ "en": {"name": "...", "description": "..."}, "es": {...}, "de": {...}, "fr": {...}, "pt": {...}, "ja": {...}, "ar": {...} }

Keep names natural and concise. Preserve brand/product feel. Do NOT keep the original language if it differs from the target.

NAME: ${name}
DESCRIPTION: ${description || ""}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a precise translator. Output strict JSON only." },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!res.ok) throw new Error(`AI gateway ${res.status}`);
    const data = await res.json();
    let txt: string = data.choices?.[0]?.message?.content || "{}";
    txt = txt.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    const m = txt.match(/\{[\s\S]*\}/);
    const json = JSON.parse(m ? m[0] : txt);

    const translations: Record<string, { name: string; description: string }> = {};
    for (const code of Object.keys(LANGS)) {
      if (json[code]?.name) {
        translations[code] = {
          name: String(json[code].name),
          description: String(json[code].description || ""),
        };
      }
    }
    return new Response(JSON.stringify({ translations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
