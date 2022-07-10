"use strict";

const path = require("node:path");
const { MessageButton, MessageActionRow } = require("discord.js");
const Store = require("./jsonStore");
const log = require("./logger");

/** @typedef {import('discord.js').Client} Client */
/** @typedef {import('discord.js').Message} Message */
/** @typedef {import('discord.js').Interaction} Interaction */
/** @typedef {import('discord.js').TextChannel} TextChannel */

/**
 * Main handler class
 *
 * @class Handler
 */
class Handler {
    /**
     * Creates an instance of Handler.
     *
     * @param {Client} client
     * @param {String} bot_token - Discord bot token.
     * @param {String} bot_uid - Discord User-ID of the bot.
     * @param {String} request_channel - ID of the channel to listen to.
     * @param {String} approval_channel - ID of the channel to mirror requests for approval.
     * @param {String} accepted_channel - ID of the channel to send messages to for final approval.
     * @public
     * @memberof Handler
     */
    constructor(
        client,
        bot_token = "",
        bot_uid = "",
        request_channel = "",
        approval_channel = "",
        accepted_channel = "",
    ){
        this.client = client;
        this.bot_token = bot_token;
        this.bot_uid = bot_uid;
        this.request_channel = request_channel;
        this.approval_channel = approval_channel;
        this.accepted_channel = accepted_channel;

        this.store = new Store(path.resolve(__dirname, "../data/store.json"));

        if (!this.#allValid(arguments)){
            log.error("One or more environment variables are missing or invalid");
            process.exit(1);
        }
    }

    /**
     * Validate environment variables
     *
     * @param {IArguments} args
     * @returns {Boolean}
     * @ignore
     * @memberof Handler
     */
    #allValid(args){
        return [...args].every(arg => !!arg);
    }

    /**
     * Check if a string contains an url
     *
     * @param {String} string
     * @returns {Boolean}
     * @ignore
     * @memberof Handler
     */
    #containsURL(string){
        const regex = new RegExp("^.*(https?:\\/\\/.+\\.\\S+)\\s?.*");
        return regex.test(string);
    }

    /**
     * Fetch old messages from a stored timestamp on
     *
     * @returns {Promise<any>}
     * @public
     * @memberof Handler
     */
    async fetchOldMessages(){
        const lastMessageTimestamp = await this.store.get("last_message");
        if (!lastMessageTimestamp) return log.warn("No last message timestamp stored. Skipping fetching old messages.");
        log.info(`Fetching old messages from timestamp ${lastMessageTimestamp} on...`);

        const channel = /** @type {TextChannel} */ (
            this.client.channels.cache.get(this.request_channel)
        );

        return channel?.messages.fetch({
            after: lastMessageTimestamp,
            limit: 100,
        }).then(messages => {
            const msgArray = Array.from(messages);
            if (msgArray.length === 0) return log.done("Nothing to fetch!");
            log.done(`Fetched ${msgArray.length} message${msgArray.length > 1 ? "s" : ""}!`);
            return msgArray.reverse().forEach(message => this.handleMessage(message[1]));
        }).catch(console.error);
    }

    /**
     * Handle a message
     *
     * @param {Message} message
     * @public
     * @memberof Handler
     */
    async handleMessage(message){
        if (message.channelId === this.request_channel && message.author.id !== this.bot_uid){
            if (this.#containsURL(message.content) || message.attachments.size > 0){
                // Post to hidden vote channel
                this.messageToApproval(message)
                    .then(() => message.delete().catch(console.error));
            }
            else message.delete().catch(console.error);

            const { createdTimestamp } = message;

            // Save last audited message to store
            log.done(`Handled message. New timestamp is ${createdTimestamp}`);
            await this.store.set("last_message", String(createdTimestamp));
        }
    }

    /**
     * Handle an approval / rejection interaction
     *
     * @param {Interaction} interaction
     * @returns {Promise<any>}
     * @memberof Handler
     */
    async handleInteraction(interaction){
        if ((interaction.channelId !== this.approval_channel
            && interaction.channelId !== this.accepted_channel)
            || !interaction.isButton()) return;

        if (interaction.customId === "approve"){
            // approved
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId("watched")
                        .setLabel("Watched")
                        .setStyle("PRIMARY"),
                );

            const files = [];
            interaction.message.attachments.forEach(attachment => files.push(attachment.url));

            const channel = /** @type {TextChannel} */ (
                this.client.channels.cache.get(this.accepted_channel)
            );

            await channel?.send({
                content: interaction.message.content,
                files,
                components: [row],
            }).catch(console.error);

            /** @type {Message} */ (interaction.message)
                ?.delete().catch(console.error);
        }

        else if (interaction.customId === "deny" || interaction.customId === "watched"){
            /** @type {Message} */ (interaction.message)
                ?.delete().catch(console.error);
        }
    }

    /**
     * Send a message to the approval channel
     *
     * @param {Message} message
     * @returns {Promise<void | Message>}
     * @public
     * @memberof Handler
     */
    async messageToApproval(message){
        const row = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId("approve")
                .setLabel("Approve")
                .setStyle("SUCCESS"),
            new MessageButton()
                .setCustomId("deny")
                .setLabel("Deny")
                .setStyle("DANGER"),
        );

        const files = [];
        message.attachments.forEach(attachment => files.push(attachment.url));

        const channel = /** @type {TextChannel} */ (
            this.client.channels.cache.get(this.approval_channel)
        );

        return await channel?.send({
            content: `Media request from ${message.author}:\n\n${message.content}`,
            files,
            components: [row],
        }).catch(console.error);
    }
}

module.exports = Handler;
