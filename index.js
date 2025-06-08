const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const CHANNEL_ID = '1381359227561574420';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.channel.id !== CHANNEL_ID || message.author.bot) return;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message.content }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );

    const reply = response.data.choices[0].message.content;
    message.channel.send(reply);
  } catch (error) {
    console.error('Erreur OpenAI :', error.response?.data || error.message);
    message.channel.send('❌ Je n’ai pas réussi à répondre.');
  }
});

client.login(process.env.DISCORD_TOKEN);
