import type { APIRoute } from 'astro';
import { SCHOLARSHIPS } from '../../utils/scholarshipsDb';
import { supabase } from '../../utils/supabase';
import { checkRateLimit } from '../../utils/rateLimit';

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

    // 4. Secure API Key Access (Never hardcoded)
    const apiKey = import.meta.env.OPENROUTER_API_KEY || (globalThis as any).process?.env?.OPENROUTER_API_KEY;

    if (apiKey) {
      // Direct OpenRouter API Integration
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": new URL(request.url).origin,
          "X-Title": "ScholarSync AI"
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          response_format: { type: "json_object" },
          max_tokens: 4000,
          messages: [
            {
              role: "system",
              content: `You are ScholarSync AI, a highly intelligent AI agent helping students find financial aid, scholarships, and government schemes in India.
              You have access to the following local scholarship database: ${JSON.stringify(SCHOLARSHIPS)}.
              
              Current Student Profile Context:
              ${profile ? JSON.stringify(profile) : 'No profile created yet.'}
              
              Your task is to analyze the conversation and the student's details (such as name, caste category, income, marks, state, disability, course, etc.) and match them with the database.
              
              IMPORTANT: You MUST return a JSON object with exactly two fields:
              1. "response": your markdown-formatted message answering the student's query, showing matched scholarships, calculating their eligibility, or asking for missing details. Keep the response under 250 words, clean, concise and encouraging.
              2. "profile_updates": an object containing any profile details extracted from the student's current message (e.g. name, age, gender, state, category, familyIncome, educationLevel, currentCourse, percentageOrCgpa, disabilityStatus, minorityStatus).
                 - Map state to: "Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Uttar Pradesh", "Gujarat", "West Bengal", or "Rajasthan".
                 - Map category to: "General", "OBC", "SC", "ST".
                 - Map educationLevel to: "School", "Diploma", "Undergraduate", "Postgraduate", "PhD".
                 - Map percentageOrCgpa to a number (0-100 scale or 0-10 scale).
                 - Map disabilityStatus and minorityStatus to booleans.
                 - Only include fields that the student explicitly provided in their messages. Keep other fields undefined or omitted. Do not overwrite fields with null unless the user clears them.
              
              Example JSON output:
              {
                "response": "### Match Found!\\\\n\\\\nBased on your OBC category and income, you are eligible for...",
                "profile_updates": {
                  "category": "OBC",
                  "familyIncome": 150000
                }
              }`
            },
            ...messages
          ]
        })
      });

      if (response.ok) {
        const json = await response.json();
        const text = json.choices?.[0]?.message?.content;
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
          } catch (e) {
            // Fallback if the LLM output is not valid JSON
            return new Response(JSON.stringify({ response: text }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }
      } else {
        const errText = await response.text();
        console.error("OpenRouter API Error:", response.status, errText);
      }
    }

    // High-Fidelity Local Mock / Keyword Fallback Engine
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
