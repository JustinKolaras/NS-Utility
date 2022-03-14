module.exports = class ArgumentSyntaxBuilder {
    #build = "";
    #defPrefix = null;
    #append(input) {
        if (!this.#build) {
            this.#build = input;
        } else {
            this.#build = `${this.#build} ${input}`;
        }
    }

    constructor(options) {
        this.#defPrefix = options?.defaultPrefix || null;
    }

    classifyCommand(inputOptions) {
        const prefixToUse = inputOptions.prefix || this.#defPrefix || null;
        if (prefixToUse && inputOptions.name) {
            this.#append(`${prefixToUse}${inputOptions.name}`);
            return this;
        }
        throw new Error("SyntaxBuilder::classifyCommand: Invalid input options");
    }

    makeRegular(input, options) {
        if (typeof input !== "string") {
            throw new Error("SyntaxBuilder::makeRegular: Not a string");
        }

        const title = options?.title;
        if (title && typeof title !== "string") {
            throw new Error("SyntaxBuilder::makeRegular: Title not a string");
        }

        const inf = options?.inf;

        if (!options?.optional) {
            this.#append(`<${title ? `${title}: ` : ""}${input}${inf ? "..." : ""}>`);
        } else {
            this.#append(`<?${title ? `${title}: ` : ""}${input}${inf ? "..." : ""}>`);
        }

        return this;
    }

    makeChoice(inputs, options) {
        if (!Array.isArray(inputs)) {
            throw new Error("SyntaxBuilder::makeChoice: Not an array");
        }

        const def = options?.default;
        if (def && inputs.indexOf(def) === -1) {
            throw new Error("SyntaxBuilder::makeChoice: Default input not found");
        }

        if (options?.exactify) {
            inputs = inputs.map((el) => `"${el}"`);
        }

        const title = options?.title;
        if (title && typeof title !== "string") {
            throw new Error("SyntaxBuilder::makeRegular: Title not a string");
        }

        const inf = options?.inf;
        const splitString = inputs.join(" | ");

        if (!options?.optional) {
            this.#append(`<${title ? `${title}: ` : ""}${splitString}${def ? ` def = "${def}"` : ""}${inf ? "..." : ""}>`);
        } else {
            this.#append(`<?${title ? `${title}: ` : ""}${splitString}${def ? ` def = "${def}"` : ""}${inf ? "..." : ""}>`);
        }

        return this;
    }

    endBuild() {
        if (!this.#build) {
            throw new Error("SyntaxBuilder::endBuild: No build started");
        }

        const oldBuild = this.#build;
        this.#build = "";
        return oldBuild;
    }
}