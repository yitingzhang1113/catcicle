# CatCircle

A Vite + React + TypeScript web app for cat lovers — explore a feed, discover content, and chat with AI assistants (Cat Assistant / Vet Assistant).

## ✨ Features

- **Feed / Discover / Profile / Mall** pages
- **Post creator** for new content
- **AI Assistants**
  - `CatAssistant`: general cat-related help
  - `VetAssistant`: health Q&A (informational only)
- Uses a local mock data layer / local storage for quick iteration

## 🧱 Tech Stack

- React + TypeScript
- Vite

## 🚀 Run locally

### Prerequisites

- Node.js (recommended: LTS)

### Install & start

1. Install dependencies

   ```bash
   npm install
   ```

2. (Optional) Configure Gemini API key

   If you want the AI assistants to work, create a local env file and set your key:

   ```bash
   cp .env.local.example .env.local
   ```

   Then set:

   ```
   VITE_API_KEY=YOUR_KEY_HERE
   ```

   If you don’t have AI configured, the app should still run, but AI features may be disabled.

3. Start the dev server

   ```bash
   npm run dev
   ```

## 🗂️ Project structure (high level)

- `components/` — UI pages & widgets
- `services/` — API / Gemini / local DB helpers
- `mockData.ts` — sample content used in the app

## 🔒 Notes

- `VetAssistant` content is not medical advice. For emergencies or serious concerns, contact a licensed veterinarian.

## 📄 License

Add a license if you plan to open-source this project.
