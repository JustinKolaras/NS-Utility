const Util = require("../externals/Util");

const adminRolesIndex = [
    {
        id: "788877981874389014",
        raw: "Command Team",
    },
    {
        id: "789259821151944725",
        raw: "Chief Administrator",
    },
    {
        id: "797965207879548968",
        raw: "Admin",
    },
    {
        id: "851082141235937300",
        raw: "Ownership Team",
    },
    {
        id: "789239496549859348",
        raw: "Co-Owner",
    },
    {
        id: "761469076320550922",
        raw: "Owner",
    },
];

module.exports = {
    name: "guildMemberUpdate",
    execType: "bind",
    execute(oldMember, newMember) {
        let hasAdminRole = false;
        let adminRoles = [];
        for (const dict of adminRolesIndex) {
            if (Util.hasRole(newMember, dict.id) && !Util.hasRole(oldMember, dict.id)) {
                hasAdminRole = true;
                adminRoles.push(dict.raw);
            }
        }

        if (hasAdminRole) {
            const prefix = `@everyone, `;
            const messageToSend = `<@${newMember.id}> (${newMember.user.tag} :: ${
                newMember.id
            }) has been given an administrative role.\nThis is just a notice. If you know this is intentional, please ignore this message.\n\`\`\`\n${adminRoles.join(
                "\n"
            )}\n\`\`\``;

            Util.dmUsersIn(newMember.guild, "788877981874389014", `An important server action may need your attention.\n\n${messageToSend}`).catch(() => {});
            Util.getChannel(newMember.guild, "810717109427503174")?.send(prefix + messageToSend);
        }
    },
};
