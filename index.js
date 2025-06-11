import { Client, GatewayIntentBits } from 'discord.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const CHANNEL_GPT_ID = '1381359227561574420'; // salon GPT normal
const CHANNEL_WTF_ID = '1382395197589029005'; // salon WTF

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

    if (content === '!fusion') {
      return message.channel.send('🧬 Fusion de deux trucs inutiles... Résultat : Twitter + ChatGPT = TwiGPT.');
    }

    if (content === '!fusionrandom') {
      return message.channel.send('💥 Fusion aléatoire : Fromage + iPhone = iBrie.');
    }

    if (content === '!clash') {
      return message.channel.send('💥 Toi t\'es le genre de gars à chercher "404 not found" sur Google.');
    }

    if (content === '!troll') {
      return message.channel.send('🧌 Arrête de parler, ton micro fait saigner mes circuits.');
    }

    if (content.startsWith('!anonyme')) {
      const prompt = content.slice(8).trim();
      if (!prompt) return message.channel.send('✉️ Utilise : `!anonyme ton message`');

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
        return message.channel.send(`📢 **Message anonyme :**\n${reply}`);
      } catch (err) {
        return message.channel.send('❌ Erreur OpenAI.');
      }
    }

    if (content.startsWith('!gpt')) {
      const prompt = content.slice(4).trim();
      if (!prompt) return message.channel.send('💬 Utilise : `!gpt ta question ici`');

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
        return message.channel.send(`🧠 ${reply}`);
      } catch (err) {
        return message.channel.send('❌ Erreur OpenAI.');
      }
    }

    // === MESSAGE LIBRE → Analyse IA (clash / brainrot / neutre)
    try {
      const prompt = `Tu es un bot Discord. Voici le message d'un utilisateur : "${content}"\n\nRéponds selon la tonalité suivante :
- Si c'est agressif → réponds avec un clash bien agressif, drôle, humiliant, dark humour autorisé.
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
