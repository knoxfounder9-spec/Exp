// ----------------- Data and Helpers -----------------
const shadows = [
  { id: "igris", name: "Igris", rarity: "rare", spawnRate: 10, health: 100, damage: 20, image: "https://example.com/igris.png" },
];

const users = {}; // { userId: { exp, level, shadows: {}, totalShadows, msgCount } }
const activeSpawns = {}; // { guildId: shadow }

function initUser(userId) {
  if (!users[userId]) users[userId] = { exp: 0, level: 1, shadows: {}, totalShadows: 0, msgCount: 0 };
  return users[userId];
}

function addExp(userId, amount) {
  const u = initUser(userId);
  u.exp += amount;
  while (u.exp >= u.level * 100) {
    u.exp -= u.level * 100;
    u.level++;
  }
}

function incrementMsg(userId) {
  const u = initUser(userId);
  u.msgCount++;
  return u.msgCount;
}

function getRandomShadow() {
  return shadows[Math.floor(Math.random() * shadows.length)];
}

module.exports = { shadows, users, activeSpawns, initUser, addExp, incrementMsg, getRandomShadow };
