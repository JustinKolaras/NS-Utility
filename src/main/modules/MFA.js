/*global mongoClient*/
/*eslint no-undef: "error"*/

const database = mongoClient.db("main");
const mfaAuthorizedUsers = database.collection("perm5");
class MFA {
    integrity = async (memberId) => {
        const currentData = await mfaAuthorizedUsers.findOne({ user: memberId });
        return currentData && currentData.authorized === true;
    };
}

module.exports = new MFA();
