const util = require("../modules/util");

const run = async (msg, context) => {
    // Secondary check..
    if (msg.author.id !== "360239086117584906") {
        return msg.reply("You have insufficient permissions to run this command.");
    }

    const args = context.args;

    if (!args[0]) {
        return msg.reply(`**Syntax Error:** \`;eval <code>\``);
    }

    try {
        const toEvaluate = util.combine(args, 0);
        const evaled = eval(toEvaluate);

        const cleaned = await util.clean(evaled);
        msg.channel.send(
            `<@${msg.member.id}>, *Evaluation callback..* **Success:** [${(Date.now() - msg.createdTimestamp).toString()}ms]\n\`\`\`js\n${cleaned}\n\`\`\``
        );
    } catch (err) {
        msg.channel.send(
            `<@${msg.member.id}>, *Evaluation callback..* **Error:** [${(Date.now() - msg.createdTimestamp).toString()}ms]\n\`\`\`xl\n${err}\n\`\`\``
        );
    }
};

module.exports = {
    execute: run,
    name: "eval",
    permission: 7, // Bot Owner
    description: "Evaluates JavaScript code.",
    usage: `;eval <code>`,
};
