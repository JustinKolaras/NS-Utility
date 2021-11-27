const noblox = require("noblox.js");
const config = require("../config.json");

const run = async (src) => {
    let logo;
    try {
        logo = await noblox.getLogo(config.group);
    } catch (err) {
        console.log(err);
        return src.reply("There was an error. <@360239086117584906>");
    }

    return src.reply(logo);
};

module.exports = {
    execute: run,
    name: "logo",
    permission: 0, // Everyone
    description: "Replies with the group logo.",
    usage: ";logo",
};
