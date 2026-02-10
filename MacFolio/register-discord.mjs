// temporary file run once to register in discord
const APP_ID = process.env.DISCORD_APPLICATION_ID;
const GUILD_ID = process.env.DISCORD_MACFOLIO_SERVER_ID;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

const countOption = {
  name: "count",
  description: "How many latest records to fetch (1–25, default 1)",
  type: 4, // INTEGER
  required: false,
  min_value: 1,
  max_value: 25,
};

const commands = [
  {
    name: "commands",
    description: "List all available commands and how to use them",
  },
  {
    name: "stats",
    description: "MacFolio live overview & top ref tags",
  },
  {
    name: "visitors",
    description: "Latest unique human visitors",
    options: [countOption],
  },
  {
    name: "visits",
    description: "Latest raw visits",
    options: [countOption],
  },
  {
    name: "gmails",
    description: "Latest captured Gmail users",
    options: [countOption],
  },
  {
    name: "bots",
    description: "Latest filtered bots",
    options: [countOption],
  },
  {
    name: "search",
    description: "Search email, city, ISP, or ref tag",
    options: [
      {
        name: "query",
        description: "Keyword to search",
        type: 3, // STRING
        required: true,
      },
    ],
  },
];

const res = await fetch(
  `https://discord.com/api/v10/applications/${APP_ID}/guilds/${GUILD_ID}/commands`,
  {
    method: "PUT",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  }
);

console.log("Status:", res.status);
console.log(await res.json());