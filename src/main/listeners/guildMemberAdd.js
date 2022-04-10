/*global Util, config*/
/*eslint no-undef: "error"*/

module.exports = {
    name: "guildMemberAdd",
    execType: "bind",
    async execute(member) {
        // Send to user directive
        await Util.sendInChannel("761468835600924733", "956808639434334298", `**${member.user.tag} (${member.user.id}) <@${member.user.id}>**`);

        if (member.user.bot && config.allowBots === false) {
            Util.dmUser([config.ownerId], `This is a notice that a bot was rejected from ${member.guild.name}.`);
            member.ban({
                reason: `This bot is not authorized to join the server.\nContact ${config.developerTag} to whitelist this bot.`,
            });
        }
    },
};
