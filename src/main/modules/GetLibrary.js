class GetLibrary {
    get = (libraryName) => {
        try {
            const library = require(`../commands/${libraryName}`);
            return [true, library];
        } catch (err) {
            console.error(err);
            return [false, "Couldn't retrieve command library!\nThis command may not exist, or been archived/moved."];
        }
    };
}

module.exports = new GetLibrary();
