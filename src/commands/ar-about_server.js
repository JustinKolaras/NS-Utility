class Command {
    constructor(options) {
        for (const k in options) {
            this[k] = options[k];
        }
    }
}

module.exports = {
    class: new Command({
        Name: "ar-about_server",
        Description: "Auto Response Command - Gives information on the Next Saturday Discord server.",
        Usage: ";ar-about_server",
        Permission: 1,
        autoResponse: {
            active: true,
            result: "**About Next Saturday**\n\nNext Saturday is a streetwear clothing group that strives in helping other designers with their work. You can get critique, feedback, showcase your designs, and even participate in design tournaments! Make sure to read the server <#761470483194445844> for more information.",
        },
    }),
};
