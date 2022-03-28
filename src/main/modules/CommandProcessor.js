const CommandLogs = require("./CommandLogs");
const Restrictions = require("./RestrictionHandler");
const Permissions = require("../modules/Permissions");
const PermissionsHandler = new Permissions();
const CommandLogConstructor = new CommandLogs();
const RestrictionHandler = new Restrictions();

let Invocations = [];

module.exports = async (msg) => {
    if (typeof Invocations[msg.member.id] !== "number") {
        Invocations[msg.member.id] = 0;
    }
    if (!msg.author.bot && msg.content.startsWith(config.prefix)) {
        const commandBody = msg.content.slice(config.prefix.length);
        const args = commandBody.split(" ");
        const command = args.shift().toLowerCase();

        const database = mongoClient.db("main");
        const botBans = database.collection("botBans");

        const [success, result] = Util.getLibrary(command);
        if (success) {
            // See if restrict usage is enabled
            if (config.restrictUsage === true && msg.guild.id === "761468835600924733") {
                return {
                    success: false,
                    message: `You cannot run commands here at this time.\nThis is usually due to heavy maintenance. If you see this warning for an extended period of time, contact **${config.developerTag}**.`,
                };
            }

            // Block banned users
            if (await botBans.findOne({ id: msg.author.id })) return { success: false };

            // Update command invocations
            Invocations[msg.member.id]++;
            setTimeout(() => {
                Invocations[msg.member.id]--;
            }, 5000);
            if (Invocations[msg.member.id] > 2) return { success: false };

            // Validate permissions
            let userPermission;
            try {
                userPermission = PermissionsHandler.validate(Msg.member);
            } catch (err) {
                console.error(err);
                return {
                    success: false,
                    message: `There was an error fetching permissions, so your command was blocked.\nYou shouldn't ever receive an error like this. Contact **${config.developerTag}** immediately.\n<@360239086117584906>\n\`\`\`\n${err}\n\`\`\``,
                };
            }

            if ((msg.guild.id === config.testServer && msg.author.id === config.ownerId) || result.class.Permission <= userPermission) {
                // MFA for high-level commands
                if (result.class.Permission >= 5 && !(await Util.mfaIntegrity(msg.member.id))) {
                    return { success: false, message: "MFA for high-level commands failed. Please contact the bot maintainer to resolve." };
                }

                // Validate category/channel restrictions
                const restrictionResult = RestrictionHandler.validate({ class: result.class, message: msg });
                if (!restrictionResult.success) return restrictionResult;

                // Execute command
                try {
                    await result.class.fn(msg, { args: args, permission: userPermission });

                    if (msg.guild.id !== config.testServer) {
                        const embed = CommandLogConstructor.makeLog({ user: msg.member.user, command: command, messageContent: msg.content });
                        Util.sendInChannel("761468835600924733", config.logChannel, { embeds: [embed] });
                    }

                    return { success: true };
                } catch (err) {
                    console.error(err);
                    if (msg.author.id !== config.ownerId) {
                        Util.dmUser([config.ownerId], `**Command Script Error \`${command}\`**\n\`\`\`\n${err}\n\`\`\``);
                    }
                    return {
                        success: false,
                        message: `There was a script error running this command.\nYou shouldn't ever receive an error like this. Contact **${config.developerTag}** immediately.\n<@360239086117584906>\n\`\`\`xl\n${err}\n\`\`\``,
                    };
                }
            } else {
                return { success: false };
            }
        }
    }
    return { success: true };
};
