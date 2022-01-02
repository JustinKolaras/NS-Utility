require("dotenv").config();

const noblox = require("noblox.js");
const config = require("../config.json");
const Util = require("../modules/Util");

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
            return Msg.reply("Issue logging into NSGroupOwner. <@360239086117584906>\nRoblox may be down.");
        }

        const args = Context.args;
        const playerName = args[0];
        const newRank = Util.combine(args, 1);
        const errMessage = Util.makeError("There was an issue while trying to change the rank of that user.", [
            "Your argument does not match a valid username.",
            "Your argument does not match a valid role-name (role names are case sensitive!)",
            "You mistyped the username and/or role-name.",
            "The user is not in the group.",
        ]);

        let playerId;
        let usingDiscord = false;

        // Discord Mention Support
        const attributes = await Util.getUserAttributes(Msg.guild, args[0]);
        if (attributes.success) {
            const rblxInfo = await Util.getRobloxAccount(attributes.id);
            if (rblxInfo.success) {
                usingDiscord = true;
                playerId = rblxInfo.response.robloxId;
            } else {
                return Msg.reply(`Could not get Roblox account via Discord syntax. Please provide a Roblox username.`);
            }
        }

        if (!playerName || args.length > 2) {
            return Msg.reply("**Syntax Error:** `;rank <username | @user | userId> <role-name>`");
        }

        if (!usingDiscord) {
            try {
                playerId = await noblox.getIdFromUsername(playerName);
            } catch (err) {
                console.error(err);
                return Msg.reply(errMessage);
            }
        }

        let parsedRank;
        try {
            parsedRank = await noblox.getRole(config.group, newRank);
        } catch (err) {
            console.error(err);
            return Msg.reply(errMessage);
        }

        if (parsedRank.rank >= 15) {
            return Msg.reply("Rank provided is too high. Please do this manually.");
        }

        let rankId;
        try {
            rankId = await noblox.getRankInGroup(config.group, playerId);
        } catch (err) {
            console.error(err);
            return Msg.reply(errMessage);
        }

        if (rankId >= 252) {
            return Msg.reply("Invalid rank! You can only change the rank of members ranked below **Moderator**.");
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
