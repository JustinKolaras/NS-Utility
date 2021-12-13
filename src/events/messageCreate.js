const { MessageEmbed } = require("discord.js");

const util = require("../modules/util");
const config = require("../config.json");

const makeEmbed = (client, Msg, command) => {
    const user = Msg.member.user;
    const tag = user.tag;
    const guild = Msg.guild;
    try {
        const toReturn = new MessageEmbed()
            .setColor("#58a2b4")
            .setAuthor(tag, user.avatarURL())
            .setTitle(`Ran command \`${command}\``)
            .setDescription(Msg.content.toString())
            .setTimestamp();

        return toReturn;
    } catch (err) {
        console.error(err);
        util.getGuild(client, guild.id)
            .then((guild) => util.getChannel(guild, config.logChannel))
            .then((channel) => {
                return void channel.send(
                    `There was an issue generating a log. <@360239086117584906>\n\nAuthor: **${tag}**\nCommand: \`${command}\`\nMessage: *${msg.content}*`
                );
            })
            .catch(console.error);
    }
};

module.exports = {
    name: "messageCreate",
    async execute(client, Msg) {
        if (!Msg.guild) return;

        // Command Handler
        if (!Msg.author.bot && Msg.content.startsWith(config.prefix)) {
            const commandBody = Msg.content.slice(config.prefix.length);
            const args = commandBody.split(" ");
            const command = args.shift().toLowerCase();

            const [success, result] = util.getLibrary(command);
            if (success) {
                if (config.restrictUsage && Msg.guild.id === "761468835600924733") {
                    return void Msg.reply(
                        `You cannot run commands here at this time.\nThis is usually due to heavy maintenance. If you see this warning for an extended period of time, contact **${config.developerTag}**.`
                    );
                }

                /*
                 Using try/catch blocks instead of functions so I can return on outermost scope.
                 I don't need to do this for script errors as there's no code beyond that point.
                */
                let userPermission;
                try {
                    userPermission = await util.getPerm(Msg.member);
                } catch (err) {
                    return void Msg.reply(
                        `There was an error fetching permissions, so your command was blocked.\nYou shouldn't ever receive an error like this. Contact **${config.developerTag}** immediately.\n<@360239086117584906>\n\`\`\`xl\n${err}\n\`\`\``
                    );
                }

                if ((Msg.guild.id == config.testServer && Msg.author.id === config.ownerId) || result.class.Permission <= userPermission) {
                    if (result.class.isAutoResponder) {
                        return Msg.delete()
                            .catch(console.error)
                            .finally(() => Msg.channel.send(result.class.autoResponderResult));
                    } else {
                        return result.class
                            .fn(Msg, { args: args, clientPerm: userPermission })
                            .then(() => {
                                Msg.content = util.omitKeys(Msg.content);

                                const embed = makeEmbed(client, Msg, command);

                                util.getGuild(client, Msg.guild.id)
                                    .then((guild) => util.getChannel(guild, config.logChannel))
                                    .then((channel) => channel.send({ embeds: [embed] }))
                                    .catch(console.error);
                            })
                            .catch((err) => {
                                console.error(err);
                                return void Msg.reply(
                                    `There was a script error running this command.\nYou shouldn't ever receive an error like this. Contact **${config.developerTag}** immediately.\n<@360239086117584906>\n\`\`\`xl\n${err}\n\`\`\``
                                );
                            });
                    }
                } else {
                    return void Msg.reply("You have insufficient permissions to run this command.");
                }
            }
        } else {
            // Check for broad private keys in random messages..
            if (util.hasKey(Msg.content)) {
                Msg.delete();
                Msg.author.send("Looks like you sent your private key. I deleted it for you - be careful!").catch(() => {});
            }
        }
    },
};
