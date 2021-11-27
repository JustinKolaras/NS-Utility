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
        "There was an issue while trying to get asset information on that user.",
        [
            "Your argument does not match a valid username.",
            "You mistyped the username.",
        ]
    );

    let playerId;

    if (!playerName || args.length > 1) {
        return src.reply("**Syntax Error:** `;isvip <username>`");
    }

    try {
        playerId = await noblox.getIdFromUsername(playerName);
    } catch (err) {
        console.log(err);
        return src.reply(errMessage);
    }

    let ownership;
    try {
        ownership = await noblox.getOwnership(playerId, 13375778, "GamePass");
    } catch (err) {
        console.log(err);
        return src.reply(errMessage);
    }

    return src.reply(
        ownership
            ? "This user owns NS VIP."
            : "Not owned, or their inventory is private."
    );
};

module.exports = {
    execute: run,
    name: "isvip",
    permission: 2, // Trial Moderator
    description:
        "Returns a yes/no answer on if the user provided has the NS VIP gamepass or not.",
    usage: ";isvip <username>",
};
