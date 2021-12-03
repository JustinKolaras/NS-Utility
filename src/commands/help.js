const config = require("../config.json");
const util = require("../modules/util");

const run = async (src, context) => {
    const args = context.args;
    const perm = context.permission;
    const command = args[0];

    if (!command) {
        const helpMessage = await util.getCommandList(
            src,
            `Bot prefix: \`${config.prefix}\`\nYour permission level: **${perm.toString()}**\n\n`,
            `\`%c\` - **%d** [%p]`,
            true
        );
        return src.author
            .send(helpMessage)
            .then(() => {
                src.reply("Sent you a DM with information.");
            })
            .catch(() => {
                src.reply("I couldn't DM you. Are your DMs off?");
            });
    } else if ((command && args.length > 1) || command.toString().toLowerCase() === "help") {
        return src.reply("**Syntax Error:** `;help <?command>`");
    }

    const [success, result] = util.getLibrary(command);
    if (!success) {
        return src.reply(result);
    } else {
        if (src.guild.id == config.testServer || result.permission <= perm) {
            return src.reply(`Command: \`${command.toLowerCase()}\`\nUsage: \`${result.usage}\`\nDescription: **${result.description}**`);
        } else {
            return src.reply("You have insufficient permissions to get help on this command.");
        }
    }
};

module.exports = {
    execute: run,
    name: "help",
    permission: -1,
    description: "Gives help and info on all usable commands, or specific commands.",
    usage: ";help <?command>",
};
