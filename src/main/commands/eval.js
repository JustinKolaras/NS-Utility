require("dotenv").config();

const Pastecord = require("pastecord-wrapper");
const pcClient = new Pastecord();

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

        // Secondary check..
        if (Msg.author.id !== "360239086117584906") {
            Util.dmUser([Config.ownerId], `<${Msg.member.id}> ran \`eval\` and somehow passed basic permission systems. Their command was blocked.`);
            discordClient.destroy();
            return;
        }

        // Make aliases
        const msg = Msg;
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
                const result = await pcClient.publish(cleaned);
                const url = result.url;
                return Msg.channel.send(`<@${Msg.member.id}>, Response over 2000 characters.\nUploaded to Pastecord: ${url}`);
            }

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
        Usage: SyntaxBuilder.classifyCommand({ name: "eval" }).makeRegular("code").endBuild(),
        Permission: 7,
    }),
};
