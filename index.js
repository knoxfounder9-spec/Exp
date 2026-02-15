const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();
const { prefixCommands, slashCommands } = require("./commands");
const { incrementMsg, getRandomShadow, activeSpawns } = require("./data");

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// ----------------- Automatic Shadow Spawn -----------------
client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  const u = incrementMsg(message.author.id);

  // spawn shadow every 30 messages for fun
  if (u % 30 === 0) {
    const shadow = getRandomShadow();
    activeSpawns[message.guild.id] = shadow;
    message.channel.send({ content: `⚡ A shadow has spawned! Try to catch it!`, files: [shadow.image] });
  }

  // handle prefix commands
  if (!message.content.startsWith("!")) return;
  const args = message.content.slice(1).split(/ +/);
  const cmd = args.shift().toLowerCase();
  if (prefixCommands[cmd]) prefixCommands[cmd](message, args);
});

// ----------------- Slash Commands -----------------
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  const cmd = slashCommands[interaction.commandName];
  if (cmd) await cmd.execute(interaction);
});

// ----------------- Login -----------------
client.login(process.env.TOKEN);
