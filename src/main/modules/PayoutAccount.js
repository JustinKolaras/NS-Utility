const database = mongoClient.db("main");
const payoutAccounts = database.collection("payoutAccounts");

module.exports = class PayoutAccount {
    add(memberId, payoutAccountData) {
        return payoutAccounts.updateOne({ id: memberId }, { $set: { payoutAccountData } }, { upsert: true });
    }

    get(memberId) {
        return payoutAccounts.findOne({ id: memberId });
    }

    remove(memberId) {
        return payoutAccounts.deleteOne({ id: memberId });
    }
};
