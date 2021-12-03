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
        const errMessage = util.makeError("There was an issue while trying to get asset information on that user.", [
            "Your argument does not match a valid username.",
            "You mistyped the username.",
        ]);

        let playerId;

        if (!playerName || args.length > 1) {
            return void Msg.reply("**Syntax Error:** `;isvip <username>`");
        }

        try {
            playerId = await noblox.getIdFromUsername(playerName);
        } catch (err) {
            console.error(err);
            return void Msg.reply(errMessage);
        }

        let ownership;
        try {
            ownership = await noblox.getOwnership(playerId, 13375778, "GamePass");
        } catch (err) {
            console.error(err);
            return void Msg.reply(errMessage);
        }

        return void Msg.reply(ownership ? "This user owns NS VIP." : "Not owned, or their inventory is private.");
    };
}

module.exports = {
    class: new Command({
        Name: "isvip",
        Description: "Returns a yes/no answer on if the user provided has the NS VIP gamepass or not.",
        Usage: ";isvip",
        Permission: 2,
    }),
};
