const util = require("../modules/util");

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
    async execute(_, mongoClient, member) {
        const database = mongoClient.db("main");
        const reputation = database.collection("reputation");

        const currentStat = await reputation.findOne({ id: member.id });

        if (currentStat) {
            mongoClient.deleteOne(currentStat).catch(console.error);
        }

        if (util.getPerm(member) >= moderatorConfig.onPermission) {
            util.getChannel(member.guild, moderatorConfig.channelId).send(
                `<@&788877981874389014>, **${member.displayName} (${member.user.tag}) (Mod Team)** has left the server. They could have been kicked or banned.`
            );
        } else if (util.hasRole(member, designerConfig.roleId)) {
            util.getChannel(member.guild, designerConfig.channelId).send(
                `@everyone, **${member.displayName} (${member.user.tag}) (Design Team)** has left the server. They could have been kicked or banned.`
            );
        }
    },
};
