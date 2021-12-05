const { MessageEmbed } = require("discord.js");
const { message } = require("noblox.js");

const config = require("../config.json");
const util = require("../modules/util");

class Command {
    constructor(options) {
        for (const k in options) {
            this[k] = options[k];
        }
    }

    fn = async (Msg) => {
        let messageEmbed;
        try {
            messageEmbed = new MessageEmbed()
                .setColor("#256ab4")
                .setTitle("NS Utility")
                .setDescription("An ease of use bot application which interacts with the Roblox API.")
                .addFields(
                    {
                        name: "Developer",
                        value: config.developerTag.toString(),
                        inline: true,
                    },
                    {
                        name: "Library",
                        value: "discord-js",
                        inline: true,
                    },
                    {
                        name: "Source",
                        value: "[GitHub](https://github.com/Aerosphia/NS-Utility)",
                        inline: true,
                    },
                    {
                        name: "Primary Use",
                        value: "Communication",
                        inline: true,
                    },
                    {
                        name: "Target Usage",
                        value: "Command Team",
                        inline: true,
                    },
                    {
                        name: "Help",
                        value: "`;help`",
                        inline: true,
                    }
                )
                .setTimestamp()
                .setFooter(`Requested by ${Msg.member.user.tag}`);
        } catch (err) {
            console.error(err);
            return void Msg.channel.send("There was an issue generating the embed. <@360239086117584906>");
        }

        return void Msg.channel.send({ embeds: [messageEmbed] });
    };
}

module.exports = {
    class: new Command({
        Name: "about",
        Description: "Gives bot information.",
        Usage: `;about`,
        Permission: 0,
    }),
};
