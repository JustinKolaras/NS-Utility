/*global SyntaxBuilder, Util, mongoClient*/
/*eslint no-undef: "error"*/

require("dotenv").config();

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

        const args = Context.args;

        const banType = Util.verify(args[0], (self) => {
            return Util.isValid(self || ".", false, "add", "remove")[0];
        });
        const attributes = await Util.getUserAttributes(msg.guild, args[1]);

        if (!banType || !attributes.success) {
            return SyntaxErr();
        }

        const database = mongoClient.db("main");
        const repBans = database.collection("repBans");

        const currentStat = await repBans.findOne({ id: attributes.id });

        if (banType === "add") {
            if (currentStat) {
                return msg.reply(`This user is already banned from gaining reputation.`);
            }

            repBans
                .insertOne({
                    id: attributes.id,
                })
                .then(() => msg.reply(`Successfully banned user from gaining reputation.`))
                .catch((err) => msg.reply(`*Error:*\n\`\`\`\n${err}\n\`\`\``));
        } else if (banType === "remove") {
            if (!currentStat) {
                return msg.reply(`This user is not already banned from gaining reputation.`);
            }

            repBans
                .deleteOne(currentStat)
                .then(() => msg.reply(`Successfully removed ban.`))
                .catch((err) => msg.reply(`*Error:*\n\`\`\`\n${err}\n\`\`\``));
        }
    };
}

module.exports = {
    class: new Command({
        Name: "repban",
        Description: "Bans and prohibits a user from attaining reputation.",
        Usage: SyntaxBuilder.classifyCommand({ name: "repban" }).makeChoice(["add", "remove"], { exactify: true }).makeRegular("User").endBuild(),
        Permission: 5,
        Group: "Reputation",
    }),
};
