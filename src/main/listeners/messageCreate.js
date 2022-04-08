const ReputationAlgorithm = require("../modules/reputation/Algorithm");
const CommandProcessor = require("../modules/CommandProcessor");
const Permissions = require("../modules/Permissions");
const Util = require("../modules/Util");
const PermissionsHandler = new Permissions();

let pingInvocations = [];

const sendToCommand = (type, member) => {
    const prefix = `@everyone, `;
    const messageToSend = `**Ping Quota Exceeded (${type}):** <@${member.id}> exceeded their ping quota.${type === "Banned" ? " They've been banned." : ""}`;

    Util.dmUsersIn(member.guild, "788877981874389014", `An important server action may need your attention.\n\n${messageToSend}`).catch(() => {});
    Util.getChannel(member.guild, "810717109427503174")?.send(prefix + messageToSend);
};

module.exports = {
    name: "messageCreate",
    execType: "bind",
    async execute(msg) {
        if (!msg.guild) return;
        if (msg.webhookId) return;

        let userPermission = PermissionsHandler.validate(msg.member);
        if (Util.inRange(userPermission, 0, 4) && msg.mentions) {
            if (typeof pingInvocations[msg.member.id] !== "number") {
                pingInvocations[msg.member.id] = 0;
            }
            const mentions = msg.mentions;
            if (mentions.everyone || mentions.roles.size >= 1) {
                pingInvocations[msg.member.id]++;

                setTimeout(() => {
                    pingInvocations[msg.member.id]--;
                }, 120000);

                switch (pingInvocations[msg.member.id]) {
                    case 2:
                        sendToCommand("Warning", msg.member);
                        await msg.member
                            .send(
                                "**You have exceeded your server-wide mass-ping quota.** Please wait at least four minutes before pinging again. **Do not ping!**"
                            )
                            .catch(() => {});
                        break;
                    case 3:
                        pingInvocations[msg.member.id] = null;
                        sendToCommand("Banned", msg.member);
                        await msg.member
                            .send("**You've been banned for exceeding your ping quota by two.** Please contact a member of the Command Team.")
                            .catch(() => {});
                        msg.member.ban({ reason: "Server-wide ping quota exceeded." }).catch(() => {});
                        break;
                }
            }
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
