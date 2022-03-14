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
        let playerName = args[0];
        const reason = Util.combine(args, 1);
        const errMessage = Util.makeError("There was an issue while trying to uban that user.", [
            "Your argument does not match a valid username.",
            "You mistyped the username.",
        ]);

        const database = mongoClient.db("main");
        const modLogs = database.collection("modLogs");

        const priorLogs = [];

        let playerId;
        let executorPlayerId;
        let allowGroupExile = true;
        let allowGameBans = true;
        let allowGuildBans = true;

        if (!playerName || !reason) {
            return SyntaxErr();
        }

        // Discord Mention Support
        const attributes = await Util.getUserAttributes(Msg.guild, args[0]);
        if (attributes.success) {
            const rblxInfo = await Util.getRobloxAccount(attributes.id);
            if (rblxInfo.success) {
                playerId = rblxInfo.response.robloxId;
            } else {
                allowGameBans = false;
                allowGroupExile = false;
                priorLogs.push(`Could not get Roblox account via Discord syntax. This user won't be game banned.`);
            }
        } else {
            allowGuildBans = false;
            priorLogs.push(`Could not get Discord account via Roblox syntax. This user won't be banned in Discord.`);
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

        Msg.channel.send(`<@${Msg.author.id}>, Let's ban 'em from everything! :gun: :stuck_out_tongue:`);

        if (!playerId) {
            try {
                playerId = await noblox.getIdFromUsername(playerName);
            } catch (err) {
                console.error(err);
                return Msg.reply(errMessage);
            }
        }

        try {
            playerName = await noblox.getUsernameFromId(playerId);
        } catch (err) {
            console.error(err);
            return Msg.reply(errMessage);
        }

        const prefix = `<@${Msg.author.id}>, Logs for **${playerName}**:`;
        const base = await Msg.channel.send(prefix);
        const log = [];
        const addLog = (logText) => {
            log.push(`\`${logText}\``);
            base.edit(`${prefix}\n${log.join("\n")}`);
        };
        for (const log of priorLogs) {
            addLog(log);
        }

        // Ban user in all guilds
        if (allowGuildBans) {
            for (const guild of discordClient.guilds.cache) {
                guild[1].members
                    .ban(attributes.id, {
                        reason: `Ultra Ban By ${Msg.member.user.tag}: ${reason}`,
                    })
                    .then(() => {
                        addLog(`Banned in guild: ${guild[1].name}`);
                    })
                    .catch((err) => {
                        console.error(err);
                        addLog(`Could not ban in guild ${guild[1].name}: ${err}`);
                    });
            }
        }

        if (allowGameBans) {
            const response = await Util.banInGame({
                toBanID: parseInt(playerId),
                reason: reason,
                executor: parseInt(executorPlayerId),
            });

            if (response.success) {
                addLog("Banned remotely in-game.");
            } else {
                addLog("Could not ban remotely due to internal error.");
            }
        }

        if (allowGroupExile) {
            noblox
                .exile(Config.group, playerId)
                .then(() => {
                    addLog("Exiled from group.");
                })
                .catch((err) => {
                    addLog(`Could not exile: ${err}`);
                });
        }

        const hasModLogs = await modLogs.findOne({ id: playerId });
        const dataForm = Util.makeLogData("ULTRA BAN", `**Executor:** ${Msg.member.user.tag} **Reason:** ${reason} **@ ${Util.getDateNow()}**`);

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

        return Msg.channel.send(`<@${Msg.author.id}>, :pray: All done! :face_exhaling: :hugging: :innocent:`);
    };
}

module.exports = {
    class: new Command({
        Name: "uban",
        Description: "Bans a user from the game, and all NS-related Discord servers.",
        Usage: SyntaxBuilder.classifyCommand({ name: "uban" }).makeRegular("User").makeRegular("reason").endBuild(),
        Permission: 6,
    }),
};
