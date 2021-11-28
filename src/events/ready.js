module.exports = {
    name: "ready",
    execute(client) {
        client.user.setActivity("The Aerocast", { type: "LISTENING" });
        console.log("Updated");
    },
};
