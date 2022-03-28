const uuid = require("uuid");

const database = mongoClient.db("main");
const epochClass = database.collection("epochClass");

// Not done
module.exports = class EpochTime {
    async impl(options) {
        const identifier = uuid.v4();

        await epochClass.insertOne({
            id: identifier,
            newDate: Date.now() + options.plusMs,
            linker: options.linker,
        });

        return identifier;
    }

    async stat(options) {
        const result = await epochClass.findOne({ id: options.id });
        if (!result) return false;

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
                throw new ReferenceError("Invalid scope!");
        }
    }

    async getId(options) {
        const result = await epochClass.findOne({ linker: options.linker });
        if (!result) return false;
        return result.id;
    }
};
