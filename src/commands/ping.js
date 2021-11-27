const run = async (src) => {
    return src.reply(`:ping_pong: Pong!`);
};

module.exports = {
    execute: run,
    name: "ping",
    permission: 0, // Everyone
    description: "Test & Debug Command - Replies with 'Pong!'",
    usage: ";ping",
};
