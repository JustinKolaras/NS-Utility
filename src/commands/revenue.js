const { MessageEmbed } = require("discord.js");

const noblox = require("noblox.js");
const config = require("../config.json");
const util = require("../modules/util");

const makeEmbed = (src, revSum, revType, requester) => {
    try {
        for (const k in revSum) {
            revSum[k] = util.sep(revSum[k]).toString();
        }

        const toReturn = new MessageEmbed()
            .setColor("#3ac376")
            .setTitle(`Group Revenue (${util.upFirst(revType).toString()})`)
            .setURL(`https://www.roblox.com/groups/configure?id=${config.group}#!/revenue`)
            .setDescription(
                `Recurring Robux Stipend: **R$${revSum.recurringRobuxStipend}**
                Item Sales: **R$${revSum.itemSaleRobux}**
                Purchased Robux: **R$${revSum.purchasedRobux}**
                Trade System: **R$${revSum.tradeSystemRobux}**
                Pending: **R$${revSum.pendingRobux}**
                Payed Out: **R$${revSum.groupPayoutRobux}**
                ITG Robux: **R$${revSum.individualToGroupRobux}**`
            )
            .setTimestamp()
            .setFooter(`Requested by ${requester}`);

        return toReturn;
    } catch (err) {
        console.log(err);
        return src.channel.send("There was an issue generating the revenue embed. <@360239086117584906>");
    }
};

const run = async (src, context) => {
    try {
        await noblox.setCookie(config.cookie);
    } catch (err) {
        return src.reply("Issue logging into NSGroupOwner. <@360239086117584906>\nRoblox may be down.");
    }

    const args = context.args;
    const revType = util.verify(args[0], (self) => {
        return util.isValid(self || ".", false, "day", "week", "month", "year")[0];
    });

    if (!revType || args.length < 1) {
        return src.reply('**Syntax Error:** `;revenue <"day" | "week" | "month" | "year">`');
    }

    let revenueSummary;
    try {
        revenueSummary = await noblox.getGroupRevenueSummary(config.group, util.upFirst(revType).toString());
    } catch (err) {
        console.log(err);
        return src.reply("There was an issue while trying to gather revenue statistics.");
    }

    const embed = makeEmbed(src, revenueSummary, revType, src.member.user.tag);

    src.author
        .send({ embeds: [embed] })
        .then(() => {
            src.reply("Sent you a DM with information.");
        })
        .catch(() => {
            src.reply("I couldn't DM you. Are your DMs off?");
        });
};

module.exports = {
    execute: run,
    name: "revenue",
    permission: 6,
    description: "Outputs revenue statistics for the group.",
    usage: `;revenue <"day" | "week" | "month" | "year">`,
};
