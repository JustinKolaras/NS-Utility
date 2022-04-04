require("dotenv").config();

const noblox = require("noblox.js");

class Command {
    constructor(options) {
        for (const k in options) {
            this[k] = options[k];
        }
    }

    fn = async (msg, Context) => {
        const SyntaxErr = () => {
            return msg.reply(`**Syntax Error:** \`${this.Usage}\``);
        };

        try {
            await noblox.setCookie(process.env.cookie);
        } catch (err) {
            console.error(err);
            return msg.reply("Issue logging into NSGroupOwner. <@360239086117584906>\nRoblox may be down.");
        }

        const args = Context.args;
        const playerName = args[0];
        const errMessage = Util.makeError("There was an issue while trying to ungban that user.", [
            "Your argument does not match a valid username.",
            "You mistyped the username.",
        ]);

        const database = mongoClient.db("main");
        const modLogs = database.collection("modLogs");

        let playerId;
        let executorPlayerId;

        if (!playerName) {
            return SyntaxErr();
        }

        // Discord Mention Support
        const attributes = await Util.getUserAttributes(msg.guild, args[0]);
        if (attributes.success) {
            const rblxInfo = await Util.getRobloxAccount(attributes.id);
            if (rblxInfo.success) {
                playerId = rblxInfo.response.robloxId;
            } else {
                return msg.reply(`Could not get Roblox account via Discord syntax. Please provide a Roblox username.`);
            }
        }

        // ID Support
        if (args[0].includes("#") && !attributes.success) {
            playerId = Util.parseNumericalsAfterHash(args[0])[0];
            if (isNaN(parseInt(playerId))) {
                return SyntaxErr();
            }
        }

        const executorRblxInfo = await Util.getRobloxAccount(msg.author.id);
        if (executorRblxInfo.success) {
            executorPlayerId = executorRblxInfo.response.robloxId;
        } else {
            return msg.reply(`You must be verified with RoVer to use this command. Please run the \`!verify\` command and try again.`);
        }

        if (!playerId) {
            try {
                playerId = await noblox.getIdFromUsername(playerName);
            } catch (err) {
                console.error(err);
                return msg.reply(errMessage);
            }
        }

        let rankId;
        try {
            rankId = await noblox.getRankInGroup(config.group, playerId);
        } catch (err) {
            console.error(err);
            return msg.reply(errMessage);
        }

        if (rankId >= 252) {
            return msg.reply("Invalid rank! You can only ungame-ban members ranked below **Moderator**.");
        }

        const hasModLogs = await modLogs.findOne({ id: playerId });

        const dataForm = Util.makeLogData("Remote Unban", `**Executor:** ${msg.member.user.tag} **@ ${Util.getDateNow()}**`);

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
                .catch((err) => msg.reply(`*Error:*\n\`\`\`\n${err}\n\`\`\``));
        } else {
            await modLogs
                .insertOne({
                    id: playerId,
                    data: [dataForm],
                })
                .catch((err) => msg.reply(`*Error:*\n\`\`\`\n${err}\n\`\`\``));
        }

        const main = await msg.channel.send(`<@${msg.author.id}>, Working..`);

        const response = await Util.unbanInGame({
            toUnbanID: parseInt(playerId),
            executor: parseInt(executorPlayerId),
        });

        if (response.success) {
            return main.edit(`<@${msg.author.id}>, Nice! Your command was executed remotely on all game servers.`);
        } else {
            return main.edit(`<@${msg.author.id}>, There was an error.\n\n\`@ns-api\`\n\`\`\`\n${response.raw}\n\`\`\``);
        }
    };
}

module.exports = {
    class: new Command({
        Name: "ungban",
        Description: "Unbans a user remotely in the Next Saturday Homestore.",
        Usage: SyntaxBuilder.classifyCommand({ name: "ungban" }).makeRegular("User").endBuild(),
        Permission: 5,
        Group: "Remote",
    }),
};
