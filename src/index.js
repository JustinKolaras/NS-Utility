// This is the entry point of the project.

require("dotenv").config({ path: "src/.env" });

const { Client, Intents } = require("discord.js");
const noblox = require("noblox.js");
const { MongoClient } = require("mongodb");
const fs = require("fs");
const yaml = require("js-yaml");
const Util = require("./main/externals/Util");

global.config = yaml.load(fs.readFileSync("./src/config.yaml", "utf8"));

global.mongoClient = new MongoClient(
    process.env.mongoURI,
    { useUnifiedTopology: true },
    { useNewUrlParser: true },
    { connectTimeoutMS: 30000 },
    { keepAlive: 1 }
);

global.discordClient = new Client({
    // prettier-ignore
    intents: [
        Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILD_MESSAGES, 
        Intents.FLAGS.DIRECT_MESSAGES, 
        Intents.FLAGS.GUILD_MEMBERS,  
        Intents.FLAGS.GUILD_PRESENCES
    ],

    partials: ["CHANNEL"],
});

// MongoDB Server Connection
(async () => {
    await mongoClient.connect();
    console.log("MongoDB - Successful connection");
})().catch((err) => {
    console.error(err);
    Util.dmUser([config.ownerId], `**MongoDB Server Connection Error**\n\`\`\`\n${err}\n\`\`\``);
});

// Event Handler
(async () => {
    const files = fs.readdirSync("./src/main/listeners/").filter((file) => file.endsWith(".js"));
    for (const file of files) {
        const event = require(`../src/main/listeners/${file}`);
        if (event.once) {
            discordClient.once(event.name, (...args) => event.execute(...args));
        } else {
            discordClient.on(event.name, (...args) => event.execute(...args));
        }
    }
})().catch((err) => {
    console.error(err);
    Util.dmUser([config.ownerId], `**Event Handler Error**\n${err}`);
});

// Special Event Handler
(async () => {
    await noblox.setCookie(process.env.cookie).catch(console.error);
    const onJoinRequestHandle = require("../src/main/listeners/onJoinRequestHandle");

    noblox.onJoinRequestHandle(config.group).on("data", onJoinRequestHandle);
})().catch((err) => {
    console.error(err);
    Util.dmUser([config.ownerId], `**Special Event Handler Error**\n${err}`);
});

void discordClient.login(process.env.token);
