const { MessageEmbed } = require("discord.js");

const Util = require("../modules/Util");
const repAlg = require(`../modules/reputation/algorithm`);

const makeEmbed = (client, Msg, command) => {
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
            client,
            "761468835600924733",
            config.logChannel,
            `There was an issue generating a log. <@360239086117584906>\n\nAuthor: **${Tag}**\nCommand: \`${command}\`\nMessage: *${Msg.content}*`
        );
    }
};

module.exports = {
    name: "messageCreate",
    async execute(client, mongoClient, Msg) {
        if (!Msg.guild) return;

        const database = mongoClient.db("main");
        const botBans = database.collection("botBans");

        if (Util.isReputableChannel(Msg.channel.id)) {
            if (!Msg.member.user.bot) repAlg(client, Msg, mongoClient);
        }

        // Command Handler
        if (!Msg.author.bot && Msg.content.startsWith(config.prefix)) {
            const commandBody = Msg.content.slice(config.prefix.length);
            const args = commandBody.split(" ");
            const command = args.shift().toLowerCase();

            const [success, result] = Util.getLibrary(command);
            if (success) {
                if (config.restrictUsage && Msg.guild.id === "761468835600924733") {
                    return Msg.reply(
                        `You cannot run commands here at this time.\nThis is usually due to heavy maintenance. If you see this warning for an extended period of time, contact **${config.developerTag}**.`
                    );
                }

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
                    if (result.class.autoResponse?.active) {
                        return Msg.delete()
                            .catch(console.error)
                            .finally(() => Msg.channel.send(result.class.autoResponse.result));
                    } else {
                        return result.class
                            .fn(Msg, { args: args, clientPerm: userPermission }, mongoClient)
                            .then(() => {
                                if (Msg.guild.id != config.testServer) {
                                    Msg.content = Util.omitKeys(Msg.content);
                                    const embed = makeEmbed(client, Msg, command);

                                    Util.sendInChannel(client, "761468835600924733", config.logChannel, { embeds: [embed] });
                                }
                            })
                            .catch((err) => {
                                console.error(err);
                                return Msg.reply(
                                    `There was a script error running this command.\nYou shouldn't ever receive an error like this. Contact **${config.developerTag}** immediately.\n<@360239086117584906>\n\`\`\`xl\n${err}\n\`\`\``
                                );
                            });
                    }
                } else {
                    return Msg.reply("You have insufficient permissions to run this command.");
                }
            }
        } else {
            if (Util.hasKey(Msg.content)) {
                Msg.delete();
                Msg.author.send("Looks like you sent your private key. I deleted it for you - be careful!").catch(() => {});
            }
        }
    },
};
