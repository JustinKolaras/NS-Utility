require("dotenv").config();

const noblox = require("noblox.js");
const config = require("../config.json");
const util = require("../modules/util");

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
            return void Msg.reply("Issue logging into NSGroupOwner. <@360239086117584906>\nRoblox may be down.");
        }

        const args = Context.args;
        const playerName = args[0];
        const reason = util.verify(util.combine(args, 1), (self) => {
            return typeof self === "string";
        });
        const errMessage = util.makeError("There was an issue while trying to gban that user.", [
            "Your argument does not match a valid username.",
            "You mistyped the username.",
        ]);

        const database = mongoClient.db("main");
        const groupBans = database.collection("groupBans");

        let playerId;
        let usingDiscord = false;

        // Discord Mention Support
        const attributes = await util.getUserAttributes(Msg.guild, args[0]);
        if (attributes.success) {
            const rblxInfo = await util.getRobloxAccount(attributes.id);
            if (rblxInfo.success) {
                usingDiscord = true;
                playerId = rblxInfo.response.robloxId;
            } else {
                return void Msg.reply(`Could not get Roblox account via Discord syntax. Please provide a Roblox username.`);
            }
        }

        if (!playerName || !reason) {
            return void Msg.reply("**Syntax Error:** `;gban <username | @user | userId> <reason>`");
        }

        if (!usingDiscord) {
            try {
                playerId = await noblox.getIdFromUsername(playerName);
            } catch (err) {
                console.error(err);
                return void Msg.reply(errMessage);
            }
        }

        let rankId;
        try {
            rankId = await noblox.getRankInGroup(config.group, playerId);
        } catch (err) {
            console.error(err);
            return void Msg.reply(errMessage);
        }

        if (rankId >= 252) {
            return void Msg.reply("Invalid rank! You can only group-ban members ranked below **Moderator**.");
        }

        const currentStat = await groupBans.findOne({ id: playerId });

        if (currentStat) {
            const gbReason = currentStat.reason;
            return void Msg.reply(`This user is already banned: **${gbReason}**`);
        }

        let couldExile = true;

        noblox.exile(config.group, playerId).catch(() => {
            couldExile = false;
        });

        groupBans
            .insertOne({
                id: playerId,
                reason: reason,
            })
            .then(() =>
                Msg.reply(
                    // prettier-ignore
                    `Successfully group banned user. ${couldExile ? "" : "\nBy the way, I couldn't exile them. If they weren't in the group originally, this doesn't matter."}`
                )
            )
            .catch((err) => Msg.reply(`*Error:*\n\`\`\`\n${err}\n\`\`\``));
    };
}

module.exports = {
    class: new Command({
        Name: "gban",
        Description: "Bans a user from joining the group.",
        Usage: ";gban <username | @user | userId> <reason>",
        Permission: 5,
    }),
};
