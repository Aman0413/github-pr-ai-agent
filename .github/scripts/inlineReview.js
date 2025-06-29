import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getInlineComments(diff) {
  const prompt = `
You're an AI reviewer. Return up to 5 inline review suggestions as JSON:

[
  {
    "file": "src/utils/time.js",
    "line": 10,
    "comment": "Avoid hardcoding the timezone; use \`Intl\`."
  }
]

Git Diff:
${diff}
`;

  const history = [{ role: "user", parts: [{ text: prompt }] }];
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: history,
  });

  return JSON.parse(response.text.trim());
}
