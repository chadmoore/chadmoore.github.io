/**
 * tag-skills.ts — Automatically tag CV highlights with relevant skills.
 *
 * Reads content/cv.json, sends each experience entry's highlights + the
 * full skill list to OpenAI, and writes back a richer highlight format:
 *
 *   Before: "highlights": ["Designed and implemented secure..."]
 *   After:  "highlights": [{ "text": "Designed and implemented secure...", "skills": ["OAuth 2.0", "REST APIs"] }]
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... npx tsx scripts/tag-skills.ts
 *
 * Or set the env var in your shell and run:
 *   npm run tag-skills
 *
 * The script is idempotent — if highlights are already objects it
 * extracts the .text and re-tags from scratch so you can re-run
 * after editing bullets or adding new skills.
 *
 * // If you're reading this: yes, an AI wrote the tagging code
 * // and another AI does the actual tagging. It's AIs all the way down.
 */

import OpenAI from "openai";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

// ─── Types ──────────────────────────────────────────────────────────

interface RawHighlight {
  text: string;
  skills: string[];
}

interface Experience {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  highlights: (string | RawHighlight)[];
}

interface CvData {
  name: string;
  location: string;
  headline: string;
  summary: string;
  specialties: string[];
  experience: Experience[];
  education: unknown[];
  skills: Record<string, { name: string; proficiency: string; preference?: string; status?: string }[]>;
  certifications: string[];
  links: Record<string, string>;
}

// ─── Helpers ────────────────────────────────────────────────────────

/** Extract plain text from a highlight, whether string or object. */
function highlightText(h: string | RawHighlight): string {
  return typeof h === "string" ? h : h.text;
}

/** Collect every skill name from all categories. */
function allSkillNames(skills: CvData["skills"]): string[] {
  return Object.values(skills)
    .flat()
    .map((s) => s.name);
}

// ─── Main ───────────────────────────────────────────────────────────

async function main() {
  const cvPath = resolve(__dirname, "..", "content", "cv.json");
  const cvData: CvData = JSON.parse(readFileSync(cvPath, "utf-8"));
  const skillNames = allSkillNames(cvData.skills);

  console.log(`Loaded ${cvData.experience.length} experience entries`);
  console.log(`Skill vocabulary: ${skillNames.length} skills across ${Object.keys(cvData.skills).length} categories\n`);

  const client = new OpenAI(); // reads OPENAI_API_KEY from env

  for (const job of cvData.experience) {
    const bulletTexts = job.highlights.map(highlightText);

    console.log(`Tagging: ${job.title} @ ${job.company} (${bulletTexts.length} bullets)...`);

    const prompt = `You are a career data analyst. Given a list of skill names and a set of resume bullet points from a single job, determine which skills are demonstrated in each bullet.

RULES:
- Only use skill names from the provided list — never invent new ones.
- A skill applies if the bullet clearly describes using, building with, or demonstrating that skill. Be conservative.
- Return valid JSON: an array of arrays, where result[i] is the skill names for bullet i.
- Return ONLY the JSON array, no markdown fences, no explanation.

SKILL NAMES:
${JSON.stringify(skillNames)}

BULLET POINTS:
${bulletTexts.map((b, i) => `${i}. ${b}`).join("\n")}`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices[0]?.message?.content?.trim() ?? "[]";

    let taggedSkills: string[][];
    try {
      // Strip markdown fences if present (just in case)
      const cleaned = content.replace(/^```json?\n?/i, "").replace(/\n?```$/i, "");
      taggedSkills = JSON.parse(cleaned);
    } catch (e) {
      console.error(`  ⚠ Failed to parse response for ${job.company}. Skipping.`);
      console.error(`  Raw: ${content.slice(0, 200)}`);
      continue;
    }

    // Validate and apply
    if (!Array.isArray(taggedSkills) || taggedSkills.length !== bulletTexts.length) {
      console.error(`  ⚠ Expected ${bulletTexts.length} entries, got ${taggedSkills.length}. Skipping.`);
      continue;
    }

    // Filter to only valid skill names
    const validNames = new Set(skillNames);
    job.highlights = bulletTexts.map((text, i) => ({
      text,
      skills: (taggedSkills[i] || []).filter((s) => validNames.has(s)),
    }));

    const totalTags = job.highlights.reduce((sum, h) => sum + (h as RawHighlight).skills.length, 0);
    console.log(`  ✓ Tagged ${totalTags} skill references across ${bulletTexts.length} bullets`);
  }

  // Write back
  writeFileSync(cvPath, JSON.stringify(cvData, null, 2) + "\n", "utf-8");
  console.log(`\n✓ Updated ${cvPath}`);
}

main().catch((err) => {
  console.error("Fatal:", err.message ?? err);
  process.exit(1);
});
