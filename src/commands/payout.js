const noblox = require("noblox.js");
const config = require("../config.json");
const util = require("../modules/util");
const { MessageActionRow, MessageButton } = require("discord.js");

const run = async (src, context) => {
    try {
        await noblox.setCookie(config.cookie);
    } catch (err) {
        return src.reply("Issue logging into NSGroupOwner. <@360239086117584906>\nRoblox may be down.");
    }

    const args = context.args;
    const authorKey = util.getKey(src.member.id);
    const key = util.verify(args[2], (self) => {
        return authorKey[0] === true && self === authorKey[1];
    });
    const errMessage = util.makeError("There was an issue while trying to payout this user.", [
        "Your argument does not match a valid username, amount, or encryption key.",
        "The user is not in the group.",
        "The user does not meet the minimum age requirement. (you cannot payout new users!)",
        "The group does not have enough funds.",
    ]);

    let playerName = args[0];
    let playerId;
    let amt = parseInt(args[1]);

    if (!playerName || !amt || typeof amt !== "number" || !key) {
        return src.reply("**Syntax Error:** `;payout <username> <amount> <key>`");
    }

    if (amt > 3000) {
        return src.reply("Too high amount; please do this manually.");
    } else if (amt < 1) {
        return src.reply("Too low amount; payout amount must be greater than 0.");
    }

    try {
        playerId = await noblox.getIdFromUsername(playerName);
    } catch (err) {
        console.log(err);
        return src.reply(errMessage);
    }

    let rankId;
    try {
        rankId = await noblox.getRankInGroup(config.group, playerId);
    } catch (err) {
        console.log(err);
        return src.reply(errMessage);
    }

    if (rankId < 250 || rankId > 255) {
        return src.reply("Invalid rank! You can only payout members ranked **Designer** or above.");
    }

    const row = new MessageActionRow().addComponents(
        new MessageButton().setCustomId("confirm").setLabel("Confirm").setStyle("PRIMARY"),
        new MessageButton().setCustomId("reject").setLabel("Reject").setStyle("DANGER")
    );

    src.delete();

    const filter = (i) => i.member.id === src.member.id;
    const collector = src.channel.createMessageComponentCollector({
        filter,
        time: 30000,
    });

    const mainInter = await src.channel.send({
        content: `<@${src.member.id}>, Are you sure you want to payout **R$${util.sep(amt)}** to **${playerName}**? **This action is stricly irreversible.**`,
        components: [row],
    });

    collector.on("collect", async (i) => {
        if (i.customId === "confirm") {
            noblox
                .groupPayout(config.group, playerId, amt)
                .then(() => {
                    collector.stop();
                    return mainInter.edit({
                        content: `<@${src.member.id}>, Payed out user successfully.`,
                        components: [],
                    });
                })
                .catch((err) => {
                    collector.stop();
                    console.log(err);
                    return src.channel.send(errMessage);
                });
        } else if (i.customId === "reject") {
            collector.stop();
            return mainInter.edit({
                content: `<@${src.member.id}>, Cancelled command execution.`,
                components: [],
            });
        }
    });

    collector.on("end", async (_, reason) => {
        if (reason === "time") {
            return mainInter.edit({
                content: `<@${src.member.id}>, Cancelled command execution.`,
                components: [],
            });
        }
    });
};

module.exports = {
    execute: run,
    name: "payout",
    permission: 6, // Ownership Team
    description: "Pays the user robux out from the group.",
    usage: ";payout <username> <amount> <key>",
};
