/*global SyntaxBuilder, Util, discordClient*/
/*eslint no-undef: "error"*/

const { MessageEmbed } = require("discord.js");

class Command {
    constructor(options) {
        for (const k in options) {
            this[k] = options[k];
        }
    }

    fn = async (msg) => {
        const timeParameters = Util.getTimeParameters(discordClient.uptime);

        let messageEmbed;
        try {
            messageEmbed = new MessageEmbed()
                .setColor("#2f3136")
                .setTitle(`${timeParameters.days}d, ${timeParameters.hours}h, ${timeParameters.minutes}m, ${timeParameters.seconds}s`);
        } catch (err) {
            console.error(err);
            return msg.channel.send(`**${timeParameters.days}d, ${timeParameters.hours}h, ${timeParameters.minutes}m, ${timeParameters.seconds}s**`);
        }

        return msg.reply({ embeds: [messageEmbed] });
    };
}

module.exports = {
    class: new Command({
        Name: "uptime",
        Description: "Displays bot uptime.",
        Usage: SyntaxBuilder.classifyCommand({ name: "uptime" }).endBuild(),
        Permission: 0,
        Group: "Debug",
    }),
};
