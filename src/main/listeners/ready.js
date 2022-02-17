module.exports = {
    name: "ready",
    execType: "bind",
    execute() {
        discordClient.user.setActivity(`;help | ${config.version}`, { type: "LISTENING" });
        console.log("Updated");
    },
};
