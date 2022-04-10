/*global Util*/
/*eslint no-undef: "error"*/

const MassGuildBanRemove = require("../alerts/MassGuildBanRemove");

module.exports = {
    name: "guildBanRemove",
    execType: "bind",
    async execute(member) {
        const results = MassGuildBanRemove.incr();

        if (results.broadcast) {
            Util.dmUsersIn(member.guild, "788877981874389014", `An important server action may need your attention.\n\n${results.data.message}`)
                .finally(() => Util.getChannel(member.guild, "810717109427503174")?.send(results.data.prefix + results.data.message))
                .catch(() => {});
        }
    },
};
