const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 3000;

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

app.use(cors());
app.use(bodyParser.json());

app.post('/summarize', async (req, res) => {
  const { text } = req.body;

  // Define the pre-prompt
  const prePrompt = "Below is a raw and noisy text conversation, it could be from a meeting, a presentation or even a quick talk and may have many errors word that been translated through a model, your job is to find out the pattern of the conversation and response with a Vietnamese summarized version of the conversation with most important information are extracted correctly:\n\n";
  
  // Combine pre-prompt with the actual text
  const textToSummarize = prePrompt + text;

  console.log('Received text for summarization:', text);

  try {
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    const result = await chatSession.sendMessage(textToSummarize);
    console.log('API response:', result);

    res.json({ summary: result.response.text() });
  } catch (error) {
    console.error('Error summarizing text:', error);
    res.status(500).send('Error summarizing text');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});