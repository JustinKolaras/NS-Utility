require("dotenv").config();

const noblox = require("noblox.js");

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
        const parsedText = Util.combine(args, 0);

        noblox
            .shout(config.group, parsedText || "")
            .then(() => Msg.reply(`Successfully ${parsedText ? "changed" : "removed"} group shout.`))
            .catch(() => Msg.reply("There was an issue while trying to change the group shout."));
    };
}

module.exports = {
    class: new Command({
        Name: "shout",
        Description: "Changes the Roblox group shout.",
        Usage: SyntaxBuilder.classifyCommand({ name: "shout" }).makeRegular("text", { optional: true }).endBuild(),
        Permission: 5,
        Group: "Remote",
    }),
};
