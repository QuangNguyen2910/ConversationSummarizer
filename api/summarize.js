const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 3000;

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
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
  const prePrompt = `
Below is a raw and noisy text conversation. It could be from a meeting, a presentation, or a quick talk, and it may have many errors,
especially words that have been mistranslated through a model. Your task is to identify the key points of the conversation and respond
with a summarized version in Vietnamese, extracting the most important information accurately, we also provided an instruction below
for easier understanding.

Instruction:

    ## Original text:

    Hi my name is Kwan. I am an AI engineer at Google. And I am very happy today to show you my project about chatbot.
    Using an open source LLM. Name. Llama three 8 billion parameter. And with this chat bot you will be able. To give it.
    The accessibility. To. Talk to the customers. And. React on their commands like if they want to. Discord there. Products.

    ## Summarized text:

    Người thuyết trình tên là Quang, là một kỹ sư trí tuệ nhân tạo tại Google. Anh ấy đang bắt đầu giới thiệu dự án về chatbot
    sử dụng một mô hình ngôn ngữ lớn (LLM) là Llama 3 8B để trả lời các câu hỏi của khách hàng và thực hiện yêu cầu dựa trên các câu hỏi đó.

## Original text:

${text}

## Summarized text:

`;
  
  // Combine pre-prompt with the actual text
  const textToSummarize = prePrompt;

  console.log('Received text for summarization:', text);

  try {
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    const result = await chatSession.sendMessage(textToSummarize);
    console.log('API response:', result);

    res.json({ summary: result.response.text()});
  } catch (error) {
    console.error('Error summarizing text:', error);
    res.status(500).send('Error summarizing text');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});