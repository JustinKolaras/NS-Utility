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
        const parsedText = util.combine(args, 0);

        if (!parsedText) {
            try {
                await noblox.shout(config.group, "").then(() => {
                    return void Msg.reply("Successfully removed group shout.");
                });
            } catch (err) {
                console.error(err);
                return void Msg.reply("There was an issue while trying to change the group shout.");
            }
        } else {
            try {
                await noblox.shout(config.group, parsedText).then(() => {
                    return void Msg.reply("Successfully changed group shout.");
                });
            } catch (err) {
                console.error(err);
                return void Msg.reply("There was an issue while trying to change the group shout.");
            }
        }
    };
}

module.exports = {
    class: new Command({
        Name: "shout",
        Description: "Changes the Roblox group shout.",
        Usage: ";shout <?text>",
        Permission: 5,
    }),
};
