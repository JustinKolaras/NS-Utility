const CommandGroups = require("./CommandGroups");
const fs = require("fs");

module.exports = class CommandList {
    generate(options) {
        const linedArray = [];
        const commandFiles = fs.readdirSync("./src/main/commands").filter((file) => file.endsWith(".js"));

        const parseString = (str, context) => {
            str = str.replaceAll("%c", context.Name);
            str = str.replaceAll("%p", context.Permission);
            str = str.replaceAll("%d", context.Description);
            str = str.replaceAll("%u", context.Usage);
            return str;
        };

        const commandRela = {};
        let groupsArray = CommandGroups.sort((prev, next) => prev.precedence > next.precedence);
        groupsArray.forEach((el) => (commandRela[el.name] = []));

        for (const file of commandFiles) {
            const command = require(`../commands/${file}`);
            const commandClass = command.class;
            const commandGroup = commandClass.Group;

            if (options.Usable) {
                if (commandClass.Permission <= options.Permission) {
                    commandRela[commandGroup].push(parseString(options.Format, commandClass));
                }
            } else {
                commandRela[commandGroup].push(parseString(options.Format, commandClass));
            }
        }

        for (const group in commandRela) {
            if (commandRela[group].length > 0) {
                linedArray.push(`**${group}**`);
                commandRela[group].forEach((el) => linedArray.push(el));
                linedArray.push("");
            }
        }

        return linedArray.length > 0 ? linedArray.join("\n") : "No commands to show.";
    }
};
