const config = require("../config.json");
const fs = require("fs");

class Utility {
    combine = (args, f, l) => {
        if (!l) l = Infinity;
        for (const k in args) {
            if (k > f && k < l) {
                args[f] += ` ${args[k]}`;
            }
        }
        args.splice(f + 1, l);
        return args[f];
    };

    getLibrary = (lib) => {
        try {
            const library = require(`../commands/${lib}`);
            return [true, library];
        } catch (err) {
            console.log(err);
            return [
                false,
                "Couldn't retrieve command library!\nThis command may not exist, or been archived/moved.",
            ];
        }
    };

    sleep = (ms) => {
        return new Promise((resolve) => setTimeout(resolve, ms));
    };

    hasRole = (member, roleId) => {
        return member.roles.cache.has(roleId);
    };

    getPerm = async (member) => {
        const t = config.permissions;
        let highestPerm;

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

        if (highestPerm === undefined) {
            return -1;
        } else {
            return parseInt(highestPerm);
        }
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
        var str = int.toString().split(".");
        str[0] = str[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return str.join(".");
    };

    upFirst = (str) => {
        return str[0].toUpperCase() + str.substring(1);
    };

    isValid = (str, caps, ...types) => {
        for (const k in types) {
            if (!caps) {
                if (str.toLowerCase() === types[k].toLowerCase())
                    return [true, str.toLowerCase()];
            } else {
                if (str === types[k]) return [true, str.toLowerCase()];
            }
        }
        return [false, undefined];
    };

    makeError = (intro, errors) => {
        for (const i in errors) {
            errors[i] = `**- ${errors[i]}**`;
        }
        errors = errors.join("\n");
        return `${intro}\n${errors}`;
    };

    prompt = (source, prefix, responses, otherParams) => {
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

        const filter = (m) =>
            m.member.id === source.member.id &&
            m.channelId === source.channelId;
        const collector = source.channel.createMessageCollector({
            filter,
            time: otherParams.timeout,
        });

        collector.on("collect", (m) => {
            for (const r in functions) {
                if (
                    m.content.toString().toLowerCase() ===
                    r.toString().toLowerCase()
                ) {
                    functions[r](m);
                    collector.stop();
                }
            }
        });

        collector.on("end", (_, reason) => {
            if (reason.toString() === "time") {
                functions["/timeout:"]();
            }
        });
    };

    promptAny = (source, message, func, timeoutFunc, otherParams) => {
        source.channel.send(message);

        const filter = (m) =>
            m.member.id === source.member.id &&
            m.channelId === source.channelId;
        const collector = source.channel.createMessageCollector({
            filter,
            time: otherParams.timeout,
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
        const t = config.encryption;
        for (const k in t) {
            if (memberId === k) {
                return [true, t[k]];
            }
        }
        return [false, undefined];
    };

    omitKeys = (str) => {
        for (const key of Object.values(config.encryption)) {
            str = str.replaceAll(key, "");
        }
        return str;
    };

    hasKey = (str) => {
        for (const key of Object.values(config.encryption)) {
            if (str.includes(key)) return true;
        }
        return false;
    };

    clean = async (text) => {
        if (text && text.constructor.name == "Promise") text = await text;

        if (typeof text !== "string")
            text = require("util").inspect(text, { depth: 1 });

        text = text
            .replace(/`/g, "`" + String.fromCharCode(8203))
            .replace(/@/g, "@" + String.fromCharCode(8203));

        if (text.toString() === "undefined") text = "void";

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
    getCommandList = async (src, prepend, format, usableOnly) => {
        const cmdArray = [];
        const commandFiles = fs
            .readdirSync(`./commands/`)
            .filter((file) => file.endsWith(".js"));

        const parseString = (str, context) => {
            str = str.replaceAll("%c", context.name);
            str = str.replaceAll("%p", context.permission);
            str = str.replaceAll("%d", context.description);
            str = str.replaceAll("%u", context.usage);
            return str;
        };

        for (const file of commandFiles) {
            const command = require(`../commands/${file}`);

            let userPermission;
            try {
                userPermission = await this.getPerm(src.member);
            } catch (err) {
                return void src.reply(
                    `There was an error fetching permissions, so I couldn't display commands correctly.\nYou shouldn't ever receive an error like this. Contact **${config.developerTag}** immediately.\n<@360239086117584906>\n\`\`\`xl\n${err}\n\`\`\``
                );
            }

            if (usableOnly) {
                if (command.permission <= userPermission) {
                    cmdArray.push(parseString(format, command));
                }
            } else {
                cmdArray.push(parseString(format, command));
            }
        }

        return cmdArray.length > 0
            ? prepend.toString() + cmdArray.join("\n")
            : prepend.toString() + "No commands to show.";
    };
}

module.exports = new Utility();
