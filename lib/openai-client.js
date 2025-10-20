const fetch = require('node-fetch');

// Simple wrapper that uses environment variable OPENAI_MODEL
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const BASE = 'https://api.openai.com/v1/responses';

if (!OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY not set; AI endpoints will fail until it is configured.');
}

async function ask(prompt, options = {}) {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');

  const body = {
    model: options.model || MODEL,
    input: prompt
  };

  const res = await fetch(BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${t}`);
  }

  const json = await res.json();
  return json;
}

module.exports = { ask };
