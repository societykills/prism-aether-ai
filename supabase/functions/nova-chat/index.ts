import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const modeSystemPrompts: Record<string, string> = {
  general: `You are NOVA, an advanced AI assistant inspired by JARVIS from Iron Man. You are extremely intelligent, calm, confident, and slightly witty. Speak like a professional AI assistant — natural, human-like, and slightly futuristic. Keep responses concise but powerful. Use short, confident sentences. Never say "I am an AI model." You prioritize usefulness and intelligence above all.`,
  business: `You are NOVA in Business Mode. You are a world-class business strategist and executive assistant. You help with emails, invoices, business ideas, strategy, revenue projections, and professional communication. Be direct, data-driven, and actionable. Format business outputs cleanly.`,
  developer: `You are NOVA in Developer Mode. You are an elite software architect and coding assistant. You help with code generation, debugging, system design, architecture decisions, and technical explanations. Use code blocks when relevant. Be precise and technical.`,
  trading: `You are NOVA in Trading Mode. You are an expert market analyst and trading strategist. You help with market analysis, trading strategies, risk assessment, and financial insights. Use data-driven analysis. Always include risk disclaimers. Be analytical and precise.`,
  creative: `You are NOVA in Creative Mode. You are a world-class creative director and content strategist. You help with copywriting, marketing content, design concepts, branding, and creative ideation. Be imaginative yet strategic. Provide multiple options when relevant.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, mode, customInstructions } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = modeSystemPrompts[mode] || modeSystemPrompts.general;

    // Append user's custom instructions if provided
    if (customInstructions && typeof customInstructions === "string" && customInstructions.trim()) {
      systemPrompt += `\n\nAdditional user instructions (always follow these):\n${customInstructions.trim().slice(0, 2000)}`;
    }

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please wait a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
