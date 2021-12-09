require("dotenv").config();

const noblox = require("noblox.js");

class Command {
    constructor(options) {
        for (const k in options) {
            this[k] = options[k];
        }
    }

    fn = async (Msg) => {
        noblox
            .setCookie(process.env.cookie)
            .then(() => {
                return void Msg.reply(`:electric_plug: nPong! Latency of ${(Date.now() - Msg.createdTimestamp).toString()}ms.`);
            })
            .catch((err) => {
                console.error(err);
                return void Msg.reply(`Uh oh :worried: :grimacing: There was an error..\n\`\`\`\n${err}\n\`\`\``);
            });
    };
}

module.exports = {
    class: new Command({
        Name: "nping",
        Description: "Test & Debug Command - Tests a connection between Roblox and the Discord Bot.",
        Usage: ";nping",
        Permission: 7,
    }),
};
