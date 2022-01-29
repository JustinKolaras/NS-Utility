require("dotenv").config();

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

        const banType = Util.verify(args[0], (self) => {
            return Util.isValid(self || ".", false, "add", "remove")[0];
        });
        const attributes = await Util.getUserAttributes(Msg.guild, args[1]);

        if (!banType || !attributes.success) {
            return SyntaxErr();
        }

        const database = mongoClient.db("main");
        const repBans = database.collection("repBans");

        const currentStat = await repBans.findOne({ id: attributes.id });

        if (banType === "add") {
            if (currentStat) {
                return Msg.reply(`This user is already banned from gaining reputation.`);
            }

            repBans
                .insertOne({
                    id: attributes.id,
                })
                .then(() => Msg.reply(`Successfully banned user from gaining reputation.`))
                .catch((err) => Msg.reply(`*Error:*\n\`\`\`\n${err}\n\`\`\``));
        } else if (banType === "remove") {
            if (!currentStat) {
                return Msg.reply(`This user is not already banned from gaining reputation.`);
            }

            repBans
                .deleteOne(currentStat)
                .then(() => Msg.reply(`Successfully removed ban.`))
                .catch((err) => Msg.reply(`*Error:*\n\`\`\`\n${err}\n\`\`\``));
        }
    };
}

module.exports = {
    class: new Command({
        Name: "repban",
        Description: "Bans and prohibits a user from attaining reputation.",
        Usage: `;repban <"add" | "remove"> <User>`,
        Permission: 5,
    }),
};
