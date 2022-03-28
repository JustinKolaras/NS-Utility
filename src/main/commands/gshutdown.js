require("dotenv").config();

const noblox = require("noblox.js");

class Command {
    constructor(options) {
        for (const k in options) {
            this[k] = options[k];
        }
    }

    fn = async (msg, Context) => {
        const SyntaxErr = () => {
            return msg.reply(`**Syntax Error:** \`${this.Usage}\``);
        };

        try {
            await noblox.setCookie(process.env.cookie);
        } catch (err) {
            console.error(err);
            return msg.reply("Issue logging into NSGroupOwner. <@360239086117584906>\nRoblox may be down.");
        }

        const args = Context.args;
        const reason = Util.combine(args, 0) || "";

        let executorPlayerId;

        if (reason.length > 85) {
            return msg.reply("Too long of a reason. Cap: 85chars");
        }

        const executorRblxInfo = await Util.getRobloxAccount(msg.author.id);
        if (executorRblxInfo.success) {
            executorPlayerId = executorRblxInfo.response.robloxId;
        } else {
            return msg.reply(`You must be verified with RoVer to use this command. Please run the \`!verify\` command and try again.`);
        }

        const main = await msg.channel.send(`<@${msg.author.id}>, Working..`);

        const response = await Util.sdInGame({
            reason: reason,
            executor: parseInt(executorPlayerId),
        });

        if (response.success) {
            return main.edit(`<@${msg.author.id}>, Nice! Your command was executed remotely on all game servers.`);
        } else {
            return main.edit(`<@${msg.author.id}>, There was an error.\n\n\`@ns-api\`\n\`\`\`\n${response.raw}\n\`\`\``);
        }
    };
}

module.exports = {
    class: new Command({
        Name: "gshutdown",
        Description: "Shuts down all servers in the Next Saturday Homestore.",
        Usage: SyntaxBuilder.classifyCommand({ name: "gshutdown" }).makeRegular("reason", { optional: true }).endBuild(),
        Permission: 5,
        Group: "Remote",
    }),
};
