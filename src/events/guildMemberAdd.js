module.exports = {
    name: "guildMemberAdd",
    async execute(member) {
        if (member.user.bot)
            member.ban({
                reason: `This bot is not authorized to join the server.\nContact ${config.developerTag} to whitelist this bot.`,
            });
    },
};
