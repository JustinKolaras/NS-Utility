/*global SyntaxBuilder, Util, mongoClient*/
/*eslint no-undef: "error"*/

require("dotenv").config();

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

        const database = mongoClient.db("main");
        const reputation = database.collection("reputation");
        let data;

        if (attributes.success && Context.permission < 5) {
            return SyntaxErr();
        } else if (attributes.success && Context.permission >= 5) {
            data = await reputation.findOne({ id: attributes.id });
            let amount = data?.reputationNum || 0;
            return msg.reply(`<@${attributes.id}> :: **${amount}**`);
        }

        data = await reputation.findOne({ id: msg.author.id });
        let amount = 0;
        let response;
        amount = data?.reputationNum || 0;

        if (amount < 1) {
            // prettier-ignore
            response = `:innocent: :innocent: Hello! The mighty kingdom of NS Reputation :crown: told me you have **${Util.sep(amount)}** reputation points in your bank today. That's not good.. :grimacing: :sleepy: :worried:`;
        } else if (amount < 20) {
            // prettier-ignore
            response = `:innocent: :innocent: Hello! The mighty kingdom of NS Reputation :crown: told me you have **${Util.sep(amount)}** reputation points in your bank today. At least that's something..? :pray: :confounded: :confounded:`;
        } else if (amount < 100) {
            // prettier-ignore
            response = `:innocent: :innocent: Hello! The mighty kingdom of NS Reputation :crown: told me you have **${Util.sep(amount)}** reputation points in your bank today. Niiicee!! I like it. :astonished: :star_struck: :stuck_out_tongue_closed_eyes: :stuck_out_tongue_closed_eyes:`;
        } else if (amount >= 100) {
            // prettier-ignore
            response = `:innocent: :innocent: Hello! The mighty kingdom of NS Reputation :crown: told me you have **${Util.sep(amount)}** reputation points in your bank today. :money_with_wings: :money_with_wings: Gosh, go ahead and share some! :gem: :gem: :money_mouth:`;
        } else {
            return msg.reply("There was an error generating the required response.");
        }

        return msg.reply(response);
    };
}

module.exports = {
    class: new Command({
        Name: "rep",
        Description: "Outputs the command executor's reputation points.",
        Usage: SyntaxBuilder.classifyCommand({ name: "rep" }).endBuild(),
        Permission: 0,
        Group: "Reputation",
    }),
};
