require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const { OpenAI } = require('openai');

const app = express();
app.use(express.json());

const API_KEY = process.env.YOUTUBE_API_KEY;
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/fetchTranscript', async (req, res) => {
  const videoId = req.body.videoId;
  try {
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).send('Error fetching transcript');
  }
});

app.post('/fetchSummary', async (req, res) => {
  const transcript = req.body.transcript;
  const prompt = req.body.prompt;
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: transcript },
        { role: 'system', content: `Summarize the video: ${prompt}` },
      ],
    });
    res.json(chatCompletion.choices[0].message.content);
  } catch (error) {
    res.status(500).send('Error fetching summary');
  }
});

// Serve the React app for any other GET requests
app.use(express.static(path.join(__dirname, '../youtube-thumbnail-app/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../youtube-thumbnail-app/build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));