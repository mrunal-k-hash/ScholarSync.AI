import type { APIRoute } from 'astro';
import { supabase } from '../../utils/supabase';
import { checkRateLimit } from '../../utils/rateLimit';

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

    // 4. Secure API Key Access
    const OPENROUTER_API_KEY = import.meta.env.OPENROUTER_API_KEY || (globalThis as any).process?.env?.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      return new Response(JSON.stringify({ error: "AI Service is temporarily unavailable due to missing configuration." }), { 
        status: 503, headers: { 'Content-Type': 'application/json' } 
      });
    }
    const prompt = `You are a Global Scholarship Expert AI. The user has the following profile:
Name: ${profile.name}
Age: ${profile.age}
Gender: ${profile.gender}
State/Region (India): ${profile.state}
Category: ${profile.category}
Family Income (Annual ₹): ${profile.familyIncome}
Education Level: ${profile.educationLevel}
Current Course: ${profile.currentCourse}
Percentage/CGPA: ${profile.percentageOrCgpa}

Task: Find 5 REAL, highly relevant scholarships for this student. Include 2 from their specific state/India, and 3 prestigious international scholarships (USA, UK, Australia, etc.) they could apply for. 

Output strictly as a JSON array of objects with the following schema, and nothing else (no markdown wrapping, no explanation):
[
  {
    "id": "unique-id",
    "name": "Scholarship Name",
    "sponsor": "Sponsor Name",
    "type": "International" or "State-Specific" or "Government",
    "benefitAmount": "Brief description of amount",
    "deadline": "YYYY-MM-DD",
    "requiredDocuments": ["Doc 1", "Doc 2"],
    "officialLink": "https://link.com",
    "description": "Short description",
    "successChance": 85
  }
]`;

    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-preview", // fast model
        messages: [{ role: "user", content: prompt }]
      })
    });

    const aiData = await aiRes.json();
    let text = aiData.choices?.[0]?.message?.content || "[]";
    
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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
