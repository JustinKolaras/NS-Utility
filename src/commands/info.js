const noblox = require("noblox.js");
const { MessageEmbed } = require("discord.js");
const config = require("../config.json");
const util = require("../modules/util");

const makeEmbed = (src, userId, info, requester) => {
    try {
        const joinDate = new Date(info.joinDate).toDateString();

        let oldNames;
        if (info.oldNames && info.oldNames.length > 0) {
            oldNames = info.oldNames.join(", ");
        } else {
            oldNames = "None";
        }

        const toReturn = new MessageEmbed()
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

        return toReturn;
    } catch (err) {
        console.log(err);
        return src.reply(
            "There was an issue generating the info embed; this user might not exist. <@360239086117584906>"
        );
    }
};

const run = async (src, context) => {
    try {
        await noblox.setCookie(config.cookie);
    } catch (err) {
        return src.reply(
            "Issue logging into NSGroupOwner. <@360239086117584906>\nRoblox may be down."
        );
    }

    const args = context.args;
    const playerName = args[0];
    const errMessage = util.makeError(
        "There was an issue while trying to gather information on that user.",
        [
            "Your argument does not match a valid username.",
            "You mistyped the username.",
        ]
    );

    let playerId, playerInfo, hasPremium;

    if (!playerName || args.length > 1) {
        return src.reply("**Syntax Error:** `;info <username>`");
    }

    try {
        await noblox.getIdFromUsername(playerName).then((userId) => {
            playerId = userId;
        });
    } catch (err) {
        console.log(err);
        return src.reply(errMessage);
    }

    try {
        playerInfo = await noblox.getPlayerInfo({ userId: playerId });
    } catch (err) {
        console.log(err);
        return src.reply(errMessage);
    }

    try {
        hasPremium = await noblox.getPremium(playerId);
        playerInfo.premium = hasPremium;
    } catch (err) {
        console.log(err);
        return src.reply(errMessage);
    }

    const embed = makeEmbed(src, playerId, playerInfo, src.member.user.tag);
    src.channel.send({ embeds: [embed] });
};

module.exports = {
    execute: run,
    name: "info",
    permission: 0, // Everyone
    description: "Gets information on a Roblox user.",
    usage: ";info <username>",
};
