const util = require("../modules/util");

const run = async (msg, context) => {

    try {
      msg.react('🍎');msg.react('🍊');msg.react('🍇');msg.react('🥭');msg.react('🥝');msg.react('🍍');msg.react('🍌');msg.react('🍑');msg.react('🍈');msg.react('🥑');msg.react('🍉');msg.react('🍋');msg.react('🍓');msg.react('🍒');msg.react('🍏');
    } catch (err) {
        msg.channel.send("magical cat broke me");
    }
};

module.exports = {
    execute: run,
    name: "fruits",
    permission: 0, // Everyone
    description: "Reacts with a bunch of fruit reactions to your message.",
    usage: `;fruits`,
};
