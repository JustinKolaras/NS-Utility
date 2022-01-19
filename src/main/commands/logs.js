const { MessageEmbed } = require("discord.js");

const noblox = require("noblox.js");
const Util = require("../externals/Util");

class Command {
    constructor(options) {
        for (const k in options) {
            this[k] = options[k];
        }
    }

    fn = async (Msg, Context) => {
        const args = Context.args;
        const errMessage = Util.makeError("There was an issue while trying to gather the logs of this user.", [
            "Your argument does not match a valid username.",
        ]);

        const database = mongoClient.db("main");
        const modLogs = database.collection("modLogs");

        let playerName = args[0];
        let playerId;
        let usingDiscord = false;

        // Discord Mention Support
        const attributes = await Util.getUserAttributes(Msg.guild, args[0]);
        if (attributes.success) {
            const rblxInfo = await Util.getRobloxAccount(attributes.id);
            if (rblxInfo.success) {
                usingDiscord = true;
                playerId = rblxInfo.response.robloxId;
            } else {
                return Msg.reply(`Could not get Roblox account via Discord syntax. Please provide a Roblox username.`);
            }
        }

        if (!playerName) {
            return Msg.reply("**Syntax Error:** `;logs <username | @user | userId>");
        }

        if (!usingDiscord) {
            try {
                playerId = await noblox.getIdFromUsername(playerName);
            } catch (err) {
                console.error(err);
                return Msg.reply(errMessage);
            }
        }

        try {
            playerName = await noblox.getUsernameFromId(playerId);
        } catch (err) {
            console.error(err);
            return Msg.reply(errMessage);
        }

        Msg.channel.send(`<@${Msg.author.id}>, :mag_right: Searching..`);

        const hasModLogs = await modLogs.findOne({ id: playerId });

        if (!hasModLogs) {
            return Msg.channel.send(`<@${Msg.author.id}>, All clean! :pray: :innocent: Looks like they have no moderation logs.`);
        }

        const modLogData = hasModLogs.data;

        const discordReadableData = [];
        for (const dataPiece of modLogData) {
            discordReadableData.push({
                name: dataPiece.head,
                value: dataPiece.body,
            });
        }

        let messageEmbed;
        try {
            messageEmbed = new MessageEmbed()
                .setColor("#2f3136")
                .addFields(...discordReadableData)
                .setTimestamp()
                .setFooter({ text: `Requested by ${Msg.member.user.tag}` });
        } catch (err) {
            console.error(err);
            return Msg.reply("There was an issue generating the embed.");
        }

        return Msg.channel.send({
            content: `<@${Msg.author.id}>, Moderation logs for **${playerName}**:`,
            embeds: [messageEmbed],
        });
    };
}

module.exports = {
    class: new Command({
        Name: "logs",
        Description: "Fetches NS Utility moderation logs on a user.",
        Usage: ";logs <username | @user | userId>",
        Permission: 5,
    }),
};
