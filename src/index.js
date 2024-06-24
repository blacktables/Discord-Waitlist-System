require("dotenv/config");

const {
  Client,
  GatewayIntentBits,
} = require(`discord.js`);


const client = new Client({
  intents: [
    // Most of these are just the basic intents used
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.login(process.env.TOKEN);
