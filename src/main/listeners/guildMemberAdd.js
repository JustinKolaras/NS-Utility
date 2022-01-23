const Util = require("../externals/Util");

let users = 0;
let MASTER_COOLDOWN = false;

const configuration = {
    channelId: "797589411381903380",
    permissionOverwrites: { SEND_MESSAGES: false },
};

module.exports = {
    name: "guildMemberAdd",
    async execute(member) {
        if (member.user.bot) {
            Util.dmUser([config.ownerId], `This is a notice that a bot was rejected from ${member.guild.name}.`);
            member.ban({
                reason: `This bot is not authorized to join the server.\nContact ${config.developerTag} to whitelist this bot.`,
            });
        }

        users++;

        setTimeout(() => {
            users--;
        }, 60000);

        if (users >= 10 && !MASTER_COOLDOWN) {
            users = 0;
            MASTER_COOLDOWN = true;
            setTimeout(() => {
                MASTER_COOLDOWN = false;
            }, 500000);

            const prefix = `@everyone, `;
            const messageToSend = `**Member Add Influx Warning:** An increased amount of members have been joining recently. Please check audit and <#788872173359071272> for more details.\nThe <#797589411381903380> channel has been locked automatically.`;

            Util.dmUsersIn(member.guild, "788877981874389014", `An important server action may need your attention.\n\n${messageToSend}`).catch(() => {});
            Util.getChannel(member.guild, "810717109427503174")?.send(prefix + messageToSend);

            const verifyChannel = Util.getChannel(member.guild, configuration.channelId);

            verifyChannel.permissionOverwrites
                .edit(member.guild.roles.everyone, configuration.permissionOverwrites)
                .then(() => {
                    verifyChannel
                        .send("Sorry! Suspicious Discord behavior has been detected. Please manually contact an admin to be verified.")
                        .catch(() => {});
                })
                .catch((err) => {
                    console.error(err);
                    Util.dmUser([config.ownerId], `**Verify Channel Lock Error**\n\`\`\`\n${err}\n\`\`\``);
                });
        }
    },
};
