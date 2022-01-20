require("dotenv").config();

const { MessageActionRow, MessageButton } = require("discord.js");

const noblox = require("noblox.js");
const Util = require("../externals/Util");

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
        const amt = parseInt(args[0]);
        const reason = Util.combine(args, 1);

        const errMessage = Util.makeError("There was an issue while trying to submit a payout request.", [
            "Your argument does not match a valid amount.",
            "There was an unexpected internal error.",
        ]);
        const errMessageAdmin = Util.makeError("There was an issue while trying to payout this user.", [
            "The user is not in the group.",
            "The user does not meet the minimum age requirement. (you cannot payout new users!)",
            "The group does not have enough funds.",
        ]);

        let playerId;
        let playerName;

        const rblxInfo = await Util.getRobloxAccount(Msg.author.id);
        if (rblxInfo.success) {
            playerId = rblxInfo.response.robloxId;
        } else {
            return Msg.reply(`Could not get Roblox account. If you're not verified with RoVer, please do so via the \`!verify\` command and try again.`);
        }

        if (!amt || typeof amt !== "number" || !reason) {
            return Msg.reply("**Syntax Error:** `;payoutreq <amount> <reason>`");
        }

        if (amt > 3000) {
            return Msg.reply("Too high amount to request.");
        } else if (amt < 1) {
            return Msg.reply("Too low amount; payout amount must be greater than 0.");
        }

        try {
            playerName = await noblox.getUsernameFromId(playerId);
        } catch (err) {
            console.error(err);
            return Msg.reply(errMessage);
        }

        let continuing = false;

        const confFilter = (i) => i.member.id === Msg.author.id;
        const confCollector = Msg.channel.createMessageComponentCollector({
            confFilter,
            time: 30000,
        });

        const confRow = new MessageActionRow().addComponents(
            new MessageButton().setCustomId("confirm").setLabel("Confirm").setStyle("PRIMARY"),
            new MessageButton().setCustomId("reject").setLabel("Reject").setStyle("DANGER")
        );

        const confMsg = await Msg.reply({
            content: `You are requesting a payout for your account **${playerName}**. Is this correct?\nhttps://roblox.com/users/${playerId}/profile`,
            components: [confRow],
        });

        confCollector.on("collect", (i) => {
            if (i.customId === "confirm") {
                confCollector.stop();
                confMsg.delete().catch(() => {});
                continuing = true;
            } else if (i.customId === "reject") {
                confCollector.stop();
                confMsg.delete().catch(() => {});
                Msg.delete().catch(() => {});
            }
        });

        confCollector.on("end", (_, reason) => {
            if (reason === "time") {
                confMsg.delete().catch(() => {});
                Msg.delete().catch(() => {});
            }
        });

        await Util.waitUntil(() => {
            return continuing === true;
        });

        const logChannel = await Util.getChannel(Msg.guild, "930350546232147998");
        if (!logChannel) {
            return Msg.reply("I couldn't retrieve proper configuration channels.");
        }

        const row = new MessageActionRow().addComponents(
            new MessageButton().setCustomId(`accept-${playerId}`).setLabel("Accept").setStyle("SUCCESS"),
            new MessageButton().setCustomId(`decline-${playerId}`).setLabel("Decline").setStyle("DANGER")
        );

        const filter = (i) => Util.hasRole(i.member, "851082141235937300");
        const collector = logChannel.createMessageComponentCollector({
            filter,
            time: 8.64e7,
        });

        const msgContent = `@everyone, New payout request from **${playerName}** (${Msg.member.user.tag} :: ${Msg.author.id}):\n\n**R$:** ${Util.sep(
            amt
        )}\n**Reason:** ${reason}\n\n**Accepting this request is stricly irreversible.**\nThis request will expire in 24 hours if no option is selected.`;

        const main = await logChannel.send({
            content: msgContent,
            components: [row],
        });

        collector.on("collect", (i) => {
            const sepAmt = Util.sep(amt);
            if (i.customId === `accept-${playerId}`) {
                noblox
                    .groupPayout(config.group, playerId, amt)
                    .then(() => {
                        collector.stop();
                        Msg.author
                            .send(`Your payout request was accepted by ${i.member.user.tag}. **R$${sepAmt}** has been credited into your account.`)
                            .catch(() => {});
                        return main.edit({
                            content: `@everyone, Payout request from **${playerName}** accepted by <@${i.member.id}> (${i.member.user.tag} :: ${i.member.id})\n**R$${sepAmt}**`,
                            components: [],
                        });
                    })
                    .catch((err) => {
                        collector.stop();
                        console.error(err);
                        return main.edit({
                            content: errMessageAdmin,
                            components: [],
                        });
                    });
            } else if (i.customId === `decline-${playerId}`) {
                collector.stop();
                Msg.author.send(`Your payout request was declined by ${i.member.user.tag}. No robux have been credited into your account.`).catch(() => {});
                return main.edit({
                    content: `@everyone, Payout request from **${playerName}** declined by <@${i.member.id}> (${i.member.user.tag} :: ${i.member.id})`,
                    components: [],
                });
            }
        });

        collector.on("end", (_, reason) => {
            if (reason === "time") {
                Msg.author.send("Your payout request has expired! (no one accepted/declined) No robux have been credited into your account.").catch(() => {});
                return main.edit({
                    content: `@everyone, Payout request from **${playerName}** expired! (24 hours)`,
                    components: [],
                });
            }
        });

        Msg.reply("Your request has been sent for review.");
    };
}

module.exports = {
    class: new Command({
        Name: "payoutreq",
        Description: "Requests a group payment for review.",
        Usage: ";payoutreq <amount> <reason>",
        Permission: 0,
        Restriction: {
            byCategory: {
                whitelisted: ["796084853480357940", "762726634104553492"],
                errorMessage: "Please run this command in the **Design Team** category.",
            },
        },
    }),
};
