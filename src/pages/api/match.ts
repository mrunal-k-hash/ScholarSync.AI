import type { APIRoute } from 'astro';
import { matchScholarships, SCHOLARSHIPS, DEFAULT_PROFILE } from '../../utils/scholarshipsDb';
import { checkRateLimit } from '../../utils/rateLimit';

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    // 1. Rate Limiting (20 requests per minute per IP for matching)
    const ip = clientAddress || request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(`match_${ip}`, 20, 60000)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please slow down." }), { 
        status: 429, headers: { 'Content-Type': 'application/json' } 
      });
    }

    // 2. Validation
    const data = await request.json();
    if (!data || typeof data !== 'object') {
      return new Response(JSON.stringify({ error: "Invalid payload." }), { 
        status: 400, headers: { 'Content-Type': 'application/json' } 
      });
    }

    const profile = data.profile;
    const showAll = data.showAll === true;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // If showAll or no real profile, return ALL scholarships without filtering
    if (showAll || !profile || !profile.name) {
      const allScholarships = SCHOLARSHIPS
        .filter(s => new Date(s.deadline) >= today)
        .map(s => ({
          scholarship: s,
          isEligible: true,
          score: 80,
          reasons: [],
          steps: [
            'Gather your required documents: ' + s.requiredDocuments.join(', ') + '.',
            'Visit the official portal link to submit your details before ' + s.deadline + '.'
          ],
          successChance: 70
        }));

      return new Response(JSON.stringify({
        eligible: allScholarships,
        ineligible: []
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const results = matchScholarships(profile);

    // Filter out expired scholarships
    const validEligible = results.eligible.filter(match => new Date(match.scholarship.deadline) >= today);
    const validIneligible = results.ineligible.filter(match => new Date(match.scholarship.deadline) >= today);
    
    // Add success predictions based on match scores
    const eligibleWithPrediction = validEligible.map(match => {
      let successChance = 50;
      
      const studentMarks = profile.percentageOrCgpa <= 10 ? profile.percentageOrCgpa * 9.5 : profile.percentageOrCgpa;
      if (studentMarks > 85) successChance += 25;
      else if (studentMarks > 70) successChance += 15;
      
      if (profile.familyIncome < 200000) successChance += 20;
      else if (profile.familyIncome < 500000) successChance += 10;
      
      if (profile.disabilityStatus || profile.minorityStatus) successChance += 10;
      
      successChance = Math.min(98, successChance);
      
      return {
        ...match,
        successChance
      };
    });

    const ineligibleWithPrediction = validIneligible.map(match => {
      return {
        ...match,
        successChance: Math.floor(Math.random() * 15)
      };
    });

    return new Response(JSON.stringify({
      eligible: eligibleWithPrediction,
      ineligible: ineligibleWithPrediction
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
