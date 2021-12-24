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
        const errMessage = util.makeError("There was an issue while trying to exile that user.", [
            "Your argument does not match a valid username.",
            "You mistyped the username.",
            "The user is not in the group.",
        ]);

        let playerId;
        let usingDiscord = false;

        if (!playerName || args.length > 1) {
            return void Msg.reply("**Syntax Error:** `;exile <username | @user | userId>`");
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

        let rankId;
        try {
            rankId = await noblox.getRankInGroup(config.group, playerId);
        } catch (err) {
            console.error(err);
            return void Msg.reply(errMessage);
        }

        if (rankId >= 252) {
            return void Msg.reply("Invalid rank! You can only exile members ranked below **Moderator**.");
        }

        noblox
            .exile(config.group, playerId)
            .then(() => Msg.reply(`Exiled user from group successfully.`))
            .catch(() => Msg.reply(errMessage));
    };
}

module.exports = {
    class: new Command({
        Name: "exile",
        Description: "Exiles a user from the Roblox group.",
        Usage: ";exile <username | @user | userId>",
        Permission: 5,
    }),
};
