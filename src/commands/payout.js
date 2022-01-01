require("dotenv").config();

const { MessageActionRow, MessageButton } = require("discord.js");

const noblox = require("noblox.js");
const config = require("../config.json");
const Util = require("../modules/Util");

class Command {
    constructor(options) {
        for (const k in options) {
            this[k] = options[k];
        }
    }

    fn = async (Msg, Context) => {
        try {
            await noblox.setCookie(process.env.cookie);
        } catch (err) {
            console.error(err);
            return Msg.reply("Issue logging into NSGroupOwner. <@360239086117584906>\nRoblox may be down.");
        }

        const args = Context.args;
        const authorKey = Util.getKey(Msg.member.id);
        const key = Util.verify(args[2], (self) => {
            return authorKey[0] === true && self === authorKey[1];
        });
        const errMessage = Util.makeError("There was an issue while trying to payout this user.", [
            "Your argument does not match a valid username, amount, or encryption key.",
            "The user is not in the group.",
            "The user does not meet the minimum age requirement. (you cannot payout new users!)",
            "The group does not have enough funds.",
        ]);

        let playerName = args[0];
        let playerId;
        let amt = parseInt(args[1]);

        if (!playerName || !amt || typeof amt !== "number" || !key) {
            return Msg.reply("**Syntax Error:** `;payout <username> <amount> <key>`");
        }

        if (amt > 3000) {
            return Msg.reply("Too high amount; please do this manually.");
        } else if (amt < 1) {
            return Msg.reply("Too low amount; payout amount must be greater than 0.");
        }

        try {
            playerId = await noblox.getIdFromUsername(playerName);
        } catch (err) {
            console.error(err);
            return Msg.reply(errMessage);
        }

        const row = new MessageActionRow().addComponents(
            new MessageButton().setCustomId("confirm").setLabel("Confirm").setStyle("PRIMARY"),
            new MessageButton().setCustomId("reject").setLabel("Reject").setStyle("DANGER")
        );

        Msg.delete();

        const filter = (i) => i.member.id === Msg.author.id;
        const collector = Msg.channel.createMessageComponentCollector({
            filter,
            time: 30000,
        });

        const main = await Msg.channel.send({
            // prettier-ignore
            content: `<@${Msg.member.id}>, Are you sure you want to payout **R$${Util.sep(amt)}** to **${playerName}**? **This action is stricly irreversible.**`,
            components: [row],
        });

        collector.on("collect", async (i) => {
            if (i.customId === "confirm") {
                noblox
                    .groupPayout(config.group, playerId, amt)
                    .then(() => {
                        collector.stop();
                        return main.edit({
                            content: `<@${Msg.member.id}>, Paid out user successfully.`,
                            components: [],
                        });
                    })
                    .catch((err) => {
                        collector.stop();
                        console.error(err);
                        return main.edit({
                            content: errMessage,
                            components: [],
                        });
                    });
            } else if (i.customId === "reject") {
                collector.stop();
                return main.edit({
                    content: `<@${Msg.member.id}>, Cancelled command execution.`,
                    components: [],
                });
            }
        });

        collector.on("end", async (_, reason) => {
            if (reason === "time") {
                return main.edit({
                    content: `<@${Msg.member.id}>, Cancelled command execution.`,
                    components: [],
                });
            }
        });
    };
}

module.exports = {
    class: new Command({
        Name: "payout",
        Description: "Pays robux out from the group to a specific user.",
        Usage: ";payout <username> <amount> <key>",
        Permission: 6,
    }),
};
