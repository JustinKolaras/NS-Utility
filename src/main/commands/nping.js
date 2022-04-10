/*global SyntaxBuilder, process*/
/*eslint no-undef: "error"*/

require("dotenv").config();

const noblox = require("noblox.js");

class Command {
    constructor(options) {
        for (const k in options) {
            this[k] = options[k];
        }
    }

    fn = async (msg) => {
        noblox
            .setCookie(process.env.cookie)
            .then(() => {
                return msg.reply(
                    `:electric_plug: nPong! Latency of *${Date.now() - msg.createdTimestamp}ms/${Number.parseFloat(
                        (Date.now() - msg.createdTimestamp) / 1000
                    ).toFixed(4)}s*`
                );
            })
            .catch((err) => {
                console.error(err);
                return msg.reply(`Uh oh :worried: :grimacing: There was an error..\n\`\`\`\n${err}\n\`\`\``);
            });
    };
}

module.exports = {
    class: new Command({
        Name: "nping",
        Description: "Test & Debug Command - Tests a connection between Roblox and the Discord Bot.",
        Usage: SyntaxBuilder.classifyCommand({ name: "nping" }).endBuild(),
        Permission: 7,
        Group: "Debug",
    }),
};
