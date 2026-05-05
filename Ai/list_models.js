import env from "dotenv";
env.config();

const apiKey = process.env.VITE_API_KEY;

async function main() {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    const names = data.models.map(m => m.name);
    console.log(names.filter(n => !n.includes('embedding') && !n.includes('robotics')));
}

main().catch(console.error);
