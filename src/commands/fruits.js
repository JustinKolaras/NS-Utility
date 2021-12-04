const fruits = ["🍎", "🍊", "🍇", "🥭", "🥝", "🍍", "🍌", "🍑", "🍈", "🥑", "🍉", "🍋", "🍓", "🍒", "🍏"];

class Command {
    constructor(options) {
        for (const k in options) {
            this[k] = options[k];
        }
    }

    fn = async (Msg) => {
        let timeout = 0;
        Msg.reply(`Please allow up to ${fruits.length} seconds for the bot to finish reacting!`);
        fruits.forEach(fruit=>{
            timeout++;
            setTimeout(()=>{
                Msg.react(fruit);
            }, 1000*timeout);
        });
    };
}

module.exports = {
    class: new Command({
        Name: "fruits",
        Description: "A wonderful creation by Magical Cat which reacts with a bunch of fruit reactions to your message.",
        Usage: ";fruits",
        Permission: 0,
    }),
};
