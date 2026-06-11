import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '.env');

function loadLocalEnv(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env is optional when the key is already exported in the shell
  }
}

loadLocalEnv(envPath);

const apiKey = process.env.VITE_GEMINI_API_KEY;

async function main() {
  if (!apiKey) {
    console.error('Missing VITE_GEMINI_API_KEY. Copy Ai/.env.example to Ai/.env and add your key.');
    process.exit(1);
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
  );
  const data = await response.json();

  if (data.error) {
    console.error('API error:', data.error.message);
    process.exit(1);
  }

  const names = (data.models || []).map((m) => m.name);
  console.log(names.filter((n) => !n.includes('embedding') && !n.includes('robotics')));
}

main().catch(console.error);
