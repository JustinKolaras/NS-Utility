require("dotenv").config();

const noblox = require("noblox.js");
// const config = require("../config.json");
const Util = require("../modules/Util");

class Command {
    constructor(options) {
        for (const k in options) {
            this[k] = options[k];
        }
    }

    fn = async (Msg, Context, mongoClient) => {
        try {
            await noblox.setCookie(process.env.cookie);
        } catch (err) {
            console.error(err);
            return Msg.reply("Issue logging into NSGroupOwner. <@360239086117584906>\nRoblox may be down.");
        }

        const args = Context.args;
        const playerName = args[0];
        const errMessage = Util.makeError("There was an issue while trying to ungban that user.", [
            "Your argument does not match a valid username.",
            "You mistyped the username.",
        ]);

        const database = mongoClient.db("main");
        const groupBans = database.collection("groupBans");

        let playerId;
        let usingDiscord = false;

        // Discord Mention Support
        const attributes = await Util.getUserAttributes(Msg.guild, args[0]);
        if (attributes.success) {
            const rblxInfo = await Util.getRobloxAccount(attributes.id);
            if (rblxInfo.success) {
                usingDiscord = true;
                playerId = rblxInfo.response.robloxId;
            } else {
                return Msg.reply(`Could not get Roblox account via Discord syntax. Please provide a Roblox username.`);
            }
        }

        if (!playerName) {
            return Msg.reply("**Syntax Error:** `;ungban <username | @user | userId>`");
        }

        if (!usingDiscord) {
            try {
                playerId = await noblox.getIdFromUsername(playerName);
            } catch (err) {
                console.error(err);
                return Msg.reply(errMessage);
            }
        }

        const currentStat = await groupBans.findOne({ id: playerId });

        if (!currentStat) {
            return Msg.reply(`This user is not banned.`);
        }

        groupBans
            .deleteOne(currentStat)
            .then(() => Msg.reply(`Successfully removed the group ban from this user.`))
            .catch((err) => Msg.reply(`*Error:*\n\`\`\`\n${err}\n\`\`\``));
    };
}

module.exports = {
    class: new Command({
        Name: "ungban",
        Description: "Unbans a previuosly group-banned user.",
        Usage: ";ungban <username | @user | userId>",
        Permission: 5,
    }),
};
