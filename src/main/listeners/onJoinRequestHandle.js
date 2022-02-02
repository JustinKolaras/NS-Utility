const noblox = require("noblox.js");

module.exports = async (data) => {
    const database = mongoClient.db("main");
    const groupBans = database.collection("groupBans");

    const requesterId = data.requester.userId;
    console.log("Working with", requesterId);

    const isGroupBanned = await groupBans.findOne({ id: requesterId });

    if (!isGroupBanned) {
        console.log("Accepted");
        noblox.handleJoinRequest(config.group, requesterId, true).catch((err) => {
            console.error(err);
            Util.dmUser([config.ownerId], `I could not accept a join request from ID \`${requesterId}\`\n\`\`\`\n${err}\n\`\`\``);
        });
    }
};
