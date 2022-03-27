require("dotenv").config();

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

        const args = Context.args;

        const banType = Util.verify(args[0], (self) => {
            return Util.isValid(self || ".", false, "add", "remove")[0];
        });

        let playerId;
        let logging = true;

        // Discord Mention Support
        const attributes = await Util.getUserAttributes(Msg.guild, args[1]);
        if (attributes.success) {
            const rblxInfo = await Util.getRobloxAccount(attributes.id);
            if (rblxInfo.success) {
                playerId = rblxInfo.response.robloxId;
            } else {
                logging = false;
                Msg.channel.send(`Could not get Roblox account via Discord syntax - this action won't be logged in moderation logs.`);
            }
        }

        // ID Support
        if (args[0].includes("#") && !attributes.success) {
            playerId = Util.parseNumericalsAfterHash(args[0])[0];
            if (isNaN(parseInt(playerId))) {
                return SyntaxErr();
            }
        }

        if (!banType || !attributes.success) {
            return SyntaxErr();
        }

        const database = mongoClient.db("main");
        const botBans = database.collection("botBans");
        const modLogs = database.collection("modLogs");

        const botBansData = await botBans.findOne({ id: attributes.id });
        const hasModLogs = await modLogs.findOne({ id: playerId });

        const dataFormAdd = {
            head: "Bot Ban",
            body: `**Executor:** ${Msg.member.user.tag} **@ ${Util.getDateNow()}**`,
        };
        const dataFormRemove = {
            head: "Bot Ban Removal",
            body: `**Executor:** ${Msg.member.user.tag} **@ ${Util.getDateNow()}**`,
        };

        if (banType === "add") {
            if (botBansData) {
                return Msg.reply("This user is already banned from using NS Utility.");
            }

            if (logging) {
                if (hasModLogs) {
                    const modLogData = hasModLogs.data;
                    modLogData.push(dataFormAdd);
                    await modLogs
                        .updateOne(
                            {
                                id: playerId,
                            },
                            { $set: { data: dataFormAdd } }
                        )
                        .catch((err) => Msg.reply(`*Error:*\n\`\`\`\n${err}\n\`\`\``));
                } else {
                    await modLogs
                        .insertOne({
                            id: playerId,
                            data: [dataFormAdd],
                        })
                        .catch((err) => Msg.reply(`*Error:*\n\`\`\`\n${err}\n\`\`\``));
                }
            }

            botBans
                .insertOne({
                    id: attributes.id,
                })
                .then(() => Msg.reply("Successfully banned user from using NS Utility."))
                .catch((err) => Msg.reply(`*Error:*\n\`\`\`\n${err}\n\`\`\``));
        } else if (banType === "remove") {
            if (!botBansData) {
                return Msg.reply("This user is not already banned from using NS Utility.");
            }

            if (logging) {
                if (hasModLogs) {
                    const modLogData = hasModLogs.data;
                    modLogData.push(dataFormRemove);
                    console.log(dataFormRemove);
                    await modLogs
                        .updateOne(
                            {
                                id: playerId,
                            },
                            { $set: { data: dataFormRemove } }
                        )
                        .catch((err) => Msg.reply(`*Error:*\n\`\`\`\n${err}\n\`\`\``));
                } else {
                    await modLogs
                        .insertOne({
                            id: playerId,
                            data: [dataFormRemove],
                        })
                        .catch((err) => Msg.reply(`*Error:*\n\`\`\`\n${err}\n\`\`\``));
                }
            }

            botBans
                .deleteOne(botBansData)
                .then(() => Msg.reply(`Successfully removed ban.`))
                .catch((err) => Msg.reply(`*Error:*\n\`\`\`\n${err}\n\`\`\``));
        }
    };
}

module.exports = {
    class: new Command({
        Name: "botban",
        Description: "Bans a user from running commands on NS Utility.",
        Usage: SyntaxBuilder.classifyCommand({ name: "botban" }).makeChoice(["add", "remove"], { exactify: true }).makeRegular("User").endBuild(),
        Permission: 7,
        Group: "Moderation",
    }),
};
