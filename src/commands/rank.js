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

        let playerId;
        let usingDiscord = false;

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

        if (!playerName || args.length > 2) {
            return void Msg.reply("**Syntax Error:** `;rank <username | @user | userId> <role-name>`");
        }

        if (!usingDiscord) {
            try {
                playerId = await noblox.getIdFromUsername(playerName);
            } catch (err) {
                console.error(err);
                return void Msg.reply(errMessage);
            }
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
            .setRank(config.group, playerId, newRank)
            .then(() => Msg.reply("Changed user rank successfully."))
            .catch(() => Msg.reply(errMessage));
    };
}

module.exports = {
    class: new Command({
        Name: "rank",
        Description: "Changes a user's rank in the Roblox group.",
        Usage: ";rank <username | @user | userId> <role-name>",
        Permission: 5,
    }),
};
