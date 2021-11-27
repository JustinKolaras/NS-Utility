const noblox = require("noblox.js");
const config = require("../config.json");
const util = require("../modules/util");

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
        "There was an issue while trying to exile that user.",
        [
            "Your argument does not match a valid username.",
            "You mistyped the username.",
            "The user is not in the group.",
        ]
    );

    if (!playerName || args.length > 1) {
        return src.reply("**Syntax Error:** `;exile <username>`");
    }

    noblox
        .getIdFromUsername(playerName)
        .then(async (userId) => {
            let rankId;
            try {
                rankId = await noblox.getRankInGroup(config.group, userId);
            } catch (err) {
                console.log(err);
                return src.reply(errMessage);
            }

            if (rankId >= 252) {
                return src.reply(
                    "Invalid rank! You can only exile members ranked below **Moderator**."
                );
            }

            noblox
                .exile(config.group, userId)
                .then(() => {
                    return src.reply(`Exiled user from group successfully.`);
                })
                .catch((err) => {
                    console.log(err);
                    return src.reply(errMessage);
                });
        })
        .catch((err) => {
            console.log(err);
            return src.reply(errMessage);
        });
};

module.exports = {
    execute: run,
    name: "exile",
    permission: 5, // Command Team
    description: "Exiles a user from the Roblox group.",
    usage: ";exile <username>",
};
