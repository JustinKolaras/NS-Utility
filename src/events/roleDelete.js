const util = require("../modules/util");

let deletedRoleNames = [];

setInterval(() => {
    deletedRoleNames = [];
}, 120000);

module.exports = {
    name: "roleDelete",
    execute(client, role) {
        deletedRoleNames.push(role.name);
        if (deletedRoleNames.length >= 3) {
            const alertMessage = `@everyone, **Excessive Role Deletion Alert:** \`3 w/i 120s\`\n\`\`\`\n${deletedRoleNames.join("\n")}\n\`\`\``;

            util.getGuild(client, "761468835600924733")
                .then((guild) => util.getChannel(guild, "810717109427503174"))
                .then((channel) => channel.send(alertMessage))
                .catch(console.error);

            deletedRoleNames = [];
        }
    },
};
