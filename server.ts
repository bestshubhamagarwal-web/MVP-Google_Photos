import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const apiKey = process.env.GEMINI_API_KEY || 'mock-key';
const genAI = new GoogleGenerativeAI(apiKey);

// Load mock embeddings for now (or real if exists)
let embeddings: any[] = [];
try {
  const data = fs.readFileSync(path.join(__dirname, 'data', 'index.json'), 'utf-8');
  embeddings = JSON.parse(data);
} catch (e) {
  console.log("No index.json found, running without local photo data.");
}

app.post('/api/ask', async (req, res) => {
  const { query, history } = req.body;
  
  if (apiKey === 'mock-key') {
    // Mock response if no API key
    return res.json({
      intent: 'search',
      entities: ['photo'],
      timeAnchors: [],
      response: "This is a mocked response since no GEMINI_API_KEY is provided.",
      chips: ["Try another question", "Help me remember"]
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const prompt = `You are an AI assistant helping a user find photos. 
User query: "${query}"
Extract intent, entities, and time anchors. Provide a conversational response.
Output JSON: { "intent": string, "entities": string[], "timeAnchors": string[], "response": string, "chips": string[] }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON from text
    let parsed = { response: text, chips: [], intent: 'unknown', entities: [], timeAnchors: [] };
    try {
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '');
      parsed = JSON.parse(jsonStr);
    } catch(e) {
      console.error("Failed to parse Gemini JSON:", e);
    }

    res.json(parsed);
  } catch (error) {
    console.error("Gemini Error, falling back to mock:", error.message || String(error));
    res.json({
      intent: 'search',
      entities: ['photo'],
      timeAnchors: [],
      response: "This is a fallback mocked response since the Gemini API failed.",
      chips: ["Try another question", "Help me remember"]
    });
  }
});

app.get('/api/photos', (req, res) => {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'data', 'index.json'), 'utf-8');
    const dynamicEmbeddings = JSON.parse(data);
    res.json(dynamicEmbeddings);
  } catch (e) {
    res.json(embeddings); // fallback
  }
});
app.get('/media/:filename', (req, res) => {
  const filename = req.params.filename;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
    <rect width="100%" height="100%" fill="#eee"/>
    <text x="50%" y="50%" font-family="Arial" font-size="24" fill="#333" dominant-baseline="middle" text-anchor="middle">${filename}</text>
  </svg>`);
});
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

export default app; // Required for Vercel
