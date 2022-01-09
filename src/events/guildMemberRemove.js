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
                Util.dmUser([config.ownerId], `guildMemberRemove: Failure deleting reputation data from **${member.user.tag}**\n\`\`\`${err}\n\`\`\``);
            });
        }

        if (Util.getPerm(member) >= moderatorConfig.onPermission) {
            Util.getChannel(member.guild, moderatorConfig.channelId).send(
                `<@&788877981874389014>, **${member.displayName} (${member.user.tag}) (Mod Team)** has left the server. They could have been kicked or banned.`
            );
        } else if (Util.hasRole(member, designerConfig.roleId)) {
            Util.getChannel(member.guild, designerConfig.channelId).send(
                `@everyone, **${member.displayName} (${member.user.tag}) (Design Team)** has left the server. They could have been kicked or banned.`
            );
        }
    },
};
