const ReputationAlgorithm = require("../externals/reputation/Algorithm");
const CommandProcessor = require("../externals/CommandProcessor");

module.exports = {
    name: "messageUpdate",
    execType: "bind",
    async execute(_, msg) {
        if (!msg.guild) return;
        if (msg.webhookId) return;

        const result = await CommandProcessor(msg);
        if (!result.success && result.message) {
            return msg.reply(result.message);
        }
    },
};
