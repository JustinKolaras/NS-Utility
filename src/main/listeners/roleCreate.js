const Util = require("../externals/Util");

module.exports = {
    name: "roleCreate",
    async execute(newRole) {
        const hasAdmin = (role) => {
            return role.permissions.has("ADMINISTRATOR");
        };

        const prefix = `<@&788877981874389014>, `;
        const messageToSend = `**${newRole.name}** (${newRole.id}) has been given the \`ADMINISTRATOR\` permission.\nThis is just a notice. If you know this is intentional, please ignore this message.`;

        if (hasAdmin(newRole)) {
            Util.dmUsersIn(newRole.guild, "788877981874389014", `An important server action may need your attention.\n\n${messageToSend}`).catch(() => {});
            Util.getChannel(newRole.guild, "810717109427503174")?.send(prefix + messageToSend);
        }
    },
};
