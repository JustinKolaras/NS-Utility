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

        const encoded = btoa(text);

        return Msg.reply(`\`\`\`\n${encoded}\n\`\`\``);
    };
}

module.exports = {
    class: new Command({
        Name: "base64",
        Description: "Encodes B64 text.",
        Usage: ";base64 <text>",
        Permission: 0,
    }),
};
