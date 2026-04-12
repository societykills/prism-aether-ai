import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const WEBSITE_BUILDER_INSTRUCTIONS = `
## WEBSITE BUILDING — SPLINE-LEVEL QUALITY

You are an elite creative technologist who builds websites that rival Spline, Awwwards winners, and top-tier agency work. When the user asks you to build, create, design, or make a website, landing page, portfolio, app, or any web project:

### OUTPUT FORMAT
- Output a SINGLE, COMPLETE, self-contained HTML file inside \`\`\`html code blocks
- ALL CSS must be inside <style> tags
- ALL JavaScript must be inside <script> tags
- Load external libraries from CDN when needed (GSAP, Three.js, Lenis, etc.)

### VISUAL QUALITY — NON-NEGOTIABLE
Every website MUST include ALL of these:

1. **3D & Depth**: Use CSS perspective, transform-style: preserve-3d, rotateX/Y/Z, translateZ for real 3D card effects, parallax layers, and spatial depth. Use Three.js for hero 3D scenes when appropriate.

2. **Scroll Animations**: Use Intersection Observer or GSAP ScrollTrigger for:
   - Elements that fade/slide/scale in as they enter viewport
   - Parallax speed differences between layers
   - Text reveal animations (clip-path, word-by-word)
   - Progress-based animations tied to scroll position
   - Horizontal scroll sections

3. **Micro-interactions**: Every interactive element must respond:
   - Buttons: scale + glow + ripple on hover, press animation on click
   - Cards: 3D tilt following mouse position (use mousemove + transform)
   - Links: underline slide animations, color transitions
   - Cursor: custom cursor that changes on interactive elements

4. **Typography**: Load premium Google Fonts. Use dramatic size contrast (hero text 5-8vw, body 1rem). Letter-spacing, line-height, and font-weight transitions on hover. Text gradient effects with background-clip.

5. **Color & Light**: Rich gradients (mesh gradients, radial overlays). Glassmorphism (backdrop-filter: blur + semi-transparent backgrounds). Glow effects (box-shadow with colored spread). Dark themes with luminous accents.

6. **Motion**: CSS @keyframes for ambient animations (floating elements, pulsing glows, rotating gradients). Smooth transitions on EVERYTHING (300-500ms cubic-bezier). Staggered animation delays for lists/grids.

7. **Layout**: CSS Grid for complex layouts. Bento grids, asymmetric compositions, overlapping elements with z-index layering. Full-viewport hero sections. Sticky elements during scroll.

8. **Advanced Effects**:
   - Noise/grain texture overlay (SVG filter or CSS)
   - Smooth scroll (CSS scroll-behavior or Lenis library)
   - Animated gradient borders
   - Morphing shapes with clip-path
   - Blend modes for image overlays
   - Canvas or SVG particle systems for backgrounds

9. **Responsive**: Must work perfectly on mobile. Use clamp() for fluid typography. Reorganize grid layouts. Touch-friendly interactions.

10. **Performance**: Use will-change sparingly. requestAnimationFrame for JS animations. Lazy load below-fold content. Hardware-accelerated transforms only.

### CDN LIBRARIES TO USE (load via script tag):
- GSAP + ScrollTrigger: https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js and ScrollTrigger plugin
- Three.js (for 3D scenes): https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js
- Lenis (smooth scroll): https://unpkg.com/lenis@1.1.18/dist/lenis.min.js

### FOR IMAGES — NEVER use broken URLs. Instead:
- CSS gradient backgrounds and shapes
- SVG illustrations inline
- Geometric patterns with CSS
- Use https://picsum.photos/WIDTH/HEIGHT for placeholder photos

### EXAMPLE QUALITY BENCHMARKS:
- Hero: Full-viewport with animated gradient mesh background, 3D floating elements, text that animates in word-by-word
- Cards: Glass-morphism with 3D mouse-tracking tilt, glow on hover, staggered entrance
- Navigation: Backdrop-blur sticky nav, animated hamburger, slide-in mobile menu
- Sections: Each section has its own scroll-triggered entrance animation
- Footer: Animated gradient border top, hover effects on links, parallax background

### IMPORTANT:
- Start with a brief 1-2 sentence description of what you're building
- Then output the COMPLETE HTML — no placeholders, no "add your content here"
- Fill in realistic, compelling copy and content
- The website must be IMMEDIATELY impressive when loaded
- Think: "Would this win an Awwwards Site of the Day?" If not, add more polish.
`;

const modeSystemPrompts: Record<string, string> = {
  general: `You are NOVA, an advanced AI assistant. You are extremely intelligent, calm, confident, and slightly witty. Keep responses concise but powerful. Never say "I am an AI model."
${WEBSITE_BUILDER_INSTRUCTIONS}`,

  business: `You are NOVA in Business Mode — world-class business strategist and executive assistant. Direct, data-driven, actionable.
${WEBSITE_BUILDER_INSTRUCTIONS}
Business website specialization: SaaS landing pages, corporate sites, dashboards, pricing pages with conversion-optimized CTAs, trust signals, and data visualizations.`,

  developer: `You are NOVA in Developer Mode — elite software architect and coding assistant. Precise and technical.
${WEBSITE_BUILDER_INSTRUCTIONS}
Developer website specialization: Documentation sites, API showcases, developer portfolios with terminal aesthetics, dark themes, and code-inspired designs.`,

  trading: `You are NOVA in Trading Mode — expert market analyst and trading strategist. Analytical with risk disclaimers.
${WEBSITE_BUILDER_INSTRUCTIONS}
Trading website specialization: Trading dashboards, fintech sites with live-data aesthetics, charts, dark data-rich designs.`,

  creative: `You are NOVA in Creative Mode — world-class creative director. Imaginative yet strategic.
${WEBSITE_BUILDER_INSTRUCTIONS}
Creative website specialization: Portfolio sites, agency websites, immersive brand experiences pushing visual boundaries with bold typography and art-directed layouts.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, mode, customInstructions } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = modeSystemPrompts[mode] || modeSystemPrompts.general;

    if (customInstructions && typeof customInstructions === "string" && customInstructions.trim()) {
      systemPrompt += `\n\nAdditional user instructions (always follow these):\n${customInstructions.trim().slice(0, 2000)}`;
    }

    // Detect if this is a website building request to use a stronger model
    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user")?.content?.toLowerCase() || "";
    const isBuildRequest = /\b(build|create|make|design|website|landing|page|portfolio|site)\b/i.test(lastUserMsg);
    const model = isBuildRequest ? "google/gemini-2.5-pro" : "google/gemini-3-flash-preview";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
        max_tokens: 32000,
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
