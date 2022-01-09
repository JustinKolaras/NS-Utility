const Util = require("../modules/Util");

const moderatorConfig = {
        channelId: "810717109427503174",
        onPermission: 2,
    },
    designerConfig = {
        channelId: "836839078469042177",
        roleId: "790298819090448436",
    };

module.exports = {
    name: "guildMemberRemove",
    async execute(member) {
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
            const messageToSend = `<@&788877981874389014>, **${member.displayName} (${member.user.tag}) (Mod Team)** has left the server. They could have been kicked or banned.`;
            Util.dmUsersIn(member.guild.id, "788877981874389014", `An important server action may need your attention.\n\n${messageToSend}`);
            Util.getChannel(member.guild, moderatorConfig.channelId).send(messageToSend);
        } else if (Util.hasRole(member, designerConfig.roleId)) {
            const messageToSend = `@everyone, **${member.displayName} (${member.user.tag}) (Design Team)** has left the server. They could have been kicked or banned.`;
            Util.dmUsersIn(member.guild.id, "851082141235937300", `An important server action may need your attention.\n\n${messageToSend}`);
            Util.getChannel(member.guild, designerConfig.channelId).send(messageToSend);
        }
    },
};
