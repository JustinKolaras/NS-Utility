require("dotenv").config();

const Util = require("../modules/Util");

class Command {
    constructor(options) {
        for (const k in options) {
            this[k] = options[k];
        }
    }

    fn = async (Msg, _, mongoClient) => {
        const database = mongoClient.db("main");
        const reputation = database.collection("reputation");

        const currentStat = await reputation.findOne({ id: Msg.author.id });

        let amount = 0;
        let response;
        amount = currentStat?.reputationNum || 0;

        if (amount < 1) {
            response = `:innocent: :innocent: Hello! The mighty kingdom of NS Reputation :crown: told me you have **${Util.sep(
                amount
            )}** reputation points in your bank today. That's not good.. :grimacing: :sleepy: :worried:`;
        } else if (amount < 20) {
            response = `:innocent: :innocent: Hello! The mighty kingdom of NS Reputation :crown: told me you have **${Util.sep(
                amount
            )}** reputation points in your bank today. At least that's something..? :pray: :zany_face: :confounded:`;
        } else if (amount < 100) {
            response = `:innocent: :innocent: Hello! The mighty kingdom of NS Reputation :crown: told me you have **${Util.sep(
                amount
            )}** reputation points in your bank today. Niiicee!! I like it. :star_struck: :astonished: :stuck_out_tongue_closed_eyes: :stuck_out_tongue_closed_eyes:`;
        } else if (amount >= 100) {
            response = `:innocent: :innocent: Hello! The mighty kingdom of NS Reputation :crown: told me you have **${Util.sep(
                amount
            )}** reputation points in your bank today. :money_with_wings: :money_with_wings: Gosh, go ahead and share some! :gem: :gem: :money_mouth:`;
        } else {
            return Msg.reply("There was an error.");
        }

        return Msg.reply(response);
    };
}

module.exports = {
    class: new Command({
        Name: "rep",
        Description: "Outputs the command executor's reputation points.",
        Usage: `;rep`,
        Permission: 0,
    }),
};
