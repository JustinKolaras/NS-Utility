require("dotenv").config();

const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

const uuid = require("uuid");
const noblox = require("noblox.js");
const PayoutAccount = require("../modules/PayoutAccount");
const Accounts = new PayoutAccount();

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

        const editType = Util.verify(args[0], (self) => {
            return Util.isValid(self || ".", false, "add", "remove")[0];
        });
        const playerName = args[1];
        const errMessage = Util.makeError("There was an issue while trying to gather information on the account provided.", [
            "Your argument does not match a valid username.",
            "You mistyped the username.",
        ]);

        let playerId;

        if (!editType || !playerName) {
            return SyntaxErr();
        }

        // ID Support
        if (args[1].includes("#")) {
            playerId = Util.parseNumericalsAfterHash(args[1])[0];
            if (isNaN(parseInt(playerId))) {
                return SyntaxErr();
            }
        }

        if (!playerId) {
            try {
                playerId = await noblox.getIdFromUsername(playerName);
            } catch (err) {
                console.error(err);
                return msg.reply(errMessage);
            }
        }

        if (editType === "add") {
            const keyGen = uuid.v4();

            const embed = new MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Add Account")
                .setDescription(
                    `Please navigate to your [account bio](https://www.roblox.com/users/${playerId}/profile) and change your **About Me** section to include the text in the **Bio Contents** field. Please hit the **Save** button when completed.\n\nYou have 120 seconds.`
                )
                .addField("Bio Contents", `\`\`\`\n${keyGen}\`\`\``)
                .setTimestamp();

            const row = new MessageActionRow().addComponents(new MessageButton().setCustomId("save").setLabel("Save").setStyle("PRIMARY"));

            const main = await msg.reply({ content: `<@${msg.member.id}>,`, embeds: [embed], components: [row] });

            const filter = (i) => i.member.id === msg.author.id;
            const collector = msg.channel.createMessageComponentCollector({
                filter,
                time: 30000,
            });

            collector.on("collect", async () => {
                await collector.stop();

                // Check Bio
                let info;
                try {
                    info = await noblox.getPlayerInfo(playerId);
                } catch (err) {
                    console.error(err);
                    return msg.reply(errMessage);
                }

                if (info.blurb.includes(keyGen)) {
                    await Accounts.add(msg.member.id, {
                        label: info.username,
                        description: `Account: ${playerId}`,
                        value: playerId.toString(),
                    });

                    return main.edit({
                        content: "Success! Your account has been added as a registered payout account.\nYou can remove the key from your bio.",
                        embeds: [],
                    });
                } else {
                    return main.edit({ content: "I couldn't find the key in your bio. Please try again.", embeds: [] });
                }
            });

            collector.on("end", (_, reason) => {
                if (reason === "time") {
                    main.delete().catch(() => {});
                    msg.delete().catch(() => {});
                }
            });
        }
    };
}

module.exports = {
    class: new Command({
        Name: "payoutacc",
        Description: "Adds a new eligible payout-request account.",
        Usage: SyntaxBuilder.classifyCommand({ name: "payoutacc" }).makeChoice(["add", "remove"], { exactify: true }).makeRegular("User").endBuild(),
        Permission: 7,
        Group: "Payouts",
    }),
};
