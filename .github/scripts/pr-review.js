import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { Octokit } from "@octokit/rest";
import { execSync } from "child_process";

dotenv.config();
const History = [];

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const repo = process.env.GITHUB_REPOSITORY;
const [owner, repoName] = repo.split("/");
const prNumber = process.env.GITHUB_REF.split("/")[2];
const token = process.env.GITHUB_TOKEN;

const octokit = new Octokit({ auth: token });

(async () => {
  try {
    // Get the latest diff
    let diff = "";
    try {
      diff = execSync("git diff HEAD^1 HEAD").toString();
    } catch (err) {
      console.warn(" No previous commit found. Using full diff.");
      diff = execSync("git diff").toString();
    }

    const prompt = `
You're an expert AI code reviewer.

Based on the Git diff below, do the following:
1. Summarize the code changes in simple language.
2. Detect any potential **breaking changes** and list them if found.
3. Suggest a suitable GitHub label from: \`bug\`, \`feature\`, \`refactor\`, \`docs\`, \`test\`, \`chore\`.
4. Provide a short code review in **less than 100 words**.
5. Summary should be concise and accurate.
6. **Do not change in code.**
7. ** Remember the 4th point always.**


Format your response like this:

**Summary:**
- ...

**Breaking Changes:**
- ...

**Suggested Label:** \`your-label\`

**Code Review Suggestions:**
- ...
    
Git Diff:
${diff}
`;

    History.push({
      role: "user",
      parts: [{ text: prompt }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: History,
    });

    const aiOutput = response.text;
    console.log(aiOutput);

    // Extract label from AI response
    const labelMatch = aiOutput.match(/Suggested Label:\s*`(.+?)`/);
    const suggestedLabel = labelMatch ? labelMatch[1] : null;

    // Post the comment
    await octokit.issues.createComment({
      owner,
      repo: repoName,
      issue_number: prNumber,
      body: aiOutput,
    });

    console.log("Review comment posted.");

    // Apply the label
    if (suggestedLabel) {
      try {
        await octokit.issues.addLabels({
          owner,
          repo: repoName,
          issue_number: prNumber,
          labels: [suggestedLabel],
        });
        console.log(` Label '${suggestedLabel}' added.`);
      } catch (err) {
        console.warn(" Could not apply label:", err.message);
      }
    } else {
      console.log(" No label detected from AI.");
    }
  } catch (error) {
    console.error(" Error:", error);
    process.exit(1);
  }
})();
