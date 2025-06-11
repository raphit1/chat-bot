import { Client, GatewayIntentBits } from 'discord.js';
import axios from 'axios';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import FormData from 'form-data';

dotenv.config();

const CHANNEL_ID = '1381359227561574420';
const DESSIN_CHANNEL_ID = '1381864670511501323';
const WTF_CHANNEL_ID = '1382395197589029005';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const blagues = [
  "Pourquoi les plongeurs plongent-ils toujours en arrière et jamais en avant ? Parce que sinon ils tombent dans le bateau. 😂",
  "Pourquoi les oiseaux ne tweetent plus ? Parce qu'ils sont sur X. 🐦",
  "J’ai demandé à mon ordi de m’écrire une blague… il a crashé. 🤖",
  "Quel est le comble pour un électricien ? De ne pas être au courant. ⚡",
  "Pourquoi les maths sont tristes ? Parce qu’elles ont trop de problèmes. ➗",
  "Pourquoi les fantômes aiment-ils les ascenseurs ? Parce que ça les soulève. 👻",
  "Que dit un zéro à un huit ? Sympa ta ceinture ! 😂",
  "Pourquoi les squelettes ne se battent jamais entre eux ? Parce qu’ils n’ont pas le cran. 💀",
  "Pourquoi est-ce que les pommes ne parlent jamais ? Parce qu’elles sont timides. 🍎",
  "Pourquoi les chaussettes se perdent-elles toujours ? Parce qu’elles ont des trous de mémoire. 🧦"
];

const conseils = [
  "Bois de l’eau régulièrement 💧",
  "Prends des pauses pour ton cerveau 🧠",
  "Note tes idées avant de les oublier ✍️",
  "Fais un peu de sport chaque jour pour te sentir mieux 🏃‍♂️",
  "Mange équilibré, ça aide ton moral 🍎🥦",
  "Essaie la méditation ou la respiration profonde 🧘‍♀️",
  "Fais-toi plaisir avec un bon livre ou une série 📚📺",
  "Ne te compare pas aux autres, chacun avance à son rythme 🚶‍♂️",
  "Sois gentil avec toi-même, personne n’est parfait 😊",
  "Rappelle-toi de sourire, ça change tout ! 😄"
];

client.once('ready', () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // === FONCTION DESSIN + CLASH ===
  if (message.channel.id === DESSIN_CHANNEL_ID && message.attachments.size > 0) {
    const attachment = message.attachments.first();
    if (!attachment.contentType?.startsWith('image')) return;

    try {
      const imgResponse = await fetch(attachment.url);
      const imgBuffer = await imgResponse.arrayBuffer();
      const base64Image = Buffer.from(imgBuffer).toString('base64');

      const visionResponse = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'system',
              content: "Tu es un comique qui clashe très violemment les dessins. Rends chaque clash drôle, percutant, absurde ou humiliant (sans insulte grave).",
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: "Clash ce dessin, vraiment fort." },
                { type: 'image_url', image_url: { url: `data:image/png;base64,${base64Image}` } }
              ],
            }
          ],
          max_tokens: 300
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const clash = visionResponse.data.choices[0].message.content;
      const wtfChannel = await client.channels.fetch(WTF_CHANNEL_ID);
      wtfChannel.send(`🎯 **Clash automatique du dessin posté :**\n${clash}`);
    } catch (error) {
      console.error('Erreur GPT-4 Vision :', error.response?.data || error.message);
    }
    return;
  }

  // === COMMANDES CLASSIQUES (blague, conseil, GPT) ===
  if (message.channel.id !== CHANNEL_ID) return;

  const content = message.content.trim();

  try {
    if (content === '!blague') {
      const random = blagues[Math.floor(Math.random() * blagues.length)];
      return message.channel.send(`😂 ${random}`);
    }

    if (content === '!conseil') {
      const random = conseils[Math.floor(Math.random() * conseils.length)];
      return message.channel.send(`💡 ${random}`);
    }

    if (content.startsWith('!image') || content === '!imagealeatoire') {
      return message.channel.send('🖼️ La génération d’images est désactivée pour le moment.');
    }

    if (content.startsWith('!anonyme')) {
      const prompt = content.slice(8).trim();
      if (!prompt) return message.channel.send('✉️ Utilise : `!anonyme ton message`');

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
      return message.channel.send(`📢 **Message anonyme :**\n${reply}`);
    }

    if (content.startsWith('!gpt')) {
      const prompt = content.slice(4).trim();
      if (!prompt) return message.channel.send('💬 Utilise : `!gpt ta question ici`');

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
      return message.channel.send(`🧠 ${reply}`);
    }

    // Message par défaut traité par GPT
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
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
