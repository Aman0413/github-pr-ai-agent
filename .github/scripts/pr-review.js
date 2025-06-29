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
    const diff = execSync("git diff HEAD^1 HEAD").toString();

    // PROMPT: summarize + review
    const prompt = `
You are an expert code reviewer and teacher.

1. Summarize the following Pull Request diff in **simple language**.
2. Then review the code and suggest improvements, point out bugs or best practices.

Code Diff:
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

    History.push({
      role: "model",
      parts: [
        {
          text: response.text,
        },
      ],
    });

    console.log(response.text);

    // Post the review to the PR
    await octokit.issues.createComment({
      owner,
      repo: repoName,
      issue_number: prNumber,
      body: `AI Code Summary & Review:\n\n${response.text}`,
    });

    console.log("Review posted.");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
})();
