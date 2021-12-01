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
    const parsedText = util.combine(args, 0);

    if (!parsedText) {
        try {
            await noblox.shout(config.group, "").then(() => {
                return src.reply("Successfully removed group shout.");
            });
        } catch (err) {
            console.log(err);
            return src.reply("There was an issue while trying to change the group shout.");
        }
    } else {
        try {
            await noblox.shout(config.group, parsedText).then(() => {
                return src.reply("Successfully changed group shout.");
            });
        } catch (err) {
            console.log(err);
            return src.reply("There was an issue while trying to change the group shout.");
        }
    }
};

module.exports = {
    execute: run,
    name: "shout",
    permission: 5, // Command Team
    description: "Changes the Roblox group shout.",
    usage: ";shout <?text>",
};
