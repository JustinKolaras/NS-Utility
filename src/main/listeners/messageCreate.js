/*global Util*/
/*eslint no-undef: "error"*/

const ReputationAlgorithm = require("../modules/RepAlgorithm");
const CommandProcessor = require("../modules/CommandProcessor");
const Permissions = require("../modules/Permissions");
const PingQuotas = require("../modules/PingQuotas");

module.exports = {
    name: "messageCreate",
    execType: "bind",
    async execute(msg) {
        if (!msg.guild) return;
        if (msg.webhookId) return;

        // Ping Quota Handler
        const userPermission = Permissions.validate(msg.member);
        if (Util.inRange(userPermission, -1, 4) && msg.mentions) {
            PingQuotas.run({ member: msg.member, mentions: msg.mentions });
        }

        if (Util.isReputableChannel(msg.channel.id)) {
            if (!msg.member.user.bot) ReputationAlgorithm(msg);
        }

        const result = await CommandProcessor(msg);
        if (!result.success && result.message) {
            return msg.reply(result.message);
        }
    },
};
