require("dotenv").config();

const noblox = require("noblox.js");
const Util = require("../externals/Util");

class Command {
    constructor(options) {
        for (const k in options) {
            this[k] = options[k];
        }
    }

    fn = async (Msg, Context) => {
        const SyntaxErr = () => {
            return Msg.reply(`**Syntax Error:** \`${this.Usage}\``);
        };

        try {
            await noblox.setCookie(process.env.cookie);
        } catch (err) {
            console.error(err);
            return Msg.reply("Issue logging into NSGroupOwner. <@360239086117584906>\nRoblox may be down.");
        }

        const args = Context.args;
        const reason = Util.combine(args, 0);
        const errMessage = Util.makeError("There was an issue while trying to shutdown all game servers.", ["Something internal occured."]);

        let executorPlayerId;

        if (!reason) {
            return SyntaxErr();
        }

        if (reason.length > 85) {
            return Msg.reply("Too long of a reason. Cap: 85chars");
        }

        const executorRblxInfo = await Util.getRobloxAccount(Msg.author.id);
        if (executorRblxInfo.success) {
            executorPlayerId = executorRblxInfo.response.robloxId;
        } else {
            return Msg.reply(`You must be verified with RoVer to use this command. Please run the \`!verify\` command and try again.`);
        }

        const main = await Msg.channel.send(`<@${Msg.author.id}>, Working..`);

        const response = await Util.sdInGame({
            reason: reason,
            executor: parseInt(executorPlayerId),
        });

        if (response.success) {
            return main.edit(`<@${Msg.author.id}>, Nice! Your command was executed remotely on all game servers.`);
        } else {
            return main.edit(`<@${Msg.author.id}>, There was an error.\n\n\`@ns-api\`\n\`\`\`\n${response.raw}\n\`\`\``);
        }
    };
}

module.exports = {
    class: new Command({
        Name: "gshutdown",
        Description: "Shuts down all servers in the Next Saturday Homestore.",
        Usage: ";gshutdown <reason>",
        Permission: 5,
    }),
};
