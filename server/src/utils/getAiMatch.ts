// server/src/utils/getAiMatch.ts

import { cleanKeywordList, extractTechKeywords, setDiff, setIntersect } from "./keywords";

// If you are using an LLM inside this function already, keep it.
// If not, this still produces MUCH better results than random words.

export async function getAiMatch(resumeText: string, jdText: string) {
  // Step A: Extract REAL tech keywords from both
  const resumeTech = extractTechKeywords(resumeText, 30);
  const jdTech = extractTechKeywords(jdText, 30);

  const strengths = setIntersect(resumeTech, jdTech);
  const missing = setDiff(jdTech, resumeTech);

  // Step B: Score
  // simple scoring: intersection ratio
  const denom = Math.max(jdTech.length, 1);
  const raw = Math.round((strengths.length / denom) * 100);
  const score = Math.max(0, Math.min(100, raw));

  // Step C: Summary (professional)
  const summary =
    score >= 80
      ? "Strong match. Your resume covers most of the role’s technical requirements."
      : score >= 60
      ? "Good match. A few key requirements are missing—consider tailoring for the JD."
      : score >= 40
      ? "Moderate match. Several important requirements are missing—tailor skills/projects."
      : "Low match. Many core requirements are missing—update resume to align with the role.";

  // Gaps: missing items (same as missing keywords)
  const gaps = missing;

  return {
    score,
    summary,
    strengths: cleanKeywordList(strengths, 20),
    gaps: cleanKeywordList(gaps, 20),
    missing_keywords: cleanKeywordList(missing, 25),
  };
}