class Command {
    constructor(options) {
        for (const k in options) {
            this[k] = options[k];
        }
    }

    fn = async (Msg) => {
        return Msg.reply(
            `:ping_pong: Pong! Latency of *${Date.now() - Msg.createdTimestamp}ms/${Number.parseFloat((Date.now() - Msg.createdTimestamp) / 1000).toFixed(4)}s*`
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
