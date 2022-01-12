class Command {
    constructor(options) {
        for (const k in options) {
            this[k] = options[k];
        }
    }

    fn = async (Msg) => {
        try {
            discordClient.destroy();
        } catch (err) {
            Msg.reply(`*Error:*\n\`\`\`\n${err}\n\`\`\``);
        }
    };
}

module.exports = {
    class: new Command({
        Name: "destroy",
        Description: "Destroys and terminates the connection to Discord.",
        Usage: ";destroy",
        Permission: 7,
    }),
};
