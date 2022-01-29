const { MessageEmbed } = require("discord.js");

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

        const args = Context.args;
        const amt = parseInt(args[0]);

        if (!amt || typeof amt !== "number") {
            return SyntaxErr();
        }

        const percent70 = Math.round(amt * 0.7);
        const percent30 = Math.round(amt * 0.3);
        const toCoverTax = Math.round(amt / 0.7);

        let messageEmbed;
        try {
            messageEmbed = new MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Tax Calculator")
                .setDescription("Calculations of a **30%** tax rate:")
                .addFields(
                    {
                        name: "Gross",
                        value: Util.sep(amt),
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
                        value: `${Util.sep(toCoverTax)} (+${Util.sep(toCoverTax - amt)})`,
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
