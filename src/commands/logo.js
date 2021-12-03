const noblox = require("noblox.js");
const config = require("../config.json");
class Command {
    constructor(options) {
        for (const k in options) {
            this[k] = options[k];
        }
    }

    fn = async (Msg, Context) => {
        let logo;
        try {
            logo = await noblox.getLogo(config.group);
        } catch (err) {
            console.error(err);
            return void Msg.reply("There was an error. <@360239086117584906>");
        }

        return void Msg.reply(logo);
    };
}

module.exports = {
    class: new Command({
        Name: "logo",
        Description: "Replies with an image of the group logo.",
        Usage: ";logo",
        Permission: 0,
    }),
};
