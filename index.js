import { Client, GatewayIntentBits } from 'discord.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const CHANNEL_COMMANDES = '1381359227561574420';
const CHANNEL_WTF = '1382395197589029005';
const CHANNEL_DESSIN = '1381864670511501323';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const blagues = [
  "Pourquoi les plongeurs plongent-ils en arrière ? Parce que sinon ils tombent dans le bateau.",
  "Pourquoi les oiseaux ne tweetent plus ? Parce qu'ils sont sur X.",
  "Quel est le comble pour un électricien ? Ne pas être au courant.",
];

const conseils = [
  "Bois de l’eau régulièrement 💧",
  "Fais une pause pour ton cerveau 🧠",
  "Note tes idées avant de les oublier ✍️",
];

client.once('ready', () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const content = message.content.trim();

  // --- COMMANDES (salon principal)
  if (message.channel.id === CHANNEL_COMMANDES) {
    if (content === '!blague') {
      const random = blagues[Math.floor(Math.random() * blagues.length)];
      return message.channel.send(`😂 ${random}`);
    }

    if (content === '!conseil') {
      const random = conseils[Math.floor(Math.random() * conseils.length)];
      return message.channel.send(`💡 ${random}`);
    }

    if (content.startsWith('!anonyme')) {
      const prompt = content.slice(8).trim();
      if (!prompt) return message.channel.send('✉️ Utilise : `!anonyme ton message`');
      return sendToGPT(message, `Écris ce message de façon anonyme : ${prompt}`, true);
    }

    if (content.startsWith('!gpt')) {
      const prompt = content.slice(4).trim();
      if (!prompt) return message.channel.send('💬 Utilise : `!gpt ta question ici`');
      return sendToGPT(message, prompt);
    }
  }

  // --- SALON WTF - réaction automatique
  if (message.channel.id === CHANNEL_WTF) {
    const prompt = `Quel ton a ce message : "${content}" ?
Réponds par : "agressif", "neutre", ou "absurde".
Ensuite, écris une réponse dans le même ton :
- Si agressif → clash court et drôle.
- Si neutre → phrase idiote ou random.
- Si absurde → brain rot délirant.

Formate la réponse uniquement en une seule ligne.`;
    return sendToGPT(message, prompt);
  }

  // --- SALON DESSIN - image → clash dans WTF
  if (message.channel.id === CHANNEL_DESSIN && message.attachments.size > 0) {
    const imageUrl = message.attachments.first().url;

    const prompt = `Regarde cette image : ${imageUrl}
Fais une description méchante, absurde ou moqueuse de façon marrante.
Formule ça comme un clash court.`;
    
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const reply = response.data.choices[0].message.content;
      const channelWtf = await client.channels.fetch(CHANNEL_WTF);
      if (channelWtf) channelWtf.send(`🎨 Clash du dessin :\n${reply}`);
    } catch (err) {
      console.error('Erreur image/GPT :', err.response?.data || err.message);
    }
  }
});

// --- Fonction envoi vers GPT
async function sendToGPT(message, prompt, anonym = false) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    message.channel.send(anonym ? `📢 **Message anonyme :**\n${reply}` : `🧠 ${reply}`);
  } catch (error) {
    console.error('Erreur GPT :', error.response?.data || error.message);
    message.channel.send('❌ Je n’ai pas réussi à répondre.');
  }
}

client.login(process.env.DISCORD_TOKEN);
