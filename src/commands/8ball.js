class Command {
    constructor(options) {
        for (const k in options) {
            this[k] = options[k];
        }
    }

    fn = async (Msg, Context) => {
        const args = Context.args;

        const results = [
            "As I see it, yes.",
            "Ask again later.",
            "Better not tell you now.",
            "Cannot predict now.",
            "Concentrate and ask again.",
            "Don't count on it.",
            "It is certain.",
            "It is decidedly so.",
            "Most likely.",
            "My reply is no.",
            "My sources say no.",
            "Outlook good.",
            "Outlook not so good.",
            "Reply hazy, try again.",
            "You may rely on it.",
            "Very questionable.",
            "Something to consider.",
            "I don't know what to say.",
            "Uhhhh, sure.",
        ];

        if (!args[0]) {
            return void Msg.reply("**Syntax Error:** `;8ball <question>`");
        }

        return void Msg.reply(`:8ball: ${results[Math.floor(Math.random() * results.length)]}`);
    };
}

module.exports = {
    class: new Command({
        Name: "8ball",
        Description: "A wonderful second creation by Magical Cat...",
        Usage: ";8ball <question>",
        Permission: 0,
    }),
};
