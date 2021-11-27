module.exports = {
    name: "ready",
    execute(client) {
        client.user.setActivity(";help", { type: "LISTENING" });
        console.log("Updated");
    },
};
