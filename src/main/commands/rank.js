/*global SyntaxBuilder, Util, config, process*/
/*eslint no-undef: "error"*/

require("dotenv").config();

const { MessageActionRow, MessageSelectMenu } = require("discord.js");

const noblox = require("noblox.js");

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

        try {
            await noblox.setCookie(process.env.cookie);
        } catch (err) {
            console.error(err);
            return msg.reply("Issue logging into NSGroupOwner. <@360239086117584906>\nRoblox may be down.");
        }

        const args = Context.args;
        const playerName = args[0];
        const errMessage = Util.makeError("There was an issue while trying to change the rank of that user.", [
            "Your argument does not match a valid username.",
            "You mistyped the username.",
            "The user is not in the group.",
        ]);

        let playerId;

        if (!playerName) {
            return SyntaxErr();
        }

        // Discord Mention Support
        const attributes = await Util.getUserAttributes(msg.guild, args[0]);
        if (attributes.success) {
            const rblxInfo = await Util.getRobloxAccount(attributes.id);
            if (rblxInfo.success) {
                playerId = rblxInfo.response.robloxId;
            } else {
                return msg.reply(`Could not get Roblox account via Discord syntax. Please provide a Roblox username.`);
            }
        }

        // ID Support
        if (args[0].includes("#") && !attributes.success) {
            playerId = Util.parseNumericalsAfterHash(args[0])[0];
            if (isNaN(parseInt(playerId))) {
                return SyntaxErr();
            }
        }

        if (!playerId) {
            try {
                playerId = await noblox.getIdFromUsername(playerName);
            } catch (err) {
                console.error(err);
                return msg.reply(errMessage);
            }
        }

        let rankId;
        try {
            rankId = await noblox.getRankInGroup(config.group, playerId);
        } catch (err) {
            console.error(err);
            return msg.reply(errMessage);
        }

        if (rankId >= 252 && Context.permission < 6) {
            return msg.reply("Invalid rank! You can only change the rank of members ranked below **Moderator**.");
        }

        let roles;
        const discordReadableRoles = [];
        try {
            roles = await noblox.getRoles(config.group);
        } catch (err) {
            console.error(err);
            return msg.reply(errMessage);
        }

        for (const role of roles) {
            if (role.name === "Guest") continue;
            // This long if statement basically allows those with perm 6+ to ignore rank restrictions.
            if ((role.rank >= 15 && Context.permission < 6) || (role.rank >= 255 && Context.permission >= 6)) continue;
            discordReadableRoles.push({
                label: role.name,
                description: `Group Roleset [${role.id}]`,
                value: role.name,
            });
        }

        const row = new MessageActionRow().addComponents(
            new MessageSelectMenu().setCustomId("selectRole").setPlaceholder("Select role..").addOptions(discordReadableRoles)
        );

        const filter = (i) => i.member.id === msg.author.id;
        const collector = msg.channel.createMessageComponentCollector({
            filter,
            time: 30000,
        });

        const main = await msg.channel.send({
            content: `<@${msg.member.id}>, Role to appoint? Select from the dropdown below.\nThis command will cancel in 30 seconds if no option is selected.`,
            components: [row],
        });

        collector.on("collect", (i) => {
            if (i.customId === "selectRole") {
                collector.stop();

                noblox
                    .setRank(config.group, playerId, i.values[0])
                    .then(() => main.edit({ content: `<@${msg.member.id}>, Successfully ranked user.`, components: [] }))
                    .catch(() => main.edit({ content: errMessage, components: [] }));
            }
        });

        collector.on("end", (_, reason) => {
            if (reason === "time") {
                return main.edit({
                    content: `<@${msg.member.id}>, Cancelled command execution.`,
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
        Usage: SyntaxBuilder.classifyCommand({ name: "rank" }).makeRegular("User").endBuild(),
        Permission: 5,
        Group: "Remote",
    }),
};
