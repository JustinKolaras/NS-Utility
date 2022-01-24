const noblox = require("noblox.js");
const Util = require("../externals/Util");

class Command {
    constructor(options) {
        for (const k in options) {
            this[k] = options[k];
        }
    }

    fn = async (Msg, Context) => {
        const args = Context.args;
        const errMessage = Util.makeError("There was an issue while trying to delete this log.", ["Your argument does not match a valid log ID."]);

        const logId = args[0];

        const database = mongoClient.db("main");
        const modLogs = database.collection("modLogs");

        if (!logId) {
            return Msg.reply("**Syntax Error:** `;logs <logId>`");
        }

        // to finish later..
    };
}

module.exports = {
    class: new Command({
        Name: "dellog",
        Description: "Deletes a moderation log from a user.",
        Usage: ";dellog <logId>",
        Permission: 6,
    }),
};
