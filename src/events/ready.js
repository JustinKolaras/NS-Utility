// const config = require("../config.json");

module.exports = {
    name: "ready",
    execute(client) {
        client.user.setActivity(`;help | ${config.version}`, { type: "LISTENING" });
        console.log("Updated");
    },
};
