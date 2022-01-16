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

module.exports = {
    name: "guildMemberRemove",
    async execute(member) {
        users++;

        setTimeout(() => {
            users--;
        }, 60000);

        const database = mongoClient.db("main");
        const reputation = database.collection("reputation");

        const hasReputation = await reputation.findOne({ id: member.id });

        if (hasReputation) {
            mongoClient.deleteOne(currentStat).catch((err) => {
                console.error(err);
                Util.dmUser([config.ownerId], `guildMemberRemove: Failure deleting reputation data from **${member.user.id}**\n\`\`\`${err}\n\`\`\``);
            });
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

        if (users >= 6) {
            users = 0;

            const prefix = `@everyone, `;
            const messageToSend = `**Member Remove Influx Warning:** An increased amount of members have been leaving recently. Please check audit and <#788872173359071272> for more details.`;

            Util.dmUsersIn(member.guild, "788877981874389014", `An important server action may need your attention.\n\n${messageToSend}`).catch(() => {});
            Util.getChannel(member.guild, moderatorConfig.channelId)?.send(prefix + messageToSend);
        }
    },
};
