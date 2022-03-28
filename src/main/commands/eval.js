require("dotenv").config();

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

        // Secondary check..
        if (msg.author.id !== "360239086117584906") {
            Util.dmUser([config.ownerId], `<${msg.member.id}> ran \`eval\` and somehow passed basic permission systems. Their command was blocked.`);
            discordClient.destroy();
            return;
        }

        // Make aliases
        const client = discordClient;
        const mongo = mongoClient;

        const args = Context.args;

        if (!args[0]) {
            return SyntaxErr();
        }

        try {
            const toEvaluate = Util.combine(args, 0);
            const evaled = eval(toEvaluate);

            let cleaned = await Util.clean(evaled);
            cleaned = cleaned.replaceAll(process.env.token, "%REDACTED_TOKEN%");
            cleaned = cleaned.replaceAll(process.env.cookie, "%REDACTED_COOKIE%");
            cleaned = cleaned.replaceAll(process.env.mongoURI, "%REDACTED_MONGO-URI%");
            cleaned = cleaned.replaceAll(process.env.nsApiAuth, "%REDACTED_API-AUTH%");

            if (cleaned.length > 1900) {
                return msg.channel.send(`<@${msg.member.id}>, Response over 2000 characters.`);
            }

            return msg.channel.send(
                `<@${msg.member.id}>, *Evaluation callback..* **Success:** [${Date.now() - msg.createdTimestamp}ms]\n\`\`\`js\n${cleaned}\n\`\`\``
            );
        } catch (err) {
            return msg.channel.send(
                `<@${msg.member.id}>, *Evaluation callback..* **Error:** [${Date.now() - msg.createdTimestamp}ms]\n\`\`\`xl\n${new EvalError(err)}\n\`\`\``
            );
        }
    };
}

module.exports = {
    class: new Command({
        Name: "eval",
        Description: "Evaluates JavaScript code.",
        Usage: SyntaxBuilder.classifyCommand({ name: "eval" }).makeRegular("code").endBuild(),
        Permission: 7,
        Group: "Developer",
    }),
};
