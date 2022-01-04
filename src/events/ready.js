module.exports = {
    name: "ready",
    execute() {
        discordClient.user.setActivity(`;help | ${config.version}`, { type: "LISTENING" });
        console.log("Updated");
    },
};
