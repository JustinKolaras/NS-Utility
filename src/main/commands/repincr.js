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

        const attributes = await Util.getUserAttributes(Msg.guild, args[0]);
        const amt = parseInt(args[1]);

        if (!attributes.success || !amt || typeof amt !== "number") {
            return SyntaxErr();
        }

        const database = mongoClient.db("main");
        const reputation = database.collection("reputation");

        const userReputation = await reputation.findOne({ id: attributes.id });

        if (!userReputation) {
            return Msg.reply(`This user needs at least some reputation to increment.\nRun \`;repedit ${attributes.id} 0\` and try again.`);
        }

        reputation
            .updateOne(
                {
                    id: attributes.id,
                },
                {
                    $inc: {
                        reputationNum: amt,
                    },
                }
            )
            .then(() => Msg.reply(`Successfully altered reputation amount.`))
            .catch((err) => Msg.reply(`*Error:*\n\`\`\`\n${err}\n\`\`\``));
    };
}

module.exports = {
    class: new Command({
        Name: "repincr",
        Description: "Increments a user's reputation.",
        Usage: `;repincr <User> <amt>`,
        Permission: 6,
    }),
};
