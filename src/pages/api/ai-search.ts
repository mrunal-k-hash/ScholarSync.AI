import type { APIRoute } from 'astro';
import { supabase } from '../../utils/supabase';
import { checkRateLimit } from '../../utils/rateLimit';
import {
  fetchWithFallback,
  getApiKey,
  MAX_TOKENS,
} from '../../utils/openrouterConfig';

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    // 1. Rate Limiting (5 requests per minute per IP for AI search)
    const ip = clientAddress || request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(`ai_search_${ip}`, 5, 60000)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), { 
        status: 429, headers: { 'Content-Type': 'application/json' } 
      });
    }

    // 2. Authentication Check
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: "Unauthorized. Please sign in to run AI Discovery." }), { 
        status: 401, headers: { 'Content-Type': 'application/json' } 
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized. Invalid session." }), { 
        status: 401, headers: { 'Content-Type': 'application/json' } 
      });
    }

    // 3. Validation
    const data = await request.json();
    const profile = data?.profile;
    
    if (!profile || typeof profile !== 'object' || !profile.name) {
      return new Response(JSON.stringify({ error: "A complete profile is required for AI Discovery" }), { 
        status: 400, headers: { 'Content-Type': 'application/json' } 
      });
    }

    // 4. Validate API Key (server-side only)
    try {
      getApiKey();
    } catch {
      return new Response(JSON.stringify({ error: "AI Service is temporarily unavailable due to missing configuration." }), { 
        status: 503, headers: { 'Content-Type': 'application/json' } 
      });
    }

    // 5. Concise prompt to reduce token usage
    const prompt = `You are a Scholarship Expert AI. Student profile:
Name: ${profile.name}, Age: ${profile.age}, Gender: ${profile.gender}
State (India): ${profile.state}, Category: ${profile.category}
Family Income: ₹${profile.familyIncome}/yr, Education: ${profile.educationLevel}
Course: ${profile.currentCourse}, Score: ${profile.percentageOrCgpa}

Find 5 REAL scholarships: 2 from their state/India + 3 international (USA, UK, Australia).
Output ONLY a JSON array (no markdown, no explanation):
[{"id":"unique-id","name":"Name","sponsor":"Sponsor","type":"International|State-Specific|Government","benefitAmount":"amount","deadline":"YYYY-MM-DD","requiredDocuments":["Doc1"],"officialLink":"https://...","description":"Short desc","successChance":85}]`;

    // 6. Fetch using free-model fallback chain (never paid)
    const origin = new URL(request.url).origin;
    const result = await fetchWithFallback(origin, {
      messages: [{ role: "user", content: prompt }],
      max_tokens: MAX_TOKENS,
    });

    let text = result.data.choices?.[0]?.message?.content || "[]";
    
    // Clean up markdown if AI added it
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const scholarships = JSON.parse(text);

    // Map them into MatchResult format
    const formattedResults = scholarships.map((s: any) => {
      return {
        scholarship: {
          id: s.id,
          name: s.name,
          sponsor: s.sponsor,
          type: s.type || "International",
          benefitAmount: s.benefitAmount,
          deadline: s.deadline || "2026-12-31",
          requiredDocuments: s.requiredDocuments || ["Aadhaar", "Marksheet"],
          officialLink: s.officialLink || "#",
          description: s.description || "AI Found Scholarship",
          criteria: {}
        },
        isEligible: true,
        score: s.successChance || 90,
        reasons: [],
        steps: [
          "Verify exact eligibility on the official portal.",
          "Prepare your SOP and Letters of Recommendation.",
          "Check deadline and apply early."
        ],
        successChance: s.successChance || 90
      };
    });

    return new Response(JSON.stringify({
      results: formattedResults
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("[AI-Search] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
