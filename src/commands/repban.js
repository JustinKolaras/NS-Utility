require("dotenv").config();

const util = require("../modules/Util");

class Command {
    constructor(options) {
        for (const k in options) {
            this[k] = options[k];
        }
    }

    fn = async (Msg, Context, mongoClient) => {
        const args = Context.args;

        const banType = util.verify(args[0], (self) => {
            return util.isValid(self || ".", false, "add", "remove")[0];
        });
        const attributes = await util.getUserAttributes(Msg.guild, args[1]);

        if (!banType || !attributes.success) {
            return void Msg.reply('**Syntax Error:** `;repban <"add" | "remove"> <@user | userId>`');
        }

        const database = mongoClient.db("main");
        const repBans = database.collection("repBans");

        const currentStat = await repBans.findOne({ id: attributes.id });

        if (banType === "add") {
            if (currentStat) {
                return void Msg.reply(`This user is already banned from gaining reputation.`);
            }

            repBans
                .insertOne({
                    id: attributes.id,
                })
                .then(() => Msg.reply(`Successfully banned user from gaining reputation.`))
                .catch((err) => Msg.reply(`*Error:*\n\`\`\`\n${err}\n\`\`\``));
        } else if (banType === "remove") {
            if (!currentStat) {
                return void Msg.reply(`This user is not already banned from gaining reputation.`);
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
        Usage: `;repban <"add" | "remove"> <@user | userId>`,
        Permission: 5,
    }),
};
