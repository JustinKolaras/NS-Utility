const util = require("../modules/util");

const run = async (msg, context) => {
    if (msg.author.id !== "360239086117584906") {
        return msg.reply(
            "You have insufficient permissions to run this command."
        );
    }

    const args = context.args;
    if (!args[0])
        return msg.reply(
            `**Syntax Error:** \`;eval <?strict: "strict>>"> <code>\``
        );
    const isStrict = args[0].toString().toLowerCase() === "strict>>";

    if ((!isStrict && !args[0]) || (isStrict && !args[1])) {
        return msg.reply(
            `**Syntax Error:** \`;eval <?strict: "strict>>"> <code>\``
        );
    }

    try {
        const toEvaluate = isStrict
            ? util.combine(args, 1)
            : util.combine(args, 0);
        if (!isStrict)
            msg.channel.send(
                `<@${msg.member.id}>, *Evaluating..*\n\`\`\`\n${toEvaluate}\n\`\`\``
            );

        if (toEvaluate.includes("require"))
            return msg.reply("Command blocked for security.");
        const evaled = eval(toEvaluate);

        if (!isStrict) {
            const cleaned = await util.clean(evaled);
            msg.channel.send(
                `<@${msg.member.id}>, *Evaluation callback..* **Success:**\n\`\`\`js\n${cleaned}\n\`\`\``
            );
        } else {
            msg.delete();
        }
    } catch (err) {
        msg.channel.send(
            isStrict
                ? `<@${msg.member.id}>, **Strict Error:**\n\`\`\`xl\n${err}\n\`\`\``
                : `<@${msg.member.id}>, **Error:**\n\`\`\`xl\n${err}\n\`\`\``
        );
    }
};

module.exports = {
    execute: run,
    name: "eval",
    permission: 7, // Bot Owner
    description:
        "Evaluates JavaScript code. If on strict mode, only a respone will be given if the provided code errors.",
    usage: `;eval <?strict: "strict>>"> <code>`,
};
