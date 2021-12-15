require("dotenv").config();

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
            await noblox.setCookie(process.env.cookie);
        } catch (err) {
            console.error(err);
            return void Msg.reply("Issue logging into NSGroupOwner. <@360239086117584906>\nRoblox may be down.");
        }

        const args = Context.args;
        const playerName = args[0];
        const newRank = util.combine(args, 1);
        const errMessage = util.makeError("There was an issue while trying to change the rank of that user.", [
            "Your argument does not match a valid username.",
            "Your argument does not match a valid role-name (role names are case sensitive!)",
            "You mistyped the username and/or role-name.",
            "The user is not in the group.",
        ]);

        if (!playerName || args.length > 2) {
            return void Msg.reply("**Syntax Error:** `;rank <username> <role-name>`");
        }

        let parsedRank;
        try {
            parsedRank = await noblox.getRole(config.group, newRank);
        } catch (err) {
            console.error(err);
            return void Msg.reply(errMessage);
        }

        if (parsedRank.rank >= 15) {
            return void Msg.reply("Rank provided is too high. Please do this manually.");
        }

        noblox
            .getIdFromUsername(playerName)
            .then((userId) => noblox.setRank(config.group, userId, newRank))
            .then(() => Msg.reply("Changed user rank successfully."))
            .catch(() => Msg.reply(errMessage));
    };
}

module.exports = {
    class: new Command({
        Name: "rank",
        Description: "Changes a user's rank in the Roblox group.",
        Usage: ";rank <username> <role-name>",
        Permission: 5,
    }),
};
