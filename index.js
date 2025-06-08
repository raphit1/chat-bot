require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post("/ask", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: userMessage }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const aiMessage = response.data.choices[0].message.content;
    res.json({ reply: aiMessage });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Erreur avec l’API OpenAI" });
  }
});

app.listen(port, () => {
  console.log(`Serveur IA en ligne sur le port ${port}`);
});
