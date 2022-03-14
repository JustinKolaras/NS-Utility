let MASTER_COOLDOWN = false;

module.exports = {
    name: "channelCreate",
    execType: "bind",
    async execute(member) {
        channels++;

        setTimeout(() => {
            channels--;
        }, 60000);

        if (channels >= 4 && !MASTER_COOLDOWN) {
            channels = 0;
            MASTER_COOLDOWN = true;
            setTimeout(() => {
                MASTER_COOLDOWN = false;
            }, 500000);

            const prefix = `@everyone, `;
            const messageToSend = `**Mass Channel Creation Alert:** Please check audit and <#788872173359071272> for more details.`;

            Util.dmUsersIn(member.guild, "788877981874389014", `An important server action may need your attention.\n\n${messageToSend}`).catch(() => {});
            Util.getChannel(member.guild, "810717109427503174")?.send(prefix + messageToSend);
        }
    },
};
