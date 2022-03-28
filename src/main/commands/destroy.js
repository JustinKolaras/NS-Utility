class Command {
    constructor(options) {
        for (const k in options) {
            this[k] = options[k];
        }
    }

    fn = async (msg) => {
        try {
            await msg.guild.leave().catch((err) => {
                console.error(err);
                Util.dmUser([config.ownerId], `**Guild Leave Error On \`destroy\`**\n\`\`\`\n${err}\n\`\`\``);
            });
            discordClient.destroy();
        } catch (err) {
            msg.reply(`*Error:*\n\`\`\`\n${err}\n\`\`\``);
        }
    };
}

module.exports = {
    class: new Command({
        Name: "destroy",
        Description: "Destroys and terminates the connection to Discord.",
        Usage: SyntaxBuilder.classifyCommand({ name: "destroy" }).endBuild(),
        Permission: 6,
        Group: "Developer",
    }),
};
