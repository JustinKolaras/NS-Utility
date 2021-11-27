const util = require("../modules/util");
const config = require("../config.json");
const { MessageEmbed } = require("discord.js");

const makeEmbed = (client, msg, command) => {
    const user = msg.member.user;
    const tag = user.tag;
    const guild = msg.guild;
    try {
        const toReturn = new MessageEmbed()
            .setColor("#58a2b4")
            .setAuthor(tag, user.avatarURL())
            .setTitle(`Ran command \`${command}\``)
            .setDescription(msg.content.toString())
            .setTimestamp();

        return toReturn;
    } catch (err) {
        console.log(err);
        util.getGuild(client, guild.id)
            .then((guild) => util.getChannel(guild, config.logChannel))
            .then((channel) => {
                return channel.send(
                    `There was an issue generating a log. <@360239086117584906>\n\nAuthor: **${tag}**\nCommand: \`${command}\`\nMessage: *${msg.content}*`
                );
            })
            .catch(console.error);
    }
};

module.exports = {
    name: "messageCreate",
    async execute(client, msg) {
        if (!msg.guild) return;

        // Command Handler
        if (!msg.author.bot && msg.content.startsWith(config.prefix)) {
            const commandBody = msg.content.slice(config.prefix.length);
            const args = commandBody.split(" ");
            const command = args.shift().toLowerCase();

            const [success, result] = util.getLibrary(command);
            if (success) {
                if (
                    config.restrictUsage &&
                    msg.guild.id === "761468835600924733"
                ) {
                    return void msg.reply(
                        `You cannot run commands here at this time.\nThis is usually due to heavy maintenance. If you see this warning for an extended period of time, contact **${config.developerTag}**.`
                    );
                }

                /*
                 Using try/catch blocks instead of functions so I can return on outermost scope.
                 I don't need to do this for script errors as there's no code beyond that point.
                */
                let userPermission;
                try {
                    userPermission = await util.getPerm(msg.member);
                } catch (err) {
                    return void msg.reply(
                        `There was an error fetching permissions, so your command was blocked.\nYou shouldn't ever receive an error like this. Contact **${config.developerTag}** immediately.\n<@360239086117584906>\n\`\`\`xl\n${err}\n\`\`\``
                    );
                }

                if (
                    (msg.guild.id == config.testServer &&
                        msg.author.id == config.ownerId) ||
                    result.permission <= userPermission
                ) {
                    result
                        .execute(msg, {
                            args: args,
                            permission: userPermission,
                        })
                        .then(() => {
                            // Remove encryption keys
                            for (const key of Object.values(
                                config.encryption
                            )) {
                                msg.content = msg.content.replace(key, "");
                            }

                            const embed = makeEmbed(client, msg, command);
                            const guild = msg.guild;

                            util.getGuild(client, guild.id)
                                .then((guild) =>
                                    util.getChannel(guild, config.logChannel)
                                )
                                .then((channel) =>
                                    channel.send({ embeds: [embed] })
                                )
                                .catch(console.error);
                        })
                        .catch((err) => {
                            console.log(err);
                            return void msg.reply(
                                `There was a script error running this command.\nYou shouldn't ever receive an error like this. Contact **${config.developerTag}** immediately.\n<@360239086117584906>\n\`\`\`xl\n${err}\n\`\`\``
                            );
                        });
                } else {
                    return void msg.reply(
                        "You have insufficient permissions to run this command."
                    );
                }
            }
        }
    },
};
