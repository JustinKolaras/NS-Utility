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
                return Msg.reply(
                    `:electric_plug: nPong! Latency of *${Date.now() - Msg.createdTimestamp}ms/${Number.parseFloat(
                        (Date.now() - Msg.createdTimestamp) / 1000
                    ).toFixed(4)}s*`
                );
            })
            .catch((err) => {
                console.error(err);
                return Msg.reply(`Uh oh :worried: :grimacing: There was an error..\n\`\`\`\n${err}\n\`\`\``);
            });
    };
}

module.exports = {
    class: new Command({
        Name: "nping",
        Description: "Test & Debug Command - Tests a connection between Roblox and the Discord Bot.",
        Usage: SyntaxBuilder.classifyCommand({ name: "nping" }).endBuild(),
        Permission: 7,
    }),
};
