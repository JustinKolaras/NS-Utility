const { MessageActionRow, MessageButton } = require("discord.js");

const noblox = require("noblox.js");
const config = require("../config.json");
const util = require("../modules/util");

class Command {
    constructor(options) {
        for (const k in options) {
            this[k] = options[k];
        }
    }

    fn = async (Msg, Context) => {
        try {
            await noblox.setCookie(config.cookie);
        } catch (err) {
            console.error(err);
            return void Msg.reply("Issue logging into NSGroupOwner. <@360239086117584906>\nRoblox may be down.");
        }

        const args = Context.args;
        const authorKey = util.getKey(Msg.member.id);
        const key = util.verify(args[2], (self) => {
            return authorKey[0] === true && self === authorKey[1];
        });
        const errMessage = util.makeError("There was an issue while trying to payout this user.", [
            "Your argument does not match a valid username, amount, or encryption key.",
            "The user is not in the group.",
            "The user does not meet the minimum age requirement. (you cannot payout new users!)",
            "The group does not have enough funds.",
        ]);

        let playerName = args[0];
        let playerId;

        let amt = parseInt(args[1]);

        if (!playerName || !amt || typeof amt !== "number" || !key) {
            return void Msg.reply("**Syntax Error:** `;payout <username> <amount> <key>`");
        }

        if (amt > 3000) {
            return void Msg.reply("Too high amount; please do this manually.");
        } else if (amt < 1) {
            return void Msg.reply("Too low amount; payout amount must be greater than 0.");
        }

        try {
            playerId = await noblox.getIdFromUsername(playerName);
        } catch (err) {
            console.error(err);
            return void Msg.reply(errMessage);
        }

        let rankId;
        try {
            rankId = await noblox.getRankInGroup(config.group, playerId);
        } catch (err) {
            console.error(err);
            return void Msg.reply(errMessage);
        }

        if (rankId < 250 || rankId > 255) {
            return void Msg.reply("Invalid rank! You can only payout members ranked **Designer** or above.");
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

        const mainInter = await Msg.channel.send({
            // prettier-ignore
            content: `<@${Msg.member.id}>, Are you sure you want to payout **R$${util.sep(amt)}** to **${playerName}**? **This action is stricly irreversible.**`,
            components: [row],
        });

        collector.on("collect", async (i) => {
            if (i.customId === "confirm") {
                noblox
                    .groupPayout(config.group, playerId, amt)
                    .then(() => {
                        collector.stop();
                        return void mainInter.edit({
                            content: `<@${Msg.member.id}>, Payed out user successfully.`,
                            components: [],
                        });
                    })
                    .catch((err) => {
                        collector.stop();
                        console.error(err);
                        return void mainInter.edit({
                            content: errMessage,
                            components: [],
                        });
                    });
            } else if (i.customId === "reject") {
                collector.stop();
                return void mainInter.edit({
                    content: `<@${Msg.member.id}>, Cancelled command execution.`,
                    components: [],
                });
            }
        });

        collector.on("end", async (_, reason) => {
            if (reason === "time") {
                return void mainInter.edit({
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
