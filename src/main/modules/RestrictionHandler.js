class RestrictionHandler {
    validate(options) {
        const classInstance = options.class;
        const message = options.message;
        if (classInstance.Restriction) {
            const restrictionObject = classInstance.Restriction;

            if (restrictionObject.byChannel) {
                const whitelistedChannels = restrictionObject.byChannel?.whitelisted;
                const errorMessage = restrictionObject.byChannel?.errorMessage;

                if (!whitelistedChannels || !errorMessage) {
                    return {
                        success: false,
                        message: `Improper restriction form.\n\`\`\`\nwhitelistedChannels: ${whitelistedChannels.toString()}\nerrorMessage: ${errorMessage.toString()}\n\`\`\``,
                    };
                }

                let isValidChannel = false;
                for (const channelId in whitelistedChannels) {
                    if (message.channel.id === channelId) isValidChannel = true;
                }

                if (!isValidChannel) {
                    return { success: false, message: errorMessage };
                }
            }

            if (restrictionObject.byCategory) {
                const whitelistedCategories = restrictionObject.byCategory?.whitelisted;
                const errorMessage = restrictionObject.byCategory?.errorMessage;

                if (!whitelistedCategories || !errorMessage) {
                    return {
                        success: false,
                        message: `Improper restriction form.\n\`\`\`\nwhitelistedCategories: ${whitelistedCategories.toString()}\nerrorMessage: ${errorMessage.toString()}\n\`\`\``,
                    };
                }

                let isValidCategory = false;
                for (const categoryId of whitelistedCategories) {
                    if (message.channel.parent.id === categoryId) isValidCategory = true;
                }

                if (!isValidCategory) {
                    return { success: false, message: errorMessage };
                }
            }
        }
        return { success: true };
    }
}

module.exports = new RestrictionHandler();
