"use strict";

const Handler = require("./modules/handler");
const log = require("./modules/logger");
const { Client, Intents } = require("discord.js");

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
    partials: ["MESSAGE"],
});

const {
    bot_token,
    bot_uid,
    request_channel,
    approval_channel,
    accepted_channel,
} = process.env;

const handler = new Handler(client, bot_token, bot_uid, request_channel, approval_channel, accepted_channel);

client.once("ready", async() => {
    log.done("Ready!");
    handler.fetchOldMessages();
});

client.on("messageCreate", message => handler.handleMessage(message));

client.on("interactionCreate", async interaction => handler.handleInteraction(interaction));

client.login(bot_token).catch(error => {
    log.error(error);
    process.exit(1);
});
