class Command {
    constructor(options) {
        for (const k in options) {
            this[k] = options[k];
        }
    }

    fn = async (Msg) => {
        return void Msg.reply(`:ping_pong: Pong! Latency of ${(Date.now() - Msg.createdTimestamp).toString()}ms.`);
    };
}

module.exports = {
    class: new Command({
        Name: "ping",
        Description: "Test & Debug Command - Replies with 'Pong!'",
        Usage: ";ping",
        Permission: 0,
    }),
};
