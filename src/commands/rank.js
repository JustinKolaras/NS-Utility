const noblox = require("noblox.js");
const config = require("../config.json");
const util = require("../modules/util");

const run = async (src, context) => {
    try {
        await noblox.setCookie(config.cookie);
    } catch (err) {
        return src.reply("Issue logging into NSGroupOwner. <@360239086117584906>\nRoblox may be down.");
    }

    const args = context.args;
    const playerName = args[0];
    const newRank = util.combine(args, 1);
    const errMessage = util.makeError("There was an issue while trying to change the rank of that user.", [
        "Your argument does not match a valid username.",
        "Your argument does not match a valid role-name (role names are case sensitive)!",
        "You mistyped the username and/or role-name.",
        "The user is not in the group.",
    ]);

    if (!playerName || args.length > 2) {
        return src.reply("**Syntax Error:** `;rank <username> <role-name>`");
    }

    let parsedRank;
    try {
        parsedRank = await noblox.getRole(config.group, newRank);
    } catch (err) {
        console.log(err);
        return src.reply(errMessage);
    }

    if (parsedRank.rank >= 15) {
        return src.reply("Rank provided is too high. Please do this manually.");
    }

    try {
        await noblox.getIdFromUsername(playerName).then((userId) => {
            noblox
                .setRank(config.group, userId, newRank)
                .then(() => {
                    return src.reply(`Changed user rank successfully.`);
                })
                .catch((err) => {
                    console.log(err);
                    return src.reply(errMessage);
                });
        });
    } catch (err) {
        console.log(err);
        return src.reply(errMessage);
    }
};

module.exports = {
    execute: run,
    name: "rank",
    permission: 5, // Command Team
    description: "Ranks a user from the Roblox group.",
    usage: ";rank <username> <role-name>",
};
