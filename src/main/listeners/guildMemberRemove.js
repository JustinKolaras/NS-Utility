const Util = require("../externals/Util");

const moderatorConfig = {
        channelId: "810717109427503174",
        onPermission: 2,
    },
    designerConfig = {
        channelId: "836839078469042177",
        roleId: "790298819090448436",
    };

let users = 0;
let MASTER_COOLDOWN = false;

module.exports = {
    name: "guildMemberRemove",
    execType: "bind",
    async execute(member) {
        users++;

        setTimeout(() => {
            users--;
        }, 60000);

        const database = mongoClient.db("main");
        const reputation = database.collection("reputation");

        const hasReputation = await reputation.findOne({ id: member.id });
        const reputationNum = hasReputation?.reputationNum;

        if (hasReputation) {
            reputation
                .deleteOne(hasReputation)
                .catch((err) => {
                    console.error(err);
                    Util.dmUser([config.ownerId], `guildMemberRemove: Failure deleting reputation data from **${member.user.id}**\n\`\`\`${err}\n\`\`\``);
                })
                .then(() =>
                    Util.sendInChannel(
                        "761468835600924733",
                        "923715934370283612",
                        `<@${member.id}> left with **${reputationNum}** reputation points. It has been cleared.`
                    )
                );
        }

        if (Util.getPerm(member) >= moderatorConfig.onPermission) {
            const prefix = `@everyone, `;
            const messageToSend = `<@${member.id}> (${member.user.tag} :: ${member.id}) has left the server. They could have been kicked or banned.`;

            Util.dmUsersIn(member.guild, "788877981874389014", `An important server action may need your attention.\n\n${messageToSend}`).catch(() => {});
            Util.getChannel(member.guild, moderatorConfig.channelId)?.send(prefix + messageToSend);
        } else if (Util.hasRole(member, designerConfig.roleId)) {
            const prefix = `@everyone, `;
            const messageToSend = `<@${member.id}> (${member.user.tag} :: ${member.id}) has left the server. They could have been kicked or banned.`;

            Util.dmUsersIn(member.guild, "851082141235937300", `An important server action may need your attention.\n\n${messageToSend}`).catch(() => {});
            Util.getChannel(member.guild, designerConfig.channelId)?.send(prefix + messageToSend);
        }

        if (users >= 6 && !MASTER_COOLDOWN) {
            users = 0;
            MASTER_COOLDOWN = true;
            setTimeout(() => {
                MASTER_COOLDOWN = false;
            }, 500000);

            const prefix = `@everyone, `;
            const messageToSend = `**Member Remove Influx Warning:** Please check audit and <#788872173359071272> for more details.`;

            Util.dmUsersIn(member.guild, "788877981874389014", `An important server action may need your attention.\n\n${messageToSend}`).catch(() => {});
            Util.getChannel(member.guild, moderatorConfig.channelId)?.send(prefix + messageToSend);
        }
    },
};
