import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const envFiles = [".env.local", ".env"];

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, "utf-8");
  const entries = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const idx = line.indexOf("=");
      if (idx === -1) return null;
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      return [key, value];
    })
    .filter(Boolean);
  return Object.fromEntries(entries);
}

let env = { ...process.env };
for (const envFile of envFiles) {
  env = { ...env, ...readEnvFile(path.join(root, envFile)) };
}

const apiKey = env.VITE_API_KEY?.trim().replace(/^['"]|['"]$/g, "");

if (!apiKey) {
  console.error("Missing VITE_API_KEY. Add it to .env.local or .env and retry.");
  process.exit(1);
}

const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;

const payload = {
  contents: [
    {
      role: "user",
      parts: [{ text: "Say hello in one short sentence." }]
    }
  ]
};

try {
  const listRes = await fetch(listUrl);
  const listData = await listRes.json();

  if (!listRes.ok) {
    console.error("Model list request failed:");
    console.error(JSON.stringify(listData, null, 2));
    process.exit(2);
  }

  const models = Array.isArray(listData.models) ? listData.models : [];
  const runnable = models.find((model) =>
    Array.isArray(model.supportedGenerationMethods) &&
    model.supportedGenerationMethods.includes("generateContent")
  );

  if (!runnable) {
    console.error("No model found that supports generateContent.");
    process.exit(2);
  }

  const modelName = runnable.name;
  const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("API request failed:");
    console.error(JSON.stringify(data, null, 2));
    process.exit(2);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  console.log("API key is valid.");
  console.log(`Model used: ${modelName}`);
  console.log("Sample response:");
  console.log(text || "(no text returned)");
} catch (err) {
  console.error("Request error:", err instanceof Error ? err.message : err);
  process.exit(3);
}
