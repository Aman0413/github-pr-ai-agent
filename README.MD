# 🤖 PR AI Agent – Automated Pull Request Reviewer

A GitHub Action that automatically reviews pull requests using Google Gemini AI. It summarizes code changes, detects breaking changes, suggests labels, and posts inline review comments — all triggered by a pull request event.

---

## 🚀 Features

- 🤖 Automatically reviews PRs using Gemini 2.0 Flash
- 🧠 Summarizes code changes in plain English
- 🔍 Detects potential breaking changes
- 🏷 Suggests GitHub issue labels (e.g., `bug`, `feature`, `refactor`)
- 💬 Posts inline comments with suggestions
- 🔐 Uses GitHub App authentication with Octokit + `@octokit/auth-app`

---

## 🧱 Technologies Used

- [Rohit Negi](https://www.youtube.com/watch?v=SaBD-bBLb3s&t=4137s)
- [Google Gemini](https://ai.google.dev/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Octokit (GitHub REST API client)](https://octokit.github.io/rest.js/)
- Node.js (v18+)
