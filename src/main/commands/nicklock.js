/*global SyntaxBuilder, mongoClient*/
/*eslint no-undef: "error"*/

require("dotenv").config();

const Permissions = require("../modules/Permissions");
const Util = require("../modules/Util");

const database = mongoClient.db("main");
const nickLocks = database.collection("nickLocks");

const update = (member, newNick, oldNick) => {
    return nickLocks.insertOne({
        id: member.id,
        data: newNick,
        old: oldNick,
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

        if (!attributes.success || !toleranceType) {
            return SyntaxErr();
        }

        const userPermission = Permissions.validate(attributes.member);
        if (userPermission >= Context.permission) {
            return msg.reply("You can't lock the nickname of this user.");
        }

        const userLock = await nickLocks.findOne({ id: attributes.id });

        if (toleranceType === "add") {
            if (userLock) return msg.reply("This user already has their nickname locked. Remove their lock and try again.");

            const oldNick = attributes.member.nickname;

            if (data) {
                await attributes.member.setNickname(data).catch(() => {});
            }

            update(attributes.member, data ?? oldNick, oldNick)
                .then(() => msg.reply(`Successfully locked nickname.${!data ? " You never provided a new nickname, so I locked it at the original." : ""}`))
                .catch((err) => {
                    console.error(err);
                    msg.reply("There was an error.");
                });
        } else if (toleranceType === "remove") {
            if (!userLock) return msg.reply("This user does not have their nickname locked.");

            nickLocks
                .deleteOne(userLock)
                .then(() => msg.reply("Successfully removed nickname lock. I'll change their nickname back."))
                .catch((err) => {
                    console.error(err);
                    msg.reply("There was an error.");
                });

            await attributes.member.setNickname(userLock.old).catch(() => {});
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
            .makeRegular("data", { optional: true })
            .endBuild(),
        Permission: 3,
        Group: "Moderation",
    }),
};
