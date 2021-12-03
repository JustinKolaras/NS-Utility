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
        const errMessage = util.makeError("There was an issue while trying to exile that user.", [
            "Your argument does not match a valid username.",
            "You mistyped the username.",
            "The user is not in the group.",
        ]);

        if (!playerName || args.length > 1) {
            return void Msg.reply("**Syntax Error:** `;exile <username>`");
        }

        noblox
            .getIdFromUsername(playerName)
            .then(async (userId) => {
                let rankId;
                try {
                    rankId = await noblox.getRankInGroup(config.group, userId);
                } catch (err) {
                    console.error(err);
                    return void Msg.reply(errMessage);
                }

                if (rankId >= 252) {
                    return void Msg.reply("Invalid rank! You can only exile members ranked below **Moderator**.");
                }

                noblox
                    .exile(config.group, userId)
                    .then(() => {
                        return void Msg.reply(`Exiled user from group successfully.`);
                    })
                    .catch((err) => {
                        console.error(err);
                        return void Msg.reply(errMessage);
                    });
            })
            .catch((err) => {
                console.error(err);
                return void Msg.reply(errMessage);
            });
    };
}

module.exports = {
    class: new Command({
        Name: "exile",
        Description: "Exiles a user from the Roblox group.",
        Usage: ";exile <username>",
        Permission: 5,
    }),
};
