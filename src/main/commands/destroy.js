class Command {
    constructor(options) {
        for (const k in options) {
            this[k] = options[k];
        }
    }

    fn = async (Msg) => {
        try {
            await Msg.guild.leave().catch((err) => {
                console.error(err);
                Util.dmUser([Config.ownerId], `**Guild Leave Error On \`destroy\`**\n\`\`\`\n${err}\n\`\`\``);
            });
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
        Usage: SyntaxBuilder.classifyCommand({ name: "destroy" }).endBuild(),
        Permission: 6,
    }),
};
