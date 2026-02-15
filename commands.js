const { SlashCommandBuilder } = require("discord.js");
const { shadows, activeSpawns, initUser, addExp, getRandomShadow } = require("./data");

// ----------------- Prefix Commands -----------------
const prefixCommands = {
  arise: (message, args) => {
    const userId = message.author.id;
    const guildId = message.guild.id;
    const spawn = activeSpawns[guildId];
    if (!spawn) return message.reply("❌ No shadow has spawned!");
    const guess = args[0]?.toLowerCase();
    if (!guess) return message.reply("Usage: !arise <shadow>");
    const u = initUser(userId);

    if (u.shadows[spawn.id] >= 3) return message.reply("❌ You already have 3 of this shadow!");
    if (guess === spawn.id) {
      u.shadows[spawn.id] = (u.shadows[spawn.id] || 0) + 1;
      u.totalShadows++;
      delete activeSpawns[guildId];
      message.reply(`✅ You caught **${spawn.name}**!`);
    } else message.reply("❌ Wrong name!");
  },

  inventory: (message) => {
    const u = initUser(message.author.id);
    let text = `**Inventory:** Level ${u.level}, EXP ${u.exp}\n`;
    if (u.totalShadows === 0) text += "No shadows yet.";
    else for (const sid in u.shadows) {
      const s = shadows.find(x => x.id === sid);
      text += `${s.name}: ${u.shadows[sid]}\n`;
    }
    message.reply(text);
  },

  level: (message) => {
    const u = initUser(message.author.id);
    message.reply(`Level: ${u.level} | EXP: ${u.exp}`);
  },

  admin: (message, args) => {
    if (!message.member.permissions.has("ADMINISTRATOR")) return message.reply("❌ Admin only.");
    const sub = args[0]?.toLowerCase();

    if (sub === "addexp") {
      const user = message.mentions.users.first();
      const amount = parseInt(args[2]);
      if (!user || isNaN(amount)) return message.reply("Usage: !admin addexp <@user> <amount>");
      addExp(user.id, amount);
      return message.reply(`✅ Added ${amount} EXP to ${user.username}`);
    }

    if (sub === "addshadow") {
      const user = message.mentions.users.first();
      const name = args[2];
      const rarity = args[3];
      const spawnRate = parseInt(args[4]);
      const health = parseInt(args[5]);
      const damage = parseInt(args[6]);
      const image = args[7];
      if (!user || !name || !rarity || isNaN(spawnRate) || isNaN(health) || isNaN(damage) || !image)
        return message.reply("Usage: !admin addshadow <@user> <Name> <Rarity> <SpawnRate> <Health> <Damage> <ImageURL>");

      const id = name.toLowerCase();
      const s = { id, name, rarity, spawnRate, health, damage, image };
      shadows.push(s);
      return message.reply(`✅ Shadow **${name}** added successfully!`);
    }

    if (sub === "spawnshadow") {
      const name = args[1];
      const s = shadows.find(x => x.id === name.toLowerCase());
      if (!s) return message.reply("❌ Shadow not found!");
      activeSpawns[message.guild.id] = s;
      message.channel.send({ content: `⚡ A shadow has spawned!`, files: [s.image] });
    }
  },
};

// ----------------- Slash Commands -----------------
const slashCommands = {
  arise: {
    data: new SlashCommandBuilder()
      .setName("arise")
      .setDescription("Catch a shadow")
      .addStringOption(opt => opt.setName("shadow").setDescription("Shadow ID").setRequired(true)),
    execute: async (interaction) => {
      const userId = interaction.user.id;
      const guildId = interaction.guild.id;
      const spawn = activeSpawns[guildId];
      if (!spawn) return interaction.reply("❌ No shadow has spawned!");
      const guess = interaction.options.getString("shadow").toLowerCase();
      const u = initUser(userId);
      if (u.shadows[spawn.id] >= 3) return interaction.reply("❌ Max 3 of this shadow!");
      if (guess === spawn.id) {
        u.shadows[spawn.id] = (u.shadows[spawn.id] || 0) + 1;
        u.totalShadows++;
        delete activeSpawns[guildId];
        return interaction.reply(`✅ You caught **${spawn.name}**!`);
      } else return interaction.reply("❌ Wrong name!");
    }
  },

  inventory: {
    data: new SlashCommandBuilder().setName("inventory").setDescription("Check your inventory"),
    execute: async (interaction) => {
      const u = initUser(interaction.user.id);
      let text = `**Inventory:** Level ${u.level} | EXP ${u.exp}\n`;
      if (u.totalShadows === 0) text += "No shadows yet.";
      else for (const sid in u.shadows) {
        const s = shadows.find(x => x.id === sid);
        text += `${s.name}: ${u.shadows[sid]}\n`;
      }
      interaction.reply(text);
    }
  },

  level: {
    data: new SlashCommandBuilder().setName("level").setDescription("Check your level"),
    execute: async (interaction) => {
      const u = initUser(interaction.user.id);
      interaction.reply(`Level: ${u.level} | EXP: ${u.exp}`);
    }
  }
};

module.exports = { prefixCommands, slashCommands };
