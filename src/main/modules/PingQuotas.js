/*global discordClient*/
/*eslint no-undef: "error"*/

class PingQuotas {
    #_pingInvocations = [];

    #_send = (options) => {
        const type = options.type;
        const member = options.member;

        const prefix = `@everyone, `;
        const messageToSend = `**Ping Quota Exceeded (${type}):** <@${member.id}> exceeded their ping quota.${
            type === "Banned" ? " They've been banned." : ""
        }`;

        Util.dmUsersIn(member.guild, "788877981874389014", `An important server action may need your attention.\n\n${messageToSend}`).catch(() => {});
        Util.getChannel(member.guild, "810717109427503174")?.send(prefix + messageToSend);
    };

    run = (options) => {
        const member = options.member;
        const mentions = options.mentions;

        if (member.id === discordClient.user.id) {
            return;
        }

        if (typeof this.#_pingInvocations[member.id] !== "number") {
            this.#_pingInvocations[member.id] = 0;
        }

        if (mentions.everyone || mentions.roles.size >= 1) {
            this.#_pingInvocations[member.id]++;

            setTimeout(() => {
                this.#_pingInvocations[member.id]--;
            }, 120000);

            switch (this.#_pingInvocations[member.id]) {
                case 2:
                    this.#_send({ type: "Warning", member: member });
                    member
                        .send(
                            "**You have exceeded your server-wide mass-ping quota.** Please wait at least four minutes before pinging again. **Do not ping!**"
                        )
                        .catch(() => {});
                    break;
                case 3:
                    this.#_send({ type: "Banned", member: member });
                    member.send("**You've been banned for exceeding your ping quota by two.**").catch(() => {});
                    member.ban({ reason: "Server-wide ping quota exceeded." }).catch(() => {});
                    this.#_pingInvocations[member.id] = null;
                    break;
            }
        }
    };
}

module.exports = new PingQuotas();
