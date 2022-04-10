module.exports = class MassGuildMemberRemove {
    #_users = 0;
    #_cooldown = false;
    #_limit = 6;
    #_period = 60 * 1000;
    #_cooldownPeriod = 500 * 1000;
    #_prefix = `@everyone, `;
    #_message = `**Member Remove Influx Warning:** Please check audit and <#788872173359071272> for more details.`;

    incr() {
        this.#_users++;

        setTimeout(() => {
            this.#_users--;
        }, this.#_period);

        if (this.#_users >= this.#_limit && !this.#_cooldown) {
            this.#_users = 0;
            this.#_cooldown = true;

            setTimeout(() => {
                this.#_cooldown = false;
            }, this.#_cooldownPeriod);

            return {
                broadcast: true,
                data: {
                    prefix: this.#_prefix,
                    message: this.#_message,
                },
            };
        }

        return {
            broadcast: false,
        };
    }
};
