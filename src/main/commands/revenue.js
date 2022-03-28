require("dotenv").config();

const { MessageEmbed } = require("discord.js");

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
        let revType = Util.upFirst(
            Util.verify(args[0], (self) => {
                return Util.isValid(self || ".", false, "day", "week", "month", "year")[0];
            })
        );

        if (!revType) {
            return SyntaxErr();
        }

        let revenueSummary;
        try {
            revenueSummary = await noblox.getGroupRevenueSummary(config.group, revType);
        } catch (err) {
            console.error(err);
            return Msg.reply("There was an issue while trying to gather revenue statistics.");
        }

        try {
            revenueSummary["currentFunds"] = await noblox.getGroupFunds(config.group);
        } catch (err) {
            console.error(err);
            return Msg.reply("There was an error while trying to gather group funds.");
        }

        for (const k in revenueSummary) {
            revenueSummary[k] = Util.sep(revenueSummary[k]);
        }

        let messageEmbed;
        try {
            messageEmbed = new MessageEmbed()
                .setColor("#3ac376")
                .setTitle(`Group Revenue (${revType})`)
                .setURL(`https://www.roblox.com/groups/configure?id=${config.group}#!/revenue`)
                .setDescription(
                    [
                        `Current Group Funds: **R$${revenueSummary.currentFunds}**`,
                        `Recurring Robux Stipend: **R$${revenueSummary.recurringRobuxStipend}**`,
                        `Item Sales: **R$${revenueSummary.itemSaleRobux}**`,
                        `Purchased Robux: **R$${revenueSummary.purchasedRobux}**`,
                        `Trade System: **R$${revenueSummary.tradeSystemRobux}**`,
                        `Pending: **R$${revenueSummary.pendingRobux}**`,
                        `Payed Out: **R$${revenueSummary.groupPayoutRobux}**`,
                        `ITG Robux: **R$${revenueSummary.individualToGroupRobux}**`,
                    ].join("\n")
                )
                .setTimestamp()
                .setFooter({ text: `Requested by ${Msg.member.user.tag}` });
        } catch (err) {
            console.error(err);
            return Msg.channel.send("There was an issue generating the revenue embed.");
        }

        return Msg.author
            .send({ embeds: [messageEmbed] })
            .then(() => Msg.reply("Sent you a DM with information."))
            .catch(() => Msg.reply("I couldn't DM you. Are your DMs off?"));
    };
}

module.exports = {
    class: new Command({
        Name: "revenue",
        Description: "DMs revenue statistics of a past timeframe.",
        Usage: SyntaxBuilder.classifyCommand({ name: "revenue" }).makeChoice(["day", "week", "month", "year"], { exactify: true }).endBuild(),
        Permission: 6,
        Group: "Remote",
    }),
};
