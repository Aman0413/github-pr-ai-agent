import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getInlineComments(diff) {
  const prompt = `
You're an AI reviewer. Return up to 5 inline review suggestions as JSON array only.

Each suggestion must include:
- file (string)
- line (number)
- comment (string)

Example:

[
  {
    "file": "src/utils/time.js",
    "line": 10,
    "comment": "Avoid hardcoding the timezone; use \`Intl\`."
  }
]

ONLY return a JSON array. No explanations.

Git Diff:
${diff}
`;

  const history = [{ role: "user", parts: [{ text: prompt }] }];
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: history,
  });

  const raw = response.text.trim();
  console.log("AI Inline Output:", raw);

  // Extract valid JSON array using RegExp
  const jsonMatch = raw.match(/\[\s*{[\s\S]*?}\s*]/);
  if (!jsonMatch) {
    console.warn("No valid JSON array found in AI output.");
    return [];
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error("JSON.parse failed:", err.message);
    return [];
  }
}
