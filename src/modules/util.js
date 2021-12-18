const config = require("../config.json");
const fs = require("fs");

// Probably going to migrate utility outside of a class soon, and use another method of handling.
class Utility {
    combine = (args, first, last) => {
        if (!last) last = Infinity;
        for (const k in args) {
            if (k > first && k < last) {
                args[first] += ` ${args[k]}`;
            }
        }
        args.splice(first + 1, last);
        return args[first];
    };

    getLibrary = (lib) => {
        try {
            const library = require(`../commands/${lib}`);
            return [true, library];
        } catch (err) {
            console.error(err);
            return [false, "Couldn't retrieve command library!\nThis command may not exist, or been archived/moved."];
        }
    };

    sleep = (ms) => {
        return new Promise((resolve) => setTimeout(resolve, ms));
    };

    getPerm = async (member) => {
        const t = config.permissions;
        let highestPerm;

        // prettier-ignore
        if (!t) 
            return Promise.reject(
                new Error("permissions table is undefined or null")
            );

        for (const k in t) {
            if (this.hasRole(member, t[k])) {
                highestPerm = k;
            }
        }

        if (member.id === config.ownerId) {
            highestPerm = 7;
        }

        return highestPerm === undefined ? -1 : parseInt(highestPerm);
    };

    hasRole = (member, roleId) => {
        return member.roles.cache.has(roleId);
    };

    getGuild = (client, guildId) => {
        return client.guilds.fetch(`${guildId}`);
    };

    getChannel = (guild, channelId) => {
        return guild.channels.cache.get(`${channelId}`);
    };

    getRole = (guild, roleId) => {
        return guild.roles.cache.find((role) => role.id === roleId);
    };

    sep = (int) => {
        let str = int.toString().split(".");
        str[0] = str[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return str.join(".");
    };

    upFirst = (str) => {
        return str?.length > 0 ? str[0].toUpperCase() + str.substring(1) : "";
    };

    isValid = (str, isCapsSensitive, ...types) => {
        for (const k in types) {
            if (!isCapsSensitive) {
                // prettier-ignore
                if (str.toLowerCase() === types[k].toLowerCase()) 
                    return [true, str.toLowerCase()];
            } else {
                // prettier-ignore
                if (str === types[k]) 
                    return [true, str.toLowerCase()];
            }
        }
        return [false, undefined];
    };

    makeError = (prefix, errors) => {
        for (const i in errors) {
            errors[i] = `**- ${errors[i]}**`;
        }
        errors = errors.join("\n");
        return `${prefix}\n${errors}`;
    };

    prompt = (source, prefix, responses, options) => {
        let functions = {};
        let responseStr = prefix;

        for (const k in responses) {
            const arr = responses[k];
            if (typeof arr[0] === "string") {
                functions[arr[0]] = arr[1];
            }
        }

        const getAvailResponses = () => {
            let toReturn = [];
            for (const k in functions) {
                if (!k.startsWith("/") && !k.endsWith(":")) {
                    toReturn.push(k);
                }
            }
            return toReturn.join(", ");
        };

        const responseTypes = getAvailResponses();
        responseStr += `\n**Available Responses:** ${responseTypes}`;

        source.channel.send(responseStr);

        const filter = (m) => m.user.id === source.user.id;
        const collector = source.channel.createMessageCollector({
            filter,
            time: options.timeout,
        });

        collector.on("collect", (m) => {
            for (const r in functions) {
                if (m.content.toString().toLowerCase() === r.toString().toLowerCase()) {
                    functions[r](m);
                    collector.stop();
                }
            }
        });

        collector.on("end", (_, reason) => {
            if (reason === "time") {
                functions["/timeout:"]();
            }
        });
    };

    promptAny = (source, message, func, timeoutFunc, options) => {
        source.channel.send(message);

        const filter = (m) => m.user.id === source.user.id;
        const collector = source.channel.createMessageCollector({
            filter,
            time: options.timeout,
        });

        collector.on("collect", (m) => {
            func(m);
            collector.stop();
        });

        collector.on("end", (_, reason) => {
            if (reason.toString() === "time") {
                timeoutFunc();
            }
        });
    };

    getKey = (memberId) => {
        const t = config.privateKeys;
        for (const k in t) {
            if (memberId === k) {
                return [true, t[k]];
            }
        }
        return [false, undefined];
    };

    omitKeys = (str) => {
        for (const key of Object.values(config.privateKeys)) {
            str = str.replaceAll(key, "");
        }
        return str;
    };

    hasKey = (str) => {
        for (const key of Object.values(config.privateKeys)) {
            if (str.includes(key)) return true;
        }
        return false;
    };

    clean = async (text) => {
        // prettier-ignore
        if (text && text.constructor.name == "Promise") 
            text = await text;

        // prettier-ignore
        if (typeof text !== "string") 
            text = require("util").inspect(text, { depth: 1 });

        // prettier-ignore
        text = text.replace(
            /`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203)
        );

        // prettier-ignore
        if (text.toString() === "undefined") 
            text = "void";

        return text;
    };

    verify = (define, func) => {
        const returnStatement = func(define);
        return returnStatement ? define : null;
    };

    /*
        %c - Command Name
        %p - Command Perm
        %d - Command Desc
        %u - Command Usage
    */
    getCommandList = async (src, format, usableOnly) => {
        const cmdArray = [];
        const commandFiles = fs.readdirSync(`./commands/`).filter((file) => file.endsWith(".js"));

        const parseString = (str, context) => {
            str = str.replaceAll("%c", context.Name);
            str = str.replaceAll("%p", context.Permission);
            str = str.replaceAll("%d", context.Description);
            str = str.replaceAll("%u", context.Usage);
            return str;
        };

        for (const file of commandFiles) {
            const command = require(`../commands/${file}`);
            const commandClass = command.class;

            let userPermission;
            try {
                userPermission = await this.getPerm(src.member);
            } catch (err) {
                return void src.reply(
                    `There was an error fetching permissions, so I couldn't display commands correctly.\nYou shouldn't ever receive an error like this. Contact **${config.developerTag}** immediately.\n<@360239086117584906>\n\`\`\`xl\n${err}\n\`\`\``
                );
            }

            if (usableOnly) {
                if (commandClass.Permission <= userPermission) {
                    cmdArray.push(parseString(format, commandClass));
                }
            } else {
                cmdArray.push(parseString(format, commandClass));
            }
        }

        return cmdArray.length > 0 ? cmdArray.join("\n") : "No commands to show.";
    };

    getUserAttributes = async (guild, str) => {
        str = str.toString();

        let match = str.match(/(\d+)/);
        let returnValue;

        if (match) {
            match = match[0];
            await guild.members
                .fetch(match)
                .then((m) => {
                    returnValue = { success: true, id: match, member: m };
                })
                .catch(() => {});
        }

        return returnValue || { success: false };
    };
}

module.exports = new Utility();
