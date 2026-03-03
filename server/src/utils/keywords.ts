// server/src/utils/keywords.ts

export const STOPWORDS = new Set([
  "a","an","the","and","or","but","if","then","else","when","while","to","of","in","on","for","with","as",
  "is","are","was","were","be","been","being","by","at","from","into","out","up","down","over","under",
  "it","its","this","that","these","those","you","your","we","our","they","their","i","me","my",
  "apply","role","job","work","working","experience","years","year","team","teams","skills","skill",
  "good","great","excellent","strong","ability","responsibilities","responsibility","required","preferred",
  "must","should","will","can","may","etc"
]);

// A solid baseline tech dictionary (you can keep growing this)
export const TECH_TERMS = [
  // languages
  "Java","Kotlin","Swift","Objective-C","JavaScript","TypeScript","Python","C","C++","C#","Go","Rust","Ruby","SQL",
  // mobile
  "Android","iOS","React Native","Jetpack","Jetpack Compose","SwiftUI","UIKit","Xcode","Gradle","Fastlane",
  // web
  "React","Next.js","Angular","Vue","Redux","Zustand","Node.js","Express","HTML","CSS","SCSS","Webpack","Vite",
  // backend/data
  "REST","REST APIs","GraphQL","Microservices","OAuth","JWT","PostgreSQL","MySQL","MongoDB","Redis","Prisma",
  // cloud/devops
  "AWS","EC2","S3","RDS","Lambda","Azure","GCP","Docker","Kubernetes","CI/CD","Jenkins","GitHub Actions",
  // testing
  "Jest","React Testing Library","Enzyme","Cypress","Playwright","JUnit","Mockito",
  // observability
  "Grafana","Prometheus","Splunk","Datadog",
  // security
  "TLS","HTTPS","OWASP","SAST","DAST",
];

function normalizePhrase(s: string) {
  return s.trim().replace(/\s+/g, " ");
}

function isJunkToken(s: string) {
  const t = s.trim();
  if (!t) return true;
  if (t.length < 2) return true;
  if (/^\d+$/.test(t)) return true;
  if (STOPWORDS.has(t.toLowerCase())) return true;
  return false;
}

export function cleanKeywordList(items: any, max = 25): string[] {
  const arr: string[] = Array.isArray(items) ? items : [];
  const cleaned = arr
    .map((x) => normalizePhrase(String(x || "")))
    .filter((x) => !isJunkToken(x))
    .filter((x) => x.length <= 60);

  // de-dupe case-insensitive
  const seen = new Set<string>();
  const out: string[] = [];
  for (const k of cleaned) {
    const key = k.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(k);
    if (out.length >= max) break;
  }
  return out;
}

export function extractTechKeywords(text: string, max = 25): string[] {
  const t = text || "";
  const hits: string[] = [];

  // 1) dictionary match (best signal)
  for (const term of TECH_TERMS) {
    const re = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (re.test(t)) hits.push(term);
  }

  // 2) acronyms / patterns (JWT, CI/CD, REST, SSO, etc.)
  const acronyms = t.match(/\b[A-Z]{2,10}\b/g) || [];
  for (const a of acronyms) {
    if (!isJunkToken(a)) hits.push(a);
  }

  // 3) common tech-ish tokens (kebab/camel packages, libs)
  const techy = t.match(/\b[a-zA-Z]+(?:\.[a-zA-Z]+)+\b/g) || []; // e.g., node.js-like
  for (const x of techy) {
    if (!isJunkToken(x)) hits.push(x);
  }

  return cleanKeywordList(hits, max);
}

export function setDiff(a: string[], b: string[]) {
  const bset = new Set(b.map((x) => x.toLowerCase()));
  return a.filter((x) => !bset.has(x.toLowerCase()));
}

export function setIntersect(a: string[], b: string[]) {
  const bset = new Set(b.map((x) => x.toLowerCase()));
  return a.filter((x) => bset.has(x.toLowerCase()));
}