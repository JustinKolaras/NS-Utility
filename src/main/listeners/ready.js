module.exports = {
    name: "ready",
    execType: "bind",
    execute() {
        discordClient.user.setActivity(`;help | ${Config.version}`, { type: "LISTENING" });
        console.log("Updated");
    },
};
