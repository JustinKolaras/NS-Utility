const { MessageEmbed } = require("discord.js");

const Util = require("../modules/Util");

class Command {
    constructor(options) {
        for (const k in options) {
            this[k] = options[k];
        }
    }

    fn = async (Msg, Context) => {
        const args = Context.args;
        const amt = parseInt(args[0]);

        if (!amt || typeof amt !== "number") {
            return Msg.reply("**Syntax Error:** `;tax <amount>`");
        }

        const sepAmt = Util.sep(amt);

        const percent70 = amt * 0.7;
        const percent30 = amt * 0.3;

        let messageEmbed;
        try {
            messageEmbed = new MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Tax Calculator")
                .setDescription("Calculations of a **30%** tax rate:")
                .addFields(
                    {
                        name: "Gross",
                        value: sepAmt,
                    },
                    {
                        name: "Net",
                        value: Util.sep(percent70),
                    },
                    {
                        name: "Deducted",
                        value: Util.sep(percent30),
                    },
                    {
                        name: "To Cover Tax",
                        value: Util.sep(Math.round(amt / 0.7)),
                    }
                )
                .setTimestamp()
                .setFooter({ text: `Requested by ${Msg.member.user.tag}` });
        } catch (err) {
            console.error(err);
            return Msg.channel.send("There was an issue generating the embed.");
        }

        return Msg.channel.send({ embeds: [messageEmbed] });
    };
}

module.exports = {
    class: new Command({
        Name: "tax",
        Description: "Calculates tax details of a robux amount.",
        Usage: `;tax <amount>`,
        Permission: 0,
    }),
};
