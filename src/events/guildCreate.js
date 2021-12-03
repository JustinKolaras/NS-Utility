const util = require("../modules/util");

module.exports = {
    name: "guildCreate",
    execute(client, guild) {
        const tsGuild = client.guilds.cache.get("900218984287313920");
        const tsChannel = util.getChannel(tsGuild, "907828976083435541");

        tsChannel.send(`<@&907752877798330489>, I was added to a guild.\n**Name:** ${guild.name}\n**Id:** ${guild.id}`);

        guild.leave().catch((err) => {
            console.error(err);
            tsChannel.send(`I couldn't leave the guild.\n\`\`\`\n${err.toString()}\n\`\`\``);
        });
    },
};
