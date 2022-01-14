require("dotenv").config();

const Util = require("../externals/Util");

class Command {
    constructor(options) {
        for (const k in options) {
            this[k] = options[k];
        }
    }

    fn = async (Msg, Context) => {
        const args = Context.args;

        const attributes = await Util.getUserAttributes(Msg.guild, args[0]);
        const amt = parseInt(args[1]);

        if (!attributes.success || !amt || typeof amt !== "number") {
            return Msg.reply("**Syntax Error:** `;repedit <@user | userId> <amt>`");
        }

        const database = mongoClient.db("main");
        const reputation = database.collection("reputation");

        const currentStat = await reputation.findOne({ id: attributes.id });

        if (!currentStat) {
            return Msg.reply("This user needs at least some reputation to edit.");
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
        Usage: `;repedit <@user | userId> <amt>`,
        Permission: 6,
    }),
};
