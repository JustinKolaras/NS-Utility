class Command {
    constructor(options) {
        for (const k in options) {
            this[k] = options[k];
        }
    }

    fn = async (Msg) => {
        msg.react('🍎');msg.react('🍊');msg.react('🍇');msg.react('🥭');msg.react('🥝');msg.react('🍍');msg.react('🍌');msg.react('🍑');msg.react('🍈');msg.react('🥑');msg.react('🍉');msg.react('🍋');msg.react('🍓');msg.react('🍒');msg.react('🍏');
    };
}

module.exports = {
    class: new Command({
        Name: "fruits",
        Description: "Reacts with a bunch of fruit reactions to your message.",
        Usage: ";fruits",
        Permission: 0,
    }),
};
