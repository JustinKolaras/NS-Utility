/*global mongoClient, discordClient*/
/*eslint no-undef: "error"*/

const fs = require("fs");

module.exports = async () => {
    // Connect to MongoDB
    await mongoClient.connect();
    console.log("MongoDB - Successful connection");

    // Register Events
    const eventFiles = fs.readdirSync("./src/main/listeners/").filter((file) => file.endsWith(".js"));
    for (const file of eventFiles) {
        const event = require(`../listeners/${file}`);
        if (event.execType === "auto") {
            event.execute();
        } else if (event.execType === "bind") {
            if (event.once) {
                discordClient.once(event.name, (...args) => event.execute(...args));
            } else {
                discordClient.on(event.name, (...args) => event.execute(...args));
            }
        }
    }
    console.log("Events Registered");
};
