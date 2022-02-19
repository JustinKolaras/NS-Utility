// This is the entry point of the project.

require("dotenv").config({ path: "src/.env" });

const { Client, Intents } = require("discord.js");
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

const init = async () => {
    // Connect to MongoDB
    await mongoClient.connect();
    console.log("MongoDB - Successful connection");

    // Register Events
    const eventFiles = fs.readdirSync("./src/main/listeners/").filter((file) => file.endsWith(".js"));
    for (const file of eventFiles) {
        const event = require(`../src/main/listeners/${file}`);
        if (event.execType === "auto") {
            event.execute();
            continue;
        } else if (event.execType === "bind") {
            if (event.once) {
                discordClient.once(event.name, (...args) => event.execute(...args));
            } else {
                discordClient.on(event.name, (...args) => event.execute(...args));
            }
        }
    }
    console.log("Events Registered");
};

(async () => {
    await init()
        .catch((err) => {
            console.error(err);
            Util.dmUser([config.ownerId], `**Init Error**\n\`\`\`\n${err}\n\`\`\``);
        })
        .then(() => discordClient.login(process.env.token));
})();
