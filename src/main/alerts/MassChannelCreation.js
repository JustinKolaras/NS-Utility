class MassChannelCreation {
    #_channels = 0;
    #_cooldown = false;
    #_limit = 4;
    #_period = 60 * 1000;
    #_cooldownPeriod = 500 * 1000;
    #_prefix = `@everyone, `;
    #_message = `**Mass Channel Deletion Alert:** Please check audit and <#788872173359071272> for more details.`;

    incr() {
        this.#_channels++;

        setTimeout(() => {
            this.#_channels--;
        }, this.#_period);

        if (this.#_channels >= this.#_limit && !this.#_cooldown) {
            this.#_channels = 0;
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
}

module.exports = new MassChannelCreation();
