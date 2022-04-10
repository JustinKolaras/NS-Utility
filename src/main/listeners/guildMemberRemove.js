/*global Util, config, mongoClient*/
/*eslint no-undef: "error"*/

const MassGuildMemberRemove = require("../alerts/MassGuildMemberRemove");
const Permissions = require("../modules/Permissions");

const configuration = {
    moderator: {
        channelId: "810717109427503174",
        perm: 2,
    },
    designer: {
        channelId: "836839078469042177",
        roleId: "790298819090448436",
    },
};

module.exports = {
    name: "guildMemberRemove",
    execType: "bind",
    async execute(member) {
        const database = mongoClient.db("main");
        const reputation = database.collection("reputation");

        // Delete Reputation
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

        const prefix = `@everyone, `;
        const messageToSend = `<@${member.id}> (${member.user.tag} :: ${member.id}) has left the server. They could have been kicked or banned.`;

        if (Permissions.validate(member) >= configuration.moderator.perm) {
            Util.dmUsersIn(member.guild, "788877981874389014", `An important server action may need your attention.\n\n${messageToSend}`).catch(() => {});
            Util.getChannel(member.guild, configuration.moderator.channelId)?.send(prefix + messageToSend);
        } else if (Util.hasRole(member, configuration.designer.roleId)) {
            Util.dmUsersIn(member.guild, "851082141235937300", `An important server action may need your attention.\n\n${messageToSend}`).catch(() => {});
            Util.getChannel(member.guild, configuration.designer.channelId)?.send(prefix + messageToSend);
        }

        const results = MassGuildMemberRemove.incr();

        if (results.broadcast) {
            Util.dmUsersIn(member.guild, "788877981874389014", `An important server action may need your attention.\n\n${results.data.message}`)
                .finally(() => Util.getChannel(member.guild, "810717109427503174")?.send(results.data.prefix + results.data.message))
                .catch(() => {});
        }
    },
};
