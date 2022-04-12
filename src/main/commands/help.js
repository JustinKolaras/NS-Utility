/*global SyntaxBuilder, config*/
/*eslint no-undef: "error"*/

const List = require("../modules/CommandList");
const GetLibrary = require("../modules/GetLibrary");

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

        const args = Context.args;
        const perm = Context.permission;
        const command = args[0];

        if (!command) {
            const helpMessage = List.generate({
                Format: `\`%c\` - **%d** [%p]`,
                Permission: perm,
                Usable: true,
            });

            return msg.author
                .send(helpMessage)
                .then(() => msg.reply("Sent you a DM with information."))
                .catch(() => msg.reply("I couldn't DM you. Are your DMs off?"));
        } else if ((command && args.length > 1) || command.toString().toLowerCase() === "help") {
            return SyntaxErr();
        }

        let [success, result] = GetLibrary.get(command);
        if (!success) {
            return msg.reply(result);
        } else {
            if ((msg.guild.id === config.testServer && msg.author.id === config.ownerId) || result.class.Permission <= perm) {
                return msg.reply(
                    // prettier-ignore
                    `Command: \`${command.toLowerCase()}\` **[${result.class.Permission}]**\nUsage: \`${result.class.Usage}\`\nDescription: **${result.class.Description}**`
                );
            }
        }
    };
}

module.exports = {
    class: new Command({
        Name: "help",
        Description: "Gives help and info on all usable commands, or specific commands.",
        Usage: SyntaxBuilder.classifyCommand({ name: "help" }).makeRegular("command", { optional: true }).endBuild(),
        Permission: 0,
        Group: "General",
    }),
};
