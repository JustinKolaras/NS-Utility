require("dotenv").config();

const roleHandle = (member, currentRep) => {
    Util.handleRoles(member, {
        "953137241419571240": () => {
            return currentRep >= 10;
        },
        "927710449716318228": () => {
            return currentRep >= 50;
        },
        "927710734555688992": () => {
            return currentRep >= 135;
        },
        "927710891678502952": () => {
            return currentRep >= 300;
        },
        "927711487554900068": () => {
            return currentRep >= 500;
        },
        "927903591434428486": () => {
            return currentRep >= 700;
        },
        "927711654760841258": () => {
            return currentRep >= 1000;
        },
    }).catch((err) => {
        console.error(err);
        Util.dmUser([config.ownerId], `Could not assign role to \`${member.id}\`\n\`\`\`\n${err}\n\`\`\``);
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

        const attributes = await Util.getUserAttributes(msg.guild, args[0]);
        const amt = parseInt(args[1]);

        if (!attributes.success || !amt) {
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
                Util.dmUser([config.ownerId], `**Add Reputation to Incr Error**\n\`\`\`\n${err}\n\`\`\``);
                return msg.reply("There was an error adding reputation.");
            }
        }

        const previous = userReputation.reputationNum;

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
            .then(() => {
                Util.sendInChannel(
                    "761468835600924733",
                    "923715934370283612",
                    `Incremented <@${attributes.id}> REP from **${previous}** to **${previous + amt}**.`
                );
                roleHandle(attributes.member, userReputation.reputationNum + amt);
                msg.reply(`Successfully altered reputation amount.`);
            })
            .catch((err) => msg.reply(`*Error:*\n\`\`\`\n${err}\n\`\`\``));
    };
}

module.exports = {
    class: new Command({
        Name: "repincr",
        Description: "Increments a user's reputation.",
        Usage: SyntaxBuilder.classifyCommand({ name: "repincr" }).makeRegular("User").makeRegular("amount").endBuild(),
        Permission: 5,
        Group: "Reputation",
    }),
};
