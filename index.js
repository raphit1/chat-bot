import { Client, GatewayIntentBits } from 'discord.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const CHANNEL_CHAT = '1381359227561574420'; // salon blagues/conseils/gpt
const CHANNEL_WTF = '1382395197589029005'; // salon wtf (réponses IA selon ton)

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

// Fonction pour analyser le ton du message (simple heuristique)
function detectTone(text) {
  const lower = text.toLowerCase();

  const aggressionKeywords = ['pute', 'connard', 'sale', 'merde', 'ferme ta gueule', 'nique ta mère', 'ta gueule', 'ferme là', 'pute'];
  if (aggressionKeywords.some(w => lower.includes(w))) return 'aggressive';

  const brainrotKeywords = ['lirili', 'tung tung tung', 'brrr', 'patapim', 'sahour', 'pata', 'rot', 'wouf', 'brr', 'bruh'];
  if (brainrotKeywords.some(w => lower.includes(w))) return 'brainrot';

  return 'neutral';
}

// Fonction pour générer la réponse ChatGPT selon le ton
async function generateResponse(tone, userMessage) {
  let systemPrompt = '';

  if (tone === 'aggressive') {
    systemPrompt = "Tu es un bot qui répond en clash très mordant, sarcastique, avec humour noir. Fait bien sentir que tu rends la monnaie de la pièce.";
  } else if (tone === 'brainrot') {
    systemPrompt = "Tu es un bot qui répond avec des phrases absurdes, bizarres, décalées, brain rot, style internet wtf, références à la culture internet.";
  } else {
    systemPrompt = "Tu es un bot qui répond de manière idiote, stupide, drôle, mais pas méchant. Un peu naif.";
  }

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 150,
      temperature: 0.9
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      }
    }
  );

  return response.data.choices[0].message.content.trim();
}

client.once('ready', () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const content = message.content.trim();

  // Commandes dans CHANNEL_CHAT classique
  if (message.channel.id === CHANNEL_CHAT) {
    try {
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

        const reply = await generateResponse('neutral', prompt);
        return message.channel.send(`📢 **Message anonyme :**\n${reply}`);
      }

      if (content.startsWith('!gpt')) {
        const prompt = content.slice(4).trim();
        if (!prompt) return message.channel.send('💬 Utilise : `!gpt ta question ici`');

        const reply = await generateResponse('neutral', prompt);
        return message.channel.send(`🧠 ${reply}`);
      }

      // Par défaut, réponse normale ChatGPT neutre
      const reply = await generateResponse('neutral', content);
      return message.channel.send(reply);

    } catch (error) {
      console.error('Erreur OpenAI :', error.response?.data || error.message);
      return message.channel.send('❌ Je n’ai pas réussi à répondre.');
    }
  }

  // Réponses automatiques dans le salon WTF
  if (message.channel.id === CHANNEL_WTF) {
    if (content.startsWith('!')) return; // ignore commandes

    try {
      const tone = detectTone(content);
      const reply = await generateResponse(tone, content);
      return message.channel.send(reply);
    } catch (error) {
      console.error('Erreur OpenAI WTF :', error.response?.data || error.message);
      return message.channel.send('❌ Pas réussi à répondre dans wtf.');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
