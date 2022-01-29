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

        const args = Context.args;
        const perm = Context.clientPerm;
        const command = args[0];

        if (!command) {
            const commandList = await Util.getCommandList(Msg, `\`%c\` - **%d** [%p]`, true);
            return Msg.author
                .send(
                    // prettier-ignore
                    `Bot prefix: \`${config.prefix}\`\nYour permission level: **${perm.toString()}**\n\nCommands above your permission level are hidden.\n\n${config.permissionIndex.join("\n")}\n\n${commandList}`
                )
                .then(() => Msg.reply("Sent you a DM with information."))
                .catch(() => Msg.reply("I couldn't DM you. Are your DMs off?"));
        } else if ((command && args.length > 1) || command.toString().toLowerCase() === "help") {
            return SyntaxErr();
        }

        let [success, result] = Util.getLibrary(command);
        if (!success) {
            return Msg.reply(result);
        } else {
            if ((Msg.guild.id == config.testServer && Msg.author.id === config.ownerId) || result.class.Permission <= perm) {
                return Msg.reply(
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
        Usage: ";help <?command>",
        Permission: 0,
    }),
};
