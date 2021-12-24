require("dotenv").config();

const util = require("../modules/util");

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

        if (amount < 20) {
            response = `:innocent: :innocent: Hello! The mighty kingdom of NS Reputation :crown: told me you had **${amount}** reputation in your bank today. That's not good.. :grimacing: :sleepy: :worried:`;
        } else if (amount < 100) {
            response = `:innocent: :innocent: Hello! The mighty kingdom of NS Reputation :crown: told me you had **${amount}** reputation in your bank today. Seems pretty average. :grin: :pray:`;
        } else if (amount >= 100) {
            response = `:innocent: :innocent: Hello! The mighty kingdom of NS Reputation :crown: told me you had **${amount}** reputation in your bank today. :money_with_wings: :money_with_wings: Gosh, go ahead and share some! :gem: :gem: :money_mouth:`;
        }

        return void Msg.reply(response);
    };
}

module.exports = {
    class: new Command({
        Name: "botban",
        Description: "Bans a user from running commands on NS Utility.",
        Usage: `;botban <"add" | "remove"> <@user | userId>`,
        Permission: 7,
    }),
};
