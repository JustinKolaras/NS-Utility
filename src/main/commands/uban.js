require("dotenv").config();

const noblox = require("noblox.js");
const Util = require("../externals/Util");

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
        const groupBans = database.collection("groupBans");
        const modLogs = database.collection("modLogs");

        let playerId;
        let executorPlayerId;
        let allowGroupBans = true;
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
                allowGroupBans = false;
                allowGameBans = false;
                Msg.reply(`Could not get Roblox account via Discord syntax. This user won't be group/game banned.`);
            }
        } else {
            allowGuildBans = false;
            Msg.reply(`Could not get Discord account via Roblox syntax. This user won't be banned in Discord.`);
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

        const currentStat = await groupBans.findOne({ id: playerId });
        const hasModLogs = await modLogs.findOne({ id: playerId });

        if (allowGroupBans) {
            if (currentStat) {
                const gbReason = currentStat.reason;
                addLog(`Couldn't group ban: already exists: ${gbReason}`);
            } else {
                let couldExile = true;

                noblox.exile(config.group, playerId).catch(() => {
                    couldExile = false;
                });

                let grbanError;

                groupBans
                    .insertOne({
                        id: playerId,
                        reason: reason,
                    })
                    .catch((err) => {
                        grbanError = err;
                    });

                if (!grbanError) {
                    addLog(`Banned from group. ${couldExile ? "" : "Couldn't exile."}`);
                } else {
                    addLog(`Couldn't group ban: error: ${grbanError}`);
                }
            }
        }

        if (allowGameBans) {
            const response = await Util.banInGame({
                toBanID: playerId,
                reason: reason,
                executor: executorPlayerId,
            });

            if (response.success) {
                addLog("Banned remotely in-game.");
            } else {
                addLog("Could not ban remotely due to internal error.");
            }
        }

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
        Description: "Bans a user from the group, game, and all NS-related Discord servers.",
        Usage: ";uban <User> <reason>",
        Permission: 6,
    }),
};
