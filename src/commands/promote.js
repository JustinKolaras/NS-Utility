const util = require("../modules/util");

const run = async (src, context) => {
    return src.reply("This command is under maintenance.");
    const args = context.args;
    const user = args[0];
    const errMessage = util.makeError(
        "There was an issue while trying to promote that user.",
        ["Your argument does not match a valid mention or ID."]
    );

    const fetch = (id) => {
        return src.guild.members.fetch(`${id}`);
    };

    if (!user) {
        return src.reply("**Syntax Error:** `;promote <@user | userId>`");
    }

    let parsedId;
    let parsedMember;

    if (util.idFormat(user) && fetch(user)) {
        parsedId = user;
    } else if (util.mentionFormat(user) && fetch(user.match(/\d+/g)[0])) {
        parsedId = user.match(/\d+/g)[0];
    } else {
        return src.reply(errMessage);
    }

    parsedMember = fetch(parsedId);

    return src.reply(`Success!\n\`\`\`\n${parsedMember}\n\`\`\``);
};

module.exports = {
    execute: run,
    name: "promote",
    permission: 5, // Command Team
    description:
        "Gives the user roles for their next moderator rank on the __Discord__ server.",
    usage: ";promote <@user | userId>",
};
