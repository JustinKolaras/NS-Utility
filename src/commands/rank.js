require("dotenv").config();

const { MessageActionRow, MessageSelectMenu } = require("discord.js");

const noblox = require("noblox.js");
const config = require("../config.json");
const Util = require("../modules/Util");

class Command {
    constructor(options) {
        for (const k in options) {
            this[k] = options[k];
        }
    }

    fn = async (Msg, Context) => {
        try {
            await noblox.setCookie(process.env.cookie);
        } catch (err) {
            console.error(err);
            return Msg.reply("Issue logging into NSGroupOwner. <@360239086117584906>\nRoblox may be down.");
        }

        const args = Context.args;
        const playerName = args[0];
        const errMessage = Util.makeError("There was an issue while trying to change the rank of that user.", [
            "Your argument does not match a valid username.",
            "The user is already at this rank.",
            "You mistyped the username.",
            "The user is not in the group.",
        ]);

        let playerId;
        let usingDiscord = false;

        // Discord Mention Support
        const attributes = await Util.getUserAttributes(Msg.guild, args[0]);
        if (attributes.success) {
            const rblxInfo = await Util.getRobloxAccount(attributes.id);
            if (rblxInfo.success) {
                usingDiscord = true;
                playerId = rblxInfo.response.robloxId;
            } else {
                return Msg.reply(`Could not get Roblox account via Discord syntax. Please provide a Roblox username.`);
            }
        }

        if (!playerName) {
            return Msg.reply("**Syntax Error:** `;rank <username | @user | userId>`");
        }

        if (!usingDiscord) {
            try {
                playerId = await noblox.getIdFromUsername(playerName);
            } catch (err) {
                console.error(err);
                return Msg.reply(errMessage);
            }
        }

        let rankId;
        try {
            rankId = await noblox.getRankInGroup(config.group, playerId);
        } catch (err) {
            console.error(err);
            return Msg.reply(errMessage);
        }

        if (rankId >= 252) {
            return Msg.reply("Invalid rank! You can only change the rank of members ranked below **Moderator**.");
        }

        let roles;
        const discordReadableRoles = [];
        try {
            roles = await noblox.getRoles(config.group);
        } catch (err) {
            console.error(err);
            return Msg.reply(errMessage);
        }

        for (const role of roles) {
            if (role.name === "Guest") continue;
            if (role.rank >= 15) continue;
            discordReadableRoles.push({
                label: role.name,
                description: `Group Roleset [${role.id}]`,
                value: role.name,
            });
        }

        const row = new MessageActionRow().addComponents(
            new MessageSelectMenu().setCustomId("selectRole").setPlaceholder("Select role..").addOptions(discordReadableRoles)
        );

        const filter = (i) => i.member.id === Msg.author.id;
        const collector = Msg.channel.createMessageComponentCollector({
            filter,
            time: 30000,
        });

        const main = await Msg.channel.send({
            content: `<@${Msg.member.id}>, Role to appoint? Select from the dropdown below.\nThis command will cancel in 30 seconds if no option is selected.`,
            components: [row],
        });

        collector.on("collect", (i) => {
            if (i.customId === "selectRole") {
                collector.stop();

                noblox
                    .setRank(config.group, playerId, i.values[0])
                    .then(() => main.edit({ content: `<@${Msg.member.id}>, Successfully ranked user.`, components: [] }))
                    .catch(() => main.edit({ content: errMessage, components: [] }));
            }
        });

        collector.on("end", (_, reason) => {
            if (reason === "time") {
                return main.edit({
                    content: `<@${Msg.member.id}>, Cancelled command execution.`,
                    components: [],
                });
            }
        });
    };
}

module.exports = {
    class: new Command({
        Name: "rank",
        Description: "Changes a user's rank in the Roblox group.",
        Usage: ";rank <username | @user | userId>",
        Permission: 5,
    }),
};
