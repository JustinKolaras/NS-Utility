const run = async (src) => {
    return src.reply(`:ping_pong: Pong! Latency of ${(Date.now() - src.createdTimestamp).toString()}ms.`);
};

module.exports = {
    execute: run,
    name: "ping",
    permission: 0,
    description: "Test & Debug Command - Replies with 'Pong!'",
    usage: ";ping",
};
