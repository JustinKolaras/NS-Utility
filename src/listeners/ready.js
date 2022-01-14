const chalk = require("chalk");

module.exports = {
    name: "ready",
    execute() {
        discordClient.user.setActivity(`;help | ${config.version}`, { type: "LISTENING" });
        console.log(chalk.green("Updated"));
    },
};
