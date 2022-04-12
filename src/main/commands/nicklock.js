/*global SyntaxBuilder, mongoClient*/
/*eslint no-undef: "error"*/

require("dotenv").config();

const Permissions = require("../modules/Permissions");
const Util = require("../modules/Util");

const database = mongoClient.db("main");
const nickLocks = database.collection("nickLocks");

const update = (member, data) => {
    return nickLocks.insertOne({
        id: member.id,
        data: data,
    });
};

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

        const toleranceType = Util.verify(args[0], (self) => {
            return Util.isValid(self || ".", false, "add", "remove")[0];
        });
        const attributes = await Util.getUserAttributes(msg.guild, args[1]);
        const data = Util.combine(args, 2);

        if (!attributes.success || !toleranceType || (!data && toleranceType === "add")) {
            return SyntaxErr();
        }

        const userPermission = Permissions.validate(attributes.member);
        if (userPermission >= Context.permission) {
            return msg.reply("Insufficient permissions.");
        }

        const userLock = await nickLocks.findOne({ id: attributes.id });

        if (toleranceType === "add") {
            if (userLock) return msg.reply("This user already has their nickname locked. Remove their lock and try again.");

            await attributes.member.setNickname(data).catch(() => {});

            update(attributes.member, data)
                .then(() => msg.reply("Successfully locked nickname."))
                .catch((err) => {
                    console.error(err);
                    msg.reply("There was an error.");
                });
        } else if (toleranceType === "remove") {
            if (!userLock) return msg.reply("This user does not have their nickname locked.");

            nickLocks
                .deleteOne(userLock)
                .then(() => msg.reply("Successfully removed nickname lock."))
                .catch((err) => {
                    console.error(err);
                    msg.reply("There was an error.");
                });
        }
    };
}

module.exports = {
    class: new Command({
        Name: "nicklock",
        Description: "Locks a user's nickname.",
        Usage: SyntaxBuilder.classifyCommand({ name: "nicklock" })
            .makeChoice(["add", "remove"], { exactify: true })
            .makeRegular("User")
            .makeRegular("data")
            .endBuild(),
        Permission: 3,
        Group: "Moderation",
    }),
};
