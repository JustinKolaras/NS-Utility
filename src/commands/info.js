const { MessageEmbed } = require("discord.js");

const noblox = require("noblox.js");
const config = require("../config.json");
const util = require("../modules/util");

class Command {
    constructor(options) {
        for (const k in options) {
            this[k] = options[k];
        }
    }

    fn = async (Msg, Context) => {
        try {
            await noblox.setCookie(config.cookie);
        } catch (err) {
            console.error(err);
            return void Msg.reply("Issue logging into NSGroupOwner. <@360239086117584906>\nRoblox may be down.");
        }

        const args = Context.args;
        const playerName = args[0];
        const errMessage = util.makeError("There was an issue while trying to gather information on that user.", [
            "Your argument does not match a valid username.",
            "You mistyped the username.",
        ]);

        let playerId;
        let info;

        if (!playerName || args.length > 1) {
            return void Msg.reply("**Syntax Error:** `;info <username>`");
        }

        try {
            await noblox.getIdFromUsername(playerName);
            playerId = userId;
        } catch (err) {
            console.error(err);
            return void Msg.reply(errMessage);
        }

        try {
            info = await noblox.getPlayerInfo({ userId: playerId });
        } catch (err) {
            console.error(err);
            return void Msg.reply(errMessage);
        }

        try {
            info["premium"] = await noblox.getPremium(playerId);
        } catch (err) {
            console.error(err);
            return void Msg.reply(errMessage);
        }

        let messageEmbed;
        try {
            const joinDate = new Date(info.joinDate).toDateString();
            let oldNames = info.oldNames?.length > 0 ? info.oldNames.join(", ") : "None";

            messageEmbed = new MessageEmbed()
                .setColor("#497ec0")
                .setTitle(info.username + " (" + info.displayName + ")")
                .setURL(`https://roblox.com/users/${userId}/profile`)
                .setDescription(info.blurb)
                .addFields(
                    {
                        name: "Friends",
                        value: info.friendCount.toString(),
                        inline: true,
                    },
                    {
                        name: "Followers",
                        value: info.followerCount.toString(),
                        inline: true,
                    },
                    {
                        name: "Following",
                        value: info.followingCount.toString(),
                        inline: true,
                    },
                    { name: "Join Date", value: joinDate.toString(), inline: true },
                    { name: "Age", value: info.age.toString(), inline: true },
                    {
                        name: "Banned",
                        value: info.isBanned ? "yes" : "no",
                        inline: true,
                    },
                    {
                        name: "Premium",
                        value: info.premium ? "yes" : "no",
                        inline: true,
                    },
                    { name: "Past Names", value: oldNames }
                )
                .setTimestamp()
                .setFooter(`Requested by ${requester}`);
        } catch (err) {
            console.error(err);
            return void Msg.reply("There was an issue generating the info embed; this user might not exist. <@360239086117584906>");
        }

        void Msg.channel.send({ embeds: [messageEmbed] });
    };
}

module.exports = {
    class: new Command({
        Name: "info",
        Description: "Gathers information on a Roblox user.",
        Usage: ";info <username>",
        Permission: 0,
    }),
};
