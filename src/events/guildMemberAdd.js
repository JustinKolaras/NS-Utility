module.exports = {
    name: "guildMemberAdd",
    async execute(member) {
        if (member.user.bot) {
            Util.dmUser([config.ownerId], `This is a notice that a bot was rejected from ${member.guild.name}.`);
            member.ban({
                reason: `This bot is not authorized to join the server.\nContact ${config.developerTag} to whitelist this bot.`,
            });
        }
    },
};
