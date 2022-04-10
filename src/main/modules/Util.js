/*global config, mongoClient, discordClient*/
/*eslint no-undef: "error"*/

require("dotenv").config();

const defaultUtil = require("util");
const uuid = require("uuid");

class Utility {
    combine = (args, first, last) => {
        last ??= Infinity;
        for (const k in args) {
            if (k > first && k < last) {
                args[first] += ` ${args[k]}`;
            }
        }
        args.splice(first + 1, last);
        return args[first];
    };

    sleep = (ms) => {
        return new Promise((resolve) => setTimeout(resolve, ms));
    };

    hasRole = (member, roleId) => {
        return member.roles.cache.has(roleId);
    };

    getGuild = (guildId) => {
        return discordClient.guilds.fetch(guildId);
    };

    getChannel = (guild, channelId) => {
        return guild.channels.cache.get(channelId);
    };

    getRole = (guild, roleId) => {
        return guild.roles.cache.find((role) => role.id === roleId);
    };

    giveRole = (member, role) => {
        return member.roles.add(role);
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
        for (const error in errors) {
            errors[error] = `**- ${errors[error]}**`;
        }
        errors = errors.join("\n");
        return `${prefix}\n${errors}`;
    };

    clean = async (text) => {
        // prettier-ignore
        if (text && text.constructor.name == "Promise") 
            text = await text;

        // prettier-ignore
        if (typeof text !== "string") 
            text = defaultUtil.inspect(text, { depth: 1 });

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
        return func(define) ? define : null;
    };

    getUserAttributes = async (guild, str) => {
        if (!str) return { success: false };

        str = str.toString();

        let match = str.match(/(\d+)/);
        let returnValue;
        let isTag = false;

        if (str.includes("#")) {
            const user = discordClient.users.cache.find((u) => u.tag === str);
            if (user?.id) {
                isTag = true;
                await guild.members
                    .fetch(user.id)
                    .then((m) => {
                        returnValue = { success: true, id: user.id, member: m };
                    })
                    .catch(() => {});
            }
        }

        if (match && !isTag) {
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

    isReputableChannel = (channelId) => {
        for (const c of config.reputationChannels) {
            if (channelId == c) {
                return true;
            }
        }
        return false;
    };

    isOfType = (url, ...types) => {
        for (const type of types) {
            if (url.indexOf(type, url.length - type.length) !== -1) {
                return true;
            }
        }
        return false;
    };

    sendInChannel = async (guildId, channelId, toSend) => {
        const guild = await this.getGuild(guildId);
        const channel = await this.getChannel(guild, channelId);
        channel.send(toSend).catch((err) => {
            throw new Error(`Util.sendInChannel: Could not send message. Err: ${err}`);
        });
    };

    dmUser = async (userIds, toSend) => {
        const guild = await this.getGuild("761468835600924733");
        userIds.forEach((id) => {
            guild.members
                .fetch(id)
                .then((m) => m.send(toSend))
                .catch(console.error);
        });
    };

    dmUsersIn = async (guild, roleId, toSend) => {
        const role = await this.getRole(guild, roleId);
        this.dmUser(
            role.members.map((m) => m.user.id),
            toSend
        );
    };

    getTimeParameters = (ms) => {
        let totalSeconds = ms / 1000;
        let days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = Math.floor(totalSeconds % 60);

        return { days: days, hours: hours, minutes: minutes, seconds: seconds };
    };

    /*
        Util.handleRoles(guildMember, {
            "roleId": callback,
            ...etc
        })
    */
    handleRoles = async (member, options) => {
        for (const roleId in options) {
            const callbackFn = options[roleId];
            const callback = callbackFn();
            if (callback) {
                const guild = await this.getGuild(member.guild.id);

                const role = this.getRole(guild, roleId);

                // prettier-ignore
                if (!role)
                    throw new Error(`Util.handleRoles: Could not retrieve role.`);

                this.giveRole(member, role).catch((err) => {
                    throw new Error(`Util.handleRoles: Could not give role (${roleId}). Err: ${err}`);
                });
            }
        }
    };

    getRep = async (memberId) => {
        const database = mongoClient.db("main");
        const reputation = database.collection("reputation");
        const currentData = await reputation.findOne({ id: memberId });
        return currentData.reputationNum;
    };

    waitUntil = (callbackFn) => {
        return new Promise((resolve) => {
            let id;
            id = setInterval(() => {
                const cb = callbackFn();
                if (cb) {
                    clearInterval(id);
                    resolve();
                }
            }, 1000);
        });
    };

    getDateNow = () => {
        const date = new Date();
        return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    };

    makeLogData = (head, body) => {
        const generatedId = uuid.v4();
        return {
            head: head + ` - ${generatedId}`,
            body: body,
            modLogId: generatedId,
        };
    };

    parseNumericalsAfterHash = (str) => {
        return str.match(/(?<=#)\d+/);
    };

    inRange = (num, min, max) => {
        return num >= min && num <= max;
    };
}

module.exports = new Utility();
