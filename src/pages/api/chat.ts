import type { APIRoute } from 'astro';
import { SCHOLARSHIPS } from '../../utils/scholarshipsDb';
import { supabase } from '../../utils/supabase';
import { checkRateLimit } from '../../utils/rateLimit';
import {
  fetchWithFallback,
  truncateHistory,
  getApiKey,
  MAX_TOKENS,
} from '../../utils/openrouterConfig';

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    // 1. Rate Limiting (10 requests per minute per IP)
    const ip = clientAddress || request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(`chat_${ip}`, 10, 60000)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment." }), { 
        status: 429, headers: { 'Content-Type': 'application/json' } 
      });
    }

    // 2. Authentication Check
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: "Unauthorized. Please sign in to use the AI chat." }), { 
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
    const body = await request.json();
    if (!body || !Array.isArray(body.messages)) {
      return new Response(JSON.stringify({ error: "Invalid payload. 'messages' array is required." }), { 
        status: 400, headers: { 'Content-Type': 'application/json' } 
      });
    }

    const { messages, profile } = body;
    const lastMessage = messages[messages.length - 1]?.content || "";

    // 4. Validate API Key (server-side only, never exposed to client)
    let hasApiKey = false;
    try {
      getApiKey();
      hasApiKey = true;
    } catch {
      console.warn("[Chat] OPENROUTER_API_KEY not set — falling back to local engine.");
    }

    if (hasApiKey) {
      // ── OpenRouter API with free model fallback chain ──
      // Truncate history to optimize token usage
      const truncatedMessages = truncateHistory(messages);

      // Build a concise scholarship summary instead of full JSON dump
      const scholarshipSummary = SCHOLARSHIPS.slice(0, 30).map(s => 
        `${s.name} (${s.type}) — ${s.benefitAmount}, Deadline: ${s.deadline}`
      ).join('\n');

      // Compact system prompt to reduce token usage
      const systemPrompt = `You are ScholarSync AI, helping Indian students find scholarships and government schemes.

Available scholarships (condensed):
${scholarshipSummary}

Student profile: ${profile ? JSON.stringify(profile) : 'Not created yet.'}

RULES:
- Return JSON with exactly two fields: "response" and "profile_updates"
- "response": markdown-formatted answer (under 200 words, concise, encouraging)
- "profile_updates": object with extracted profile details from the student's current message only
  - state → "Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Uttar Pradesh", "Gujarat", "West Bengal", "Rajasthan"
  - category → "General", "OBC", "SC", "ST"
  - educationLevel → "School", "Diploma", "Undergraduate", "Postgraduate", "PhD"
  - percentageOrCgpa → number (0-100 or 0-10)
  - disabilityStatus, minorityStatus → booleans
  - Only include fields explicitly provided. Omit unknown fields.`;

      try {
        const origin = new URL(request.url).origin;
        const result = await fetchWithFallback(origin, {
          messages: [
            { role: "system", content: systemPrompt },
            ...truncatedMessages,
          ],
          max_tokens: MAX_TOKENS,
          response_format: { type: "json_object" },
        });

        const text = result.data.choices?.[0]?.message?.content;
        if (text) {
          try {
            const parsed = JSON.parse(text);
            return new Response(JSON.stringify({
              response: parsed.response,
              updatedProfile: parsed.profile_updates
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          } catch {
            // Fallback if the LLM output is not valid JSON
            return new Response(JSON.stringify({ response: text }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }
      } catch (aiError: any) {
        console.error("[Chat] All free models failed:", aiError.message);
        // Fall through to the local keyword engine below
      }
    }

    // ── High-Fidelity Local Mock / Keyword Fallback Engine ──
    const query = lastMessage.toLowerCase();
    let responseText = "";
    const fallbackProfileUpdates: any = {};

    // Parse caste category
    if (/\bobc\b/i.test(query)) {
      fallbackProfileUpdates.category = "OBC";
    } else if (/\bsc\b/i.test(query)) {
      fallbackProfileUpdates.category = "SC";
    } else if (/\bst\b/i.test(query)) {
      fallbackProfileUpdates.category = "ST";
    } else if (/\bgeneral\b/i.test(query) || /\bunreserved\b/i.test(query)) {
      fallbackProfileUpdates.category = "General";
    }

    // Parse state
    const states = ["maharashtra", "delhi", "karnataka", "tamil nadu", "uttar pradesh", "gujarat", "west bengal", "rajasthan"];
    for (const st of states) {
      if (query.includes(st)) {
        fallbackProfileUpdates.state = st.charAt(0).toUpperCase() + st.slice(1);
        break;
      }
    }

    // Parse income
    const incomeRegex = /(?:income|salary|earning)\s*(?:is|of)?\s*(?:rs\.?|inr|rupees)?\s*([\d,]+)\b/i;
    const incomeMatch = query.match(incomeRegex);
    if (incomeMatch) {
      const val = parseInt(incomeMatch[1].replace(/,/g, ""));
      if (!isNaN(val)) fallbackProfileUpdates.familyIncome = val;
    } else {
      // General number check for income
      const numMatch = query.match(/\b([1-9]\d{4,6})\b/);
      if (numMatch) {
        const val = parseInt(numMatch[1]);
        if (!isNaN(val)) fallbackProfileUpdates.familyIncome = val;
      }
    }

    // Parse percentage/marks
    const percentageMatch = query.match(/(\d+(?:\.\d+)?)\s*(?:%|percent|percentage|cgpa|marks)\b/i);
    if (percentageMatch) {
      const val = parseFloat(percentageMatch[1]);
      if (!isNaN(val)) fallbackProfileUpdates.percentageOrCgpa = val;
    }

    // Parse special status
    if (query.includes("disable") || query.includes("disability") || query.includes("handicap")) {
      fallbackProfileUpdates.disabilityStatus = true;
    }
    if (query.includes("minority") || query.includes("muslim") || query.includes("christian") || query.includes("sikh")) {
      fallbackProfileUpdates.minorityStatus = true;
    }

    // Build responsive text based on matches
    const activeCategory = fallbackProfileUpdates.category || profile?.category || "General";
    const activeIncome = fallbackProfileUpdates.familyIncome !== undefined ? fallbackProfileUpdates.familyIncome : (profile?.familyIncome || 200000);
    const activeMarks = fallbackProfileUpdates.percentageOrCgpa !== undefined ? fallbackProfileUpdates.percentageOrCgpa : (profile?.percentageOrCgpa || 75);

    const matches = SCHOLARSHIPS.filter(s => {
      if (s.criteria.categories && !s.criteria.categories.includes(activeCategory)) return false;
      if (s.criteria.maxIncome && activeIncome > s.criteria.maxIncome) return false;
      if (s.criteria.minPercentage && activeMarks < s.criteria.minPercentage) return false;
      if (s.criteria.requiresDisability && !fallbackProfileUpdates.disabilityStatus && !profile?.disabilityStatus) return false;
      if (s.criteria.requiresMinority && !fallbackProfileUpdates.minorityStatus && !profile?.minorityStatus) return false;
      return true;
    });

    let profileDesc = `Context parsed: **${activeCategory}** category, Income **₹${activeIncome.toLocaleString('en-IN')}**, Marks **${activeMarks}%**.`;

    if (matches.length > 0) {
      responseText = `### Matching Scholarships Found!\n\n${profileDesc}\n\nHere are the schemes matching your details:\n\n` +
        matches.map(s => `*   **${s.name}** (${s.type})\n    - **Benefit**: ${s.benefitAmount}\n    - **Deadline**: ${s.deadline}\n    - [Official Portal](${s.officialLink})`).join("\n\n") +
        `\n\nTo apply, verify your document checklist in the **Doc Analyzer** page.`;
    } else {
      responseText = `### Scholarship Search\n\n${profileDesc}\n\nCurrently, we couldn't find any exact matches in our database for this specific criteria. Try checking for general schemes or lowering your income limits.`;
    }

    return new Response(JSON.stringify({ 
      response: responseText, 
      updatedProfile: Object.keys(fallbackProfileUpdates).length > 0 ? fallbackProfileUpdates : undefined 
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
