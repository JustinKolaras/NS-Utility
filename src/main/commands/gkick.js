require("dotenv").config();

const noblox = require("noblox.js");

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

        try {
            await noblox.setCookie(process.env.cookie);
        } catch (err) {
            console.error(err);
            return Msg.reply("Issue logging into NSGroupOwner. <@360239086117584906>\nRoblox may be down.");
        }

        const args = Context.args;
        const playerName = args[0];
        const reason = Util.combine(args, 1);
        const errMessage = Util.makeError("There was an issue while trying to gkick that user.", [
            "Your argument does not match a valid username.",
            "You mistyped the username.",
        ]);

        const database = mongoClient.db("main");
        const modLogs = database.collection("modLogs");

        let playerId;
        let executorPlayerId;

        if (!playerName || !reason) {
            return SyntaxErr();
        }

        if (reason.length > 85) {
            return Msg.reply("Too long of a reason. Cap: 85chars");
        }

        // Discord Mention Support
        const attributes = await Util.getUserAttributes(Msg.guild, args[0]);
        if (attributes.success) {
            const rblxInfo = await Util.getRobloxAccount(attributes.id);
            if (rblxInfo.success) {
                playerId = rblxInfo.response.robloxId;
            } else {
                return Msg.reply(`Could not get Roblox account via Discord syntax. Please provide a Roblox username.`);
            }
        }

        // ID Support
        if (args[0].includes("#") && !attributes.success) {
            playerId = Util.parseNumericalsAfterHash(args[0])[0];
            if (isNaN(parseInt(playerId))) {
                return SyntaxErr();
            }
        }

        const executorRblxInfo = await Util.getRobloxAccount(Msg.author.id);
        if (executorRblxInfo.success) {
            executorPlayerId = executorRblxInfo.response.robloxId;
        } else {
            return Msg.reply(`You must be verified with RoVer to use this command. Please run the \`!verify\` command and try again.`);
        }

        if (!playerId) {
            try {
                playerId = await noblox.getIdFromUsername(playerName);
            } catch (err) {
                console.error(err);
                return Msg.reply(errMessage);
            }
        }

        let rankId;
        try {
            rankId = await noblox.getRankInGroup(config.group, playerId);
        } catch (err) {
            console.error(err);
            return Msg.reply(errMessage);
        }

        if (rankId >= 252) {
            return Msg.reply("Invalid rank! You can only game-kick members ranked below **Moderator**.");
        }

        const hasModLogs = await modLogs.findOne({ id: playerId });

        const dataForm = Util.makeLogData("Remote Kick", `**Executor:** ${Msg.member.user.tag} **Reason:** ${reason} **@ ${Util.getDateNow()}**`);

        if (hasModLogs) {
            const modLogData = hasModLogs.data;
            modLogData.push(dataForm);
            await modLogs
                .updateOne(
                    {
                        id: playerId,
                    },
                    { $set: { data: modLogData } }
                )
                .catch((err) => Msg.reply(`*Error:*\n\`\`\`\n${err}\n\`\`\``));
        } else {
            await modLogs
                .insertOne({
                    id: playerId,
                    data: [dataForm],
                })
                .catch((err) => Msg.reply(`*Error:*\n\`\`\`\n${err}\n\`\`\``));
        }

        const main = await Msg.channel.send(`<@${Msg.author.id}>, Working..`);

        const response = await Util.kickInGame({
            toKickID: parseInt(playerId),
            reason: reason,
            executor: parseInt(executorPlayerId),
        });

        if (response.success) {
            return main.edit(`<@${Msg.author.id}>, Nice! Your command was executed remotely on all game servers.`);
        } else {
            return main.edit(`<@${Msg.author.id}>, There was an error.\n\n\`@ns-api\`\n\`\`\`\n${response.raw}\n\`\`\``);
        }
    };
}

module.exports = {
    class: new Command({
        Name: "gkick",
        Description: "Kicks a user remotely in the Next Saturday Homestore.",
        Usage: SyntaxBuilder.classifyCommand({ name: "gkick" }).makeRegular("User").makeRegular("reason").endBuild(),
        Permission: 5,
        Group: "Remote",
    }),
};
