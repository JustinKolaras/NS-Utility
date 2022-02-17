const Util = require("../externals/Util");

module.exports = {
    name: "guildCreate",
    execType: "bind",
    execute(guild) {
        let messageToSend = `<@&907752877798330489>, I was added to a guild.\n**Name:** ${guild.name}\n**Id:** ${guild.id}`;

        guild.leave().catch((err) => {
            console.error(err);
            messageToSend = messageToSend + `\n\nI couldn't leave the guild.\n\`\`\`\n${err}\n\`\`\``;
        });

        Util.sendInChannel("900218984287313920", "907828976083435541", messageToSend);
    },
};
