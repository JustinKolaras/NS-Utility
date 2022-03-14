require("dotenv").config();

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

        if (!attributes.success || (!amt && amt !== 0)) {
            return SyntaxErr();
        }

        const database = mongoClient.db("main");
        const reputation = database.collection("reputation");

        const userReputation = await reputation.findOne({ id: attributes.id });

        if (!userReputation) {
            try {
                reputation.insertOne({
                    id: attributes.id,
                    reputationNum: 0,
                });
            } catch (err) {
                Util.dmUser([Config.ownerId], `**Add Reputation to Edit Error**\n\`\`\`\n${err}\n\`\`\``);
                return Msg.reply("There was an error adding reputation.");
            }
        }

        reputation
            .updateOne(
                {
                    id: attributes.id,
                },
                {
                    $set: {
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
        Name: "repedit",
        Description: "Edits a user's reputation.",
        Usage: SyntaxBuilder.classifyCommand({ name: "repedit" }).makeRegular("User").makeRegular("amount").endBuild(),
        Permission: 6,
    }),
};
