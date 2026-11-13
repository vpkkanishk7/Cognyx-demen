const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

async function generateCompletionGemini(prompt, systemPrompt = null, jsonMode = false) {
  if (!genAI) throw new Error("GEMINI_API_KEY not configured");

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), 15000);

  try {
    const modelOptions = {
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash"
    };
    if (systemPrompt) {
      modelOptions.systemInstruction = systemPrompt;
    }
    const model = genAI.getGenerativeModel(modelOptions);

    const genConfig = {
      maxOutputTokens: 2000
    };
    if (jsonMode) {
      genConfig.responseMimeType = "application/json";
    }

    const response = await model.generateContent(
      { contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: genConfig },
      { signal: abortController.signal }
    );
    clearTimeout(timeoutId);
    return response.response.text();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

module.exports = { genAI, generateCompletionGemini };
