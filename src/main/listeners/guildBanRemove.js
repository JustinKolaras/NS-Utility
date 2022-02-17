const Util = require("../externals/Util");

let users = 0;
let MASTER_COOLDOWN = false;

module.exports = {
    name: "guildBanRemove",
    async execute(member) {
        users++;

        setTimeout(() => {
            users--;
        }, 60000);

        if (users >= 4 && !MASTER_COOLDOWN) {
            users = 0;
            MASTER_COOLDOWN = true;
            setTimeout(() => {
                MASTER_COOLDOWN = false;
            }, 500000);

            const prefix = `@everyone, `;
            const messageToSend = `**Mass Unban Alert:** Please check audit and <#788872173359071272> for more details.`;

            Util.dmUsersIn(member.guild, "788877981874389014", `An important server action may need your attention.\n\n${messageToSend}`).catch(() => {});
            Util.getChannel(member.guild, moderatorConfig.channelId)?.send(prefix + messageToSend);
        }
    },
};
