require("dotenv").config();

const Discord = require("discord.js");
const fs = require("fs");

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

// Event Handler
(async () => {
    const files = fs.readdirSync(`../src/events/`).filter((file) => file.endsWith(".js"));
    for (const file of files) {
        const event = require(`../src/events/${file}`);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(client, ...args));
        } else {
            client.on(event.name, (...args) => event.execute(client, ...args));
        }
    }
})();

void client.login(process.env.token);
