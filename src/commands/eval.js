require("dotenv").config();

const Util = require("../modules/Util");

class Command {
    constructor(options) {
        for (const k in options) {
            this[k] = options[k];
        }
    }

    fn = async (Msg, Context) => {
        // Secondary check..
        if (Msg.author.id !== "360239086117584906") {
            return Msg.reply("You have insufficient permissions to run this command.\n<@360239086117584906>");
        }

        // Make aliases
        const msg = Msg;
        const client = discordClient;
        const mongo = mongoClient;

        // Utility functions
        const dm = (userIds, message) => {
            userIds.forEach((id) => {
                Msg.guild.members
                    .fetch(id)
                    .then((m) => m.send(message))
                    .catch((e) => {
                        return e;
                    });
            });
        };

        const args = Context.args;

        if (!args[0]) {
            return Msg.reply(`**Syntax Error:** \`;eval <code>\``);
        }

        try {
            const toEvaluate = Util.combine(args, 0);
            const evaled = eval(toEvaluate);

            let cleaned = await Util.clean(evaled);
            cleaned = cleaned.replaceAll(process.env.token, "%REDACTED_TOKEN%");
            cleaned = cleaned.replaceAll(process.env.cookie, "%REDACTED_COOKIE%");
            cleaned = cleaned.replaceAll(process.env.mongoURI, "%REDACTED_MONGO-URI%");

            return Msg.channel.send(
                `<@${Msg.member.id}>, *Evaluation callback..* **Success:** [${Date.now() - Msg.createdTimestamp}ms]\n\`\`\`js\n${cleaned}\n\`\`\``
            );
        } catch (err) {
            return Msg.channel.send(
                `<@${Msg.member.id}>, *Evaluation callback..* **Error:** [${Date.now() - Msg.createdTimestamp}ms]\n\`\`\`xl\n${new EvalError(err)}\n\`\`\``
            );
        }
    };
}

module.exports = {
    class: new Command({
        Name: "eval",
        Description: "Evaluates JavaScript code.",
        Usage: ";eval <code>",
        Permission: 7,
    }),
};
