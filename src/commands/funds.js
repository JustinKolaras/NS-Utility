const noblox = require("noblox.js");
const config = require("../config.json");
const util = require("../modules/util");

const run = async (src) => {
    try {
        await noblox.setCookie(config.cookie);
    } catch (err) {
        return src.reply(
            "Issue logging into NSGroupOwner. <@360239086117584906>\nRoblox may be down."
        );
    }

    let funds;
    try {
        funds = await noblox.getGroupFunds(config.group);
    } catch (err) {
        console.log(err);
        return src.reply("There was an error. <@360239086117584906>");
    }

    src.author
        .send(`Available group funds: **R$${util.sep(funds)}**`)
        .then(() => {
            src.reply("Sent you a DM!");
        })
        .catch(() => {
            src.reply("I couldn't DM you. Are your DMs off?");
        });
};

module.exports = {
    execute: run,
    name: "funds",
    permission: 6, // Ownership Team
    description: "DMs the user with the available group funds.",
    usage: ";funds",
};
