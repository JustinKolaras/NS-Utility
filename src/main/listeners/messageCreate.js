const { MessageEmbed } = require("discord.js");

const Util = require("../externals/Util");
const repAlg = require(`../externals/reputation/Algorithm`);

let commandInvocations = [];

const makeEmbed = (Msg, command) => {
    const User = Msg.member.user;
    const Tag = User.tag;
    try {
        const toReturn = new MessageEmbed()
            .setColor("#58a2b4")
            .setAuthor({ name: Tag, iconURL: User.avatarURL() })
            .setTitle(`Ran command \`${command}\``)
            .setDescription(Msg.content)
            .setTimestamp();

        return toReturn;
    } catch (err) {
        console.error(err);
        Util.sendInChannel(
            "761468835600924733",
            config.logChannel,
            `There was an issue generating a log. <@360239086117584906>\n\nAuthor: **${Tag}**\nCommand: \`${command}\`\nMessage: *${Msg.content}*`
        );
    }
};

module.exports = {
    name: "messageCreate",
    async execute(Msg) {
        if (!Msg.guild) return;
        if (typeof commandInvocations[Msg.member.id] !== "number") {
            commandInvocations[Msg.member.id] = 0;
        }

        const database = mongoClient.db("main");
        const botBans = database.collection("botBans");

        if (Util.isReputableChannel(Msg.channel.id)) {
            if (!Msg.member.user.bot) repAlg(Msg);
        }

        // Command Handler
        if (!Msg.author.bot && Msg.content.startsWith(config.prefix)) {
            const commandBody = Msg.content.slice(config.prefix.length);
            const args = commandBody.split(" ");
            const command = args.shift().toLowerCase();

            const [success, result] = Util.getLibrary(command);
            if (success) {
                if (config.restrictUsage === true && Msg.guild.id === "761468835600924733") {
                    return Msg.reply(
                        `You cannot run commands here at this time.\nThis is usually due to heavy maintenance. If you see this warning for an extended period of time, contact **${config.developerTag}**.`
                    );
                }

                commandInvocations[Msg.member.id]++;
                setTimeout(() => {
                    commandInvocations[Msg.member.id]--;
                }, 5000);
                if (commandInvocations[Msg.member.id] > 2) return;

                const isBanned = await botBans.findOne({ id: Msg.author.id });
                if (isBanned) return;

                /*
                 Using try/catch blocks instead of functions so I can return on outermost scope.
                 I don't need to do this for script errors as there's no code beyond that point.
                */
                let userPermission;
                try {
                    userPermission = await Util.getPerm(Msg.member);
                } catch (err) {
                    return Msg.reply(
                        `There was an error fetching permissions, so your command was blocked.\nYou shouldn't ever receive an error like this. Contact **${config.developerTag}** immediately.\n<@360239086117584906>\n\`\`\`xl\n${err}\n\`\`\``
                    );
                }

                if ((Msg.guild.id == config.testServer && Msg.author.id === config.ownerId) || result.class.Permission <= userPermission) {
                    if (result.class.Restriction) {
                        const restrictionObject = result.class.Restriction;

                        if (restrictionObject.byChannel) {
                            const whitelistedChannels = restrictionObject.byChannel?.whitelisted;
                            const errorMessage = restrictionObject.byChannel?.errorMessage;

                            if (!whitelistedChannels || !errorMessage) {
                                return Msg.reply(
                                    `Improper restriction form.\n\`\`\`\nwhitelistedChannels: ${whitelistedChannels.toString()}\nerrorMessage: ${errorMessage.toString()}\n\`\`\``
                                );
                            }

                            let isValidChannel = false;
                            for (const channelId in whitelistedChannels) {
                                if (Msg.channel.id === channelId) isValidChannel = true;
                            }

                            if (!isValidChannel) {
                                return Msg.reply(errorMessage);
                            }
                        }

                        if (restrictionObject.byCategory) {
                            const whitelistedCategories = restrictionObject.byCategory?.whitelisted;
                            const errorMessage = restrictionObject.byCategory?.errorMessage;

                            if (!whitelistedCategories || !errorMessage) {
                                return Msg.reply(
                                    `Improper restriction form.\n\`\`\`\nwhitelistedCategories: ${whitelistedCategories.toString()}\nerrorMessage: ${errorMessage.toString()}\n\`\`\``
                                );
                            }

                            let isValidCategory = false;
                            for (const categoryId of whitelistedCategories) {
                                if (Msg.channel.parent.id === categoryId) isValidCategory = true;
                            }

                            if (!isValidCategory) {
                                return Msg.reply(errorMessage);
                            }
                        }
                    }

                    if (result.class.autoResponse?.active) {
                        return Msg.delete()
                            .catch(console.error)
                            .finally(() => Msg.channel.send(result.class.autoResponse.result));
                    }

                    return result.class
                        .fn(Msg, { args: args, clientPerm: userPermission })
                        .then(() => {
                            if (Msg.guild.id !== config.testServer) {
                                const embed = makeEmbed(Msg, command);

                                Util.sendInChannel("761468835600924733", config.logChannel, { embeds: [embed] });
                            }
                        })
                        .catch((err) => {
                            console.error(err);
                            if (Msg.author.id !== config.ownerId) {
                                Util.dmUser([config.ownerId], `**Command Script Error \`${command}\`**\n\`\`\`\n${err}\n\`\`\``);
                            }
                            return Msg.reply(
                                `There was a script error running this command.\nYou shouldn't ever receive an error like this. Contact **${config.developerTag}** immediately.\n<@360239086117584906>\n\`\`\`xl\n${err}\n\`\`\``
                            );
                        });
                }
            }
        }
    },
};
