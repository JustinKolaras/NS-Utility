const config = require("../config.json");
const util = require("../modules/util");

class Command {
    constructor(options) {
        for (const k in options) {
            this[k] = options[k];
        }
    }

    fn = async (Msg, Context) => {
        const args = Context.args;
        const perm = Context.clientPerm;
        const command = args[0];

        if (!command) {
            const helpMessage = await util.getCommandList(
                Msg,
                `Bot prefix: \`${config.prefix}\`\nYour permission level: **${perm.toString()}**\n\n`,
                `\`%c\` - **%d** [%p]`,
                true
            );
            return void Msg.author
                .send(helpMessage)
                .then(() => {
                    void Msg.reply("Sent you a DM with information.");
                })
                .catch(() => {
                    void Msg.reply("I couldn't DM you. Are your DMs off?");
                });
        } else if ((command && args.length > 1) || command.toString().toLowerCase() === "help") {
            return void Msg.reply("**Syntax Error:** `;help <?command>`");
        }

        let [success, result] = util.getLibrary(command);
        if (!success) {
            return void Msg.reply(result);
        } else {
            if ((Msg.guild.id == config.testServer && Msg.author.id === config.ownerId) || result.class.Permission <= perm) {
                return void Msg.reply(`Command: \`${command.toLowerCase()}\`\nUsage: \`${result.class.Usage}\`\nDescription: **${result.class.Description}**`);
            } else {
                return void Msg.reply("You have insufficient permissions to get help on this command.");
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
