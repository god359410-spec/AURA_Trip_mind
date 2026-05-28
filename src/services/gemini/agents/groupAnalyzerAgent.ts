import { multiAIGenerateJSON } from '../../ai/multiProvider';
import { GroupMember, GroupConstraints, DietaryRestriction, getAgeCategory } from '../../../types/trip.types';

export async function analyzeGroup(members: GroupMember[]): Promise<GroupConstraints> {
  if (members.length === 0) {
    return {
      mobilityRestrictions: [], dietaryRestrictions: [], ageRange: { min: 25, max: 35 },
      hasChildren: false, hasElderly: false, hasInfants: false, pacePreference: 'moderate',
      conflictVectors: [], accessibilityScore: 10, commonInterests: ['sightseeing'],
    };
  }

  const ages = members.map(m => m.age);
  const allDietary = [...new Set(members.flatMap(m => m.dietaryRestrictions))]
    .filter(d => d !== 'none') as DietaryRestriction[];
  const allAccessibility = [...new Set(members.flatMap(m => m.accessibilityNeeds))]
    .filter(a => a !== 'none');
  const hasInfants = members.some(m => m.age < 5);
  const hasChildren = members.some(m => m.age >= 5 && m.age < 13);
  const hasElderly = members.some(m => m.age >= 70);
  const hasSeniors = members.some(m => m.age >= 56);

  const prompt = `You are a travel planning AI. Analyze this group of travelers and return a JSON GroupConstraints object.

Group Members:
${members.map((m, i) => `${i+1}. ${m.name}, Age ${m.age}, Interests: ${m.interests.join(', ') || 'general'}, Dietary: ${m.dietaryRestrictions.join(', ') || 'none'}, Accessibility: ${m.accessibilityNeeds.join(', ') || 'none'}`).join('\n')}

Return ONLY valid JSON with this exact structure:
{
  "mobilityRestrictions": string[],
  "dietaryRestrictions": string[],
  "ageRange": { "min": number, "max": number },
  "hasChildren": boolean,
  "hasElderly": boolean,
  "hasInfants": boolean,
  "pacePreference": "slow" | "moderate" | "fast",
  "conflictVectors": string[],
  "accessibilityScore": number (1-10, 10=fully accessible),
  "commonInterests": string[]
}

Conflict vectors are areas where group members have incompatible preferences (e.g., "adventure_vs_relaxation", "budget_mismatch", "kids_vs_adult_activities").`;

  try {
    // Uses Groq (Llama 3.3 70B) for blazing-fast group analysis
    const { result: aiResult, provider } = await multiAIGenerateJSON<GroupConstraints>(prompt, 'group_analysis');
    console.log(`[GroupAnalyzer] Powered by ${provider}`);
    // Merge AI result with computed values
    return {
      ...aiResult,
      dietaryRestrictions: allDietary,
      ageRange: { min: Math.min(...ages), max: Math.max(...ages) },
      hasChildren: hasChildren || aiResult.hasChildren,
      hasElderly: hasElderly || aiResult.hasElderly,
      hasInfants: hasInfants || aiResult.hasInfants,
      mobilityRestrictions: allAccessibility.length > 0 ? allAccessibility : aiResult.mobilityRestrictions,
    };
  } catch {
    // Fallback: compute from data
    const allInterests = members.flatMap(m => m.interests);
    const interestCounts = allInterests.reduce((acc, i) => ({ ...acc, [i]: (acc[i] || 0) + 1 }), {} as Record<string, number>);
    const commonInterests = Object.entries(interestCounts).filter(([, c]) => c > 1).map(([k]) => k).slice(0, 5);
    
    return {
      mobilityRestrictions: allAccessibility,
      dietaryRestrictions: allDietary,
      ageRange: { min: Math.min(...ages), max: Math.max(...ages) },
      hasChildren,
      hasElderly,
      hasInfants,
      pacePreference: hasSeniors || hasElderly ? 'slow' : hasChildren ? 'moderate' : 'moderate',
      conflictVectors: [],
      accessibilityScore: allAccessibility.length > 0 ? 5 : 10,
      commonInterests: commonInterests.length > 0 ? commonInterests : ['sightseeing', 'food', 'culture'],
    };
  }
}
