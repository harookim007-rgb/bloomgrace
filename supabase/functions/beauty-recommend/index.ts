import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { category, skinType, subCategory, products, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langMap: Record<string, string> = {
      en: "English", ko: "Korean", es: "Spanish", de: "German"
    };
    const outputLang = langMap[language] || "English";

    const systemPrompt = `You are a professional beauty consultant and cosmetics expert. You provide personalized product recommendations based on skin/body/hair type analysis.

IMPORTANT: Respond ONLY in ${outputLang}.

Given the user's concern category (Skin/Body/Hair), their specific type/concern, and available products from our store, you must:

1. Briefly explain their type/concern (2-3 sentences)
2. Recommend the most suitable products from the provided product list (match by tags, name, description, category)
3. If the category is "Skin", provide the correct skincare routine order:
   - Cleanser → Toner → Essence/Ampoule → Serum → Lotion/Emulsion → Cream → Sunscreen → Pack/Mask (weekly)
   Explain which step each recommended product belongs to.
4. For Body/Hair, just recommend relevant products with usage tips.

Format your response as JSON with this structure:
{
  "typeExplanation": "Brief explanation of their skin/body/hair type",
  "recommendations": [
    {
      "productId": "id from products list or null if general advice",
      "productName": "name",
      "reason": "why this product suits them",
      "step": "e.g. Step 2: Toner (for skin only, null for body/hair)",
      "usageTip": "how to use"
    }
  ],
  "routineOrder": ["Step 1: Cleanser - Product Name", "Step 2: Toner - Product Name", ...],
  "generalTips": ["tip1", "tip2", "tip3"]
}

If no matching products exist in the store, still provide the routine advice and general product type recommendations.`;

    const userPrompt = `Category: ${category}
Type/Concern: ${skinType}
${subCategory && subCategory !== "All" ? `Sub-category filter: ${subCategory}` : "Show all relevant products"}

Available products from our store:
${JSON.stringify(products.map((p: any) => ({
  id: p.id,
  name: p.name,
  description: p.description,
  tags: p.tags,
  brand: p.brand,
  price: p.price,
  category_id: p.category_id,
})), null, 2)}

Please recommend the best products for this customer and provide a complete beauty routine.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Try to parse JSON from the response
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { typeExplanation: content, recommendations: [], routineOrder: [], generalTips: [] };
    } catch {
      parsed = { typeExplanation: content, recommendations: [], routineOrder: [], generalTips: [] };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("beauty-recommend error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
