const run = async (src) => {
    const Latency = (Date.now() - src.createdTimestamp).toString();
    return src.reply(`:ping_pong: Pong! Latency of ${Latency}ms.`);
};

module.exports = {
    execute: run,
    name: "ping",
    permission: 0, // Everyone
    description: "Test & Debug Command - Replies with 'Pong!'",
    usage: ";ping",
};
