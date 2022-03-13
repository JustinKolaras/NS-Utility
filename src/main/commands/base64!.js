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
        const text = args[0];

        if (!text) {
            return SyntaxErr();
        }

        const decoded = atob(text);

        return Msg.reply(`\`\`\`\n${decoded}\n\`\`\``);
    };
}

module.exports = {
    class: new Command({
        Name: "base64!",
        Description: "Decodes B64 text.",
        Usage: ";base64! <text>",
        Permission: 0,
    }),
};
