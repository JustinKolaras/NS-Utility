const { MessageEmbed } = require("discord.js");

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
        const revType = util.verify(args[0], (self) => {
            return util.isValid(self || ".", false, "day", "week", "month", "year")[0];
        });

        if (!revType || args.length < 1) {
            return void Msg.reply('**Syntax Error:** `;revenue <"day" | "week" | "month" | "year">`');
        }

        let revenueSummary;
        try {
            revenueSummary = await noblox.getGroupRevenueSummary(config.group, util.upFirst(revType).toString());
        } catch (err) {
            console.error(err);
            return void Msg.reply("There was an issue while trying to gather revenue statistics.");
        }

        try {
            revenueSummary["currentFunds"] = await noblox.getGroupFunds(config.group);
        } catch (err) {
            console.error(err);
            return void Msg.reply("There was an error while trying to gather group funds.");
        }

        let messageEmbed;
        try {
            for (const k in revenueSummary) {
                revenueSummary[k] = util.sep(revenueSummary[k]).toString();
            }

            messageEmbed = new MessageEmbed()
                .setColor("#3ac376")
                .setTitle(`Group Revenue (${util.upFirst(revType).toString()})`)
                .setURL(`https://www.roblox.com/groups/configure?id=${config.group}#!/revenue`)
                .setDescription(
                    `Current Group Funds: **R$${revenueSummary.currentFunds}**
                    
                    Recurring Robux Stipend: **R$${revenueSummary.recurringRobuxStipend}**
                    Item Sales: **R$${revenueSummary.itemSaleRobux}**
                    Purchased Robux: **R$${revenueSummary.purchasedRobux}**
                    Trade System: **R$${revenueSummary.tradeSystemRobux}**
                    Pending: **R$${revenueSummary.pendingRobux}**
                    Payed Out: **R$${revenueSummary.groupPayoutRobux}**
                    ITG Robux: **R$${revenueSummary.individualToGroupRobux}**`
                )
                .setTimestamp()
                .setFooter(`Requested by ${Msg.member.user.tag}`);
        } catch (err) {
            console.error(err);
            return void Msg.channel.send("There was an issue generating the revenue embed. <@360239086117584906>");
        }

        Msg.author
            .send({ embeds: [messageEmbed] })
            .then(() => {
                Msg.reply("Sent you a DM with information.");
            })
            .catch(() => {
                Msg.reply("I couldn't DM you. Are your DMs off?");
            });
    };
}

module.exports = {
    class: new Command({
        Name: "revenue",
        Description: "DMs revenue statistics of a past timeframe.",
        Usage: `;revenue <"day" | "week" | "month" | "year">`,
        Permission: 6,
    }),
};
