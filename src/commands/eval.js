const util = require("../modules/util");
class Command {
    constructor(options) {
        for (const k in options) {
            this[k] = options[k];
        }
    }

    fn = async (msg, Context) => {
        // Secondary check..
        if (msg.author.id !== "360239086117584906") {
            return void Msg.reply("You have insufficient permissions to run this command.\n<@360239086117584906> **Vital**");
        }

        const args = Context.args;

        if (!args[0]) {
            return void msg.reply(`**Syntax Error:** \`;eval <code>\``);
        }

        try {
            const toEvaluate = util.combine(args, 0);
            const evaled = eval(toEvaluate);

            const cleaned = await util.clean(evaled);
            void msg.channel.send(
                `<@${msg.member.id}>, *Evaluation callback..* **Success:** [${(Date.now() - msg.createdTimestamp).toString()}ms]\n\`\`\`js\n${cleaned}\n\`\`\``
            );
        } catch (err) {
            void msg.channel.send(
                `<@${msg.member.id}>, *Evaluation callback..* **Error:** [${(Date.now() - msg.createdTimestamp).toString()}ms]\n\`\`\`xl\n${err}\n\`\`\``
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
