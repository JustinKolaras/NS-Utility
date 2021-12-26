require("dotenv").config();

const { MessageEmbed } = require("discord.js");

const noblox = require("noblox.js");
const config = require("../config.json");
const util = require("../modules/Util");

class Command {
    constructor(options) {
        for (const k in options) {
            this[k] = options[k];
        }
    }

    fn = async (Msg, Context) => {
        try {
            await noblox.setCookie(process.env.cookie);
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
        let usingDiscord = false;

        // Discord Mention Support
        const attributes = await util.getUserAttributes(Msg.guild, args[0]);
        if (attributes.success) {
            const rblxInfo = await util.getRobloxAccount(attributes.id);
            if (rblxInfo.success) {
                usingDiscord = true;
                playerId = rblxInfo.response.robloxId;
            } else {
                return void Msg.reply(`Could not get Roblox account via Discord syntax. Please provide a Roblox username.`);
            }
        }

        if (!playerName || args.length > 1) {
            return void Msg.reply("**Syntax Error:** `;info <username | @user | userId>`");
        }

        if (!usingDiscord) {
            try {
                playerId = await noblox.getIdFromUsername(playerName);
            } catch (err) {
                console.error(err);
                return void Msg.reply(errMessage);
            }
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

        try {
            const rank = await noblox.getRankInGroup(config.group, playerId);
            info["ns_rank"] = await noblox.getRole(config.group, rank);
        } catch (err) {
            console.error(err);
            return void Msg.reply(errMessage);
        }

        let messageEmbed;
        try {
            const joinDate = new Date(info.joinDate).toDateString();
            let oldNames = info.oldNames && info.oldNames.length > 0 ? info.oldNames.join(", ") : "None";

            messageEmbed = new MessageEmbed()
                .setColor("#497ec0")
                .setTitle(info.username + " (" + info.displayName + ")")
                .setThumbnail(`https://www.roblox.com/avatar-thumbnail/image?userId=${playerId}&width=420&height=420&format=png`)
                .setURL(`https://roblox.com/users/${playerId}/profile`)
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
                    { name: "Join Date", value: joinDate, inline: true },
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
                    {
                        name: "NS Rank",
                        value: info.ns_rank.name !== "Guest" ? info.ns_rank.name : "N/A",
                        inline: true,
                    },
                    {
                        name: "User ID",
                        value: playerId.toString(),
                        inline: true,
                    },
                    { name: "Past Names", value: oldNames }
                )
                .setTimestamp()
                .setFooter(`Requested by ${Msg.member.user.tag}`);
        } catch (err) {
            console.error(err);
            return void Msg.reply("There was an issue generating the info embed; this user might not exist.");
        }

        return void Msg.channel.send({ content: ":mag_right: :newspaper2: Got some intel..", embeds: [messageEmbed] });
    };
}

module.exports = {
    class: new Command({
        Name: "info",
        Description: "Gathers information on a Roblox user.",
        Usage: ";info <username | @user | userId>",
        Permission: 0,
    }),
};
