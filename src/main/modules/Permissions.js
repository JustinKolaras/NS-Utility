/*global Util, config*/
/*eslint no-undef: "error"*/

class Permissions {
    validate(member) {
        const permissionsArr = config.permissions;
        let highestPerm;

        if (!permissionsArr) {
            throw new ReferenceError("Could not reference permissions array");
        }

        if (member.id === config.ownerId) {
            return 7;
        }

        for (const k in permissionsArr) {
            if (Util.hasRole(member, permissionsArr[k])) {
                highestPerm = k;
            }
        }

        return highestPerm === undefined ? -1 : parseInt(highestPerm);
    }
}

module.exports = new Permissions();
