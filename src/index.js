require("dotenv").config();

const Discord = require("discord.js");
const noblox = require("noblox.js");
const config = require("./config.json");
const { MongoClient } = require("mongodb");
const fs = require("fs");

const mongoClient = new MongoClient(
    process.env.mongoURI,
    { useUnifiedTopology: true },
    { useNewUrlParser: true },
    { connectTimeoutMS: 30000 },
    { keepAlive: 1 }
);

const { Client, Intents } = Discord;
const client = new Client({
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
    try {
        await mongoClient.connect();
        console.log("MongoDB - Successful connection");
    } catch (err) {
        console.error(err);
    }
})().catch(console.dir);

// Event Handler
(async () => {
    const files = fs.readdirSync(`../src/events/`).filter((file) => file.endsWith(".js"));
    for (const file of files) {
        const event = require(`../src/events/${file}`);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(client, mongoClient, ...args));
        } else {
            client.on(event.name, (...args) => event.execute(client, mongoClient, ...args));
        }
    }
})().catch(console.error);

// Special Event Handler
(async () => {
    await noblox.setCookie(process.env.cookie).catch(console.error);

    noblox.onJoinRequestHandle(config.group).on("data", (...args) => require(`../src/events/onJoinRequestHandle`)(mongoClient, ...args));
})().catch(console.error);

void client.login(process.env.token);
