require("dotenv").config();

const noblox = require("noblox.js");
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
        const errMessage = util.makeError("There was an issue while trying to get asset information on that user.", [
            "Your argument does not match a valid username.",
            "You mistyped the username.",
        ]);

        let playerId;
        let usingDiscord = false;

        if (!playerName || args.length > 1) {
            return void Msg.reply("**Syntax Error:** `;isvip <username | @user | userId>`");
        }

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

        if (!usingDiscord) {
            try {
                playerId = await noblox.getIdFromUsername(playerName);
            } catch (err) {
                console.error(err);
                return void Msg.reply(errMessage);
            }
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
        Usage: ";isvip <username | @user | userId>",
        Permission: 2,
    }),
};
