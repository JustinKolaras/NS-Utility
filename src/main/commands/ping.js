/*global SyntaxBuilder*/
/*eslint no-undef: "error"*/

class Command {
    constructor(options) {
        for (const k in options) {
            this[k] = options[k];
        }
    }

    fn = async (msg) => {
        return msg.reply(
            `:ping_pong: Pong! Latency of *${Date.now() - msg.createdTimestamp}ms/${Number.parseFloat((Date.now() - msg.createdTimestamp) / 1000).toFixed(4)}s*`
        );
    };
}

module.exports = {
    class: new Command({
        Name: "ping",
        Description: "Test & Debug Command - Replies with 'Pong!'",
        Usage: SyntaxBuilder.classifyCommand({ name: "ping" }).endBuild(),
        Permission: 0,
        Group: "Debug",
    }),
};
