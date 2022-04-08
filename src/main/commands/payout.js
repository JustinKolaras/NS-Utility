require("dotenv").config();

const { MessageActionRow, MessageButton } = require("discord.js");

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
        const errMessage = Util.makeError("There was an issue while trying to payout this user.", [
            "Your argument does not match a valid username or amount.",
            "The user is not in the group.",
            "The user does not meet the minimum age requirement. (you cannot payout new users!)",
            "The group does not have enough funds.",
        ]);

        let playerName = args[0];
        let playerId;
        let amt = parseInt(args[1]);

        if (!playerName || !amt || typeof amt !== "number") {
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

        if (amt > 3000) {
            return msg.reply("Too high amount; please do this manually.");
        } else if (amt < 1) {
            return msg.reply("Too low amount; payout amount must be greater than 0.");
        }

        if (!playerId) {
            try {
                playerId = await noblox.getIdFromUsername(playerName);
            } catch (err) {
                console.error(err);
                return msg.reply(errMessage);
            }
        }

        try {
            playerName = await noblox.getUsernameFromId(playerId);
        } catch (err) {
            console.error(err);
            return msg.reply(errMessage);
        }

        const disabledRow = new MessageActionRow().addComponents(
            new MessageButton().setCustomId("confirm").setLabel("Confirm").setStyle("PRIMARY").setDisabled(true),
            new MessageButton().setCustomId("reject").setLabel("Reject").setStyle("DANGER").setDisabled(true)
        );

        const row = new MessageActionRow().addComponents(
            new MessageButton().setCustomId("confirm").setLabel("Confirm").setStyle("PRIMARY"),
            new MessageButton().setCustomId("reject").setLabel("Reject").setStyle("DANGER")
        );

        const filter = (i) => i.member.id === msg.author.id;
        const collector = msg.channel.createMessageComponentCollector({
            filter,
            time: 33000,
        });

        let msgContent = `<@%ID>, Are you sure you want to payout **R$%AMT** to **%NAME**? **This action is stricly irreversible.**\nThis command will cancel in 30 seconds if no option is selected.`;
        msgContent = msgContent.replace("%ID", msg.member.id);
        msgContent = msgContent.replace("%AMT", Util.sep(amt));
        msgContent = msgContent.replace("%NAME", playerName);

        const main = await msg.channel.send({
            content: msgContent,
            components: [disabledRow],
        });

        for (let i = 2; i > 0; i--) {
            await main.edit({
                content: msgContent + `\nButtons will activate in **${i}** ${i === 1 ? "second" : "seconds"}.`,
                components: [disabledRow],
            });
            await Util.sleep(1000);
        }

        await main.edit({
            content: msgContent,
            components: [row],
        });

        collector.on("collect", async (i) => {
            await i.deferReply(); // The noblox API request can rarely take over 3 seconds. This happened before.
            await main.edit({ content: msgContent, components: [] });
            await collector.stop();
            if (i.customId === "confirm") {
                noblox
                    .groupPayout(config.group, playerId, amt)
                    .then(() => i.editReply(`Paid out user successfully.`))
                    .catch((err) => {
                        console.error(err);
                        i.editReply({
                            content: errMessage,
                        });
                    });
            } else if (i.customId === "reject") {
                i.editReply(`Cancelled command execution.`);
            }
        });

        collector.on("end", (_, reason) => {
            if (reason === "time") {
                main.edit({ content: `<@${msg.author.id}>, Cancelled command execution.`, components: [] });
            }
        });
    };
}

module.exports = {
    class: new Command({
        Name: "payout",
        Description: "Pays robux out from the group to a specific user.",
        Usage: SyntaxBuilder.classifyCommand({ name: "payout" }).makeRegular("User").makeRegular("amount").endBuild(),
        Permission: 6,
        Group: "Payouts",
    }),
};
