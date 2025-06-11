import { Client, GatewayIntentBits } from 'discord.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const CHANNEL_GPT_ID = '1381359227561574420'; // salon GPT normal
const CHANNEL_WTF_ID = '1382395197589029005'; // salon WTF
const CHANNEL_HOT_ID = '1382418373010526238'; // salon hot

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const blagues = [
  "Pourquoi les plongeurs plongent-ils toujours en arrière ? Parce que sinon ils tombent dans le bateau.",
  "Pourquoi les maths sont tristes ? Parce qu’elles ont trop de problèmes.",
  "Que dit un zéro à un huit ? Sympa ta ceinture !",
];

const conseils = [
  "Bois de l’eau régulièrement.",
  "Note tes idées avant de les oublier.",
  "Sois gentil avec toi-même, personne n’est parfait.",
];

client.once('ready', () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const content = message.content.trim();

  // === COMMANDES DU CHANNEL WTF ===
  if (message.channel.id === CHANNEL_WTF_ID) {
    if (content === '!blague') {
      const random = blagues[Math.floor(Math.random() * blagues.length)];
      return message.channel.send(`😂 ${random}`);
    }

    if (content === '!conseil') {
      const random = conseils[Math.floor(Math.random() * conseils.length)];
      return message.channel.send(`💡 ${random}`);
    }

    if (content.startsWith('!fusion ')) {
      const prompt = content.slice(8).trim();
      if (!prompt.includes('+')) return message.channel.send('❓ Utilise : `!fusion mot1 + mot2`');

      try {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [{
              role: 'user',
              content: `Fusionne les deux choses suivantes de façon créative et absurde : ${prompt}`,
            }],
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const reply = response.data.choices[0].message.content;
        return message.channel.send(reply);
      } catch (err) {
        return message.channel.send('❌ Erreur lors de la fusion.');
      }
    }

    if (content === '!fusionrandom') {
      try {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [{
              role: 'user',
              content: `Invente une fusion aléatoire totalement absurde entre deux choses imaginaires ou réelles.`,
            }],
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const reply = response.data.choices[0].message.content;
        return message.channel.send(reply);
      } catch (err) {
        return message.channel.send('❌ Erreur de fusion aléatoire.');
      }
    }

    if (content.startsWith('!clash')) {
      const mention = message.mentions.users.first();
      if (!mention) return message.channel.send('❗ Utilise : `!clash @pseudo`');

      const messages = await message.channel.messages.fetch({ limit: 50 });
      const userMessages = messages.filter(m => m.author.id === mention.id).map(m => m.content).slice(0, 5).join('\n');

      const prompt = `Voici des messages d'un utilisateur sur un serveur Discord :\n${userMessages}\n
Réponds avec un clash méchant, agressif, drôle et percutant comme si tu voulais humilier cette personne dans le salon. Utilise du sarcasme, de l'humour noir, sois tranchant. Ne sois pas gentil.`;

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
        return message.channel.send(reply);
      } catch (err) {
        return message.channel.send('❌ Impossible de clasher cette personne.');
      }
    }

    // === MESSAGE LIBRE → Analyse IA (clash / brainrot / neutre)
    try {
      const prompt = `Tu es un bot Discord. Voici le message d'un utilisateur : "${content}"

Réponds selon la tonalité suivante :
- Si c'est agressif → clash bien agressif, drôle, humiliant, dark humour autorisé.
- Si c'est absurde / bizarre / incohérent → réponds de façon débile, random, brainrot.
- Si c'est neutre → réponds de manière idiote, stupide, sans logique.

Sois très percutant. Réponds uniquement par la phrase que tu veux envoyer.`;

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
      return message.channel.send(reply);
    } catch (err) {
      console.error('❌ Erreur GPT dans WTF:', err);
    }
  }

  // === CHANNEL HOT ===
  if (message.channel.id === CHANNEL_HOT_ID) {
    try {
      const prompt = `Tu es un chatbot sexy, provocant, flirty, style dragueur +18. Réponds au message suivant de façon très charmeuse, explicite mais jamais vulgaire ni interdit. Voici le message :\n"${content}"`;

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
      return message.channel.send(reply);
    } catch (err) {
      console.error('❌ Erreur GPT dans HOT:', err);
    }
  }

  // === CHANNEL GPT NORMAL ===
  if (message.channel.id === CHANNEL_GPT_ID) {
    try {
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
      return message.channel.send(reply);
    } catch (err) {
      console.error('❌ Erreur GPT dans GPT:', err);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
