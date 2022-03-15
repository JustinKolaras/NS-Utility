const uuid = require("uuid");

const database = mongoClient.db("main");
const epochClass = database.collection("epochClass");

module.exports = class EpochTime {
    async impl(plusMs) {
        if (typeof plusMs !== "number") throw new RangeError("Not a number!");

        const identifier = uuid.v4();
        await epochClass.insertOne({
            id: identifier,
            newDate: Date.now() + plusMs,
        });

        return identifier;
    }

    async stat(options) {
        if (!options?.id || !options?.scope) throw new RangeError("Invalid options.");

        const result = await epochClass.findOne({ id: identifier });
        if (!result) throw new Error("No result!");

        switch (options.scope) {
            case "g":
                return Date.now() > result.newDate;
            case "l":
                return Date.now() < result.newDate;
            case "g+e":
                return Date.now() >= result.newDate;
            case "l+e":
                return Date.now() <= result.newDate;
            default:
                throw new ReferenceError("Invalid scope.");
        }
    }
};
