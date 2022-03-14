// This is the entry point of the project.

require("dotenv").config({ path: "src/.env" });

const { Client, Intents } = require("discord.js");
const { MongoClient } = require("mongodb");
const yaml = require("js-yaml");
const fs = require("fs");
const Initializer = require("./main/startup/Initializer");
const ArgumentSyntaxBuilder = require("./main/externals/SyntaxBuilder");

// Globals
global.Config = yaml.load(fs.readFileSync("./src/config.yaml", "utf8"));
global.SyntaxBuilder = new ArgumentSyntaxBuilder({ defaultPrefix: Config.prefix });
global.Util = require("./main/externals/Util");

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

// Initializer
Initializer()
    .catch((err) => {
        console.error(err);
        Util.dmUser([Config.ownerId], `**Init Error**\n\`\`\`\n${err}\n\`\`\``);
    })
    .then(() => {
        discordClient.login(process.env.token);
    });
