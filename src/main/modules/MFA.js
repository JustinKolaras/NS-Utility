/*global mongoClient*/
/*eslint no-undef: "error"*/

class MFA {
    integrity = async (memberId) => {
        const database = mongoClient.db("main");
        const mfaAuthorizedUsers = database.collection("prm5>");
        const currentData = await mfaAuthorizedUsers.findOne({ user: memberId });
        return currentData && currentData.authorized === true;
    };
}

module.exports = new MFA();
