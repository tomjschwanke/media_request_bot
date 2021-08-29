const {Client, Intents, MessageActionRow, MessageButton} = require('discord.js');
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES], partials: ['MESSAGE']});

const bot_token = process.env['bot_token'];
const bot_uid = process.env['bot_uid'];

const request_channel = process.env['request_channel'];
const approval_channel = process.env['approval_channel'];
const accepted_channel = process.env['accepted_channel'];

client.once('ready', async () => {
    console.log('Ready!');
    fetchOldMessages();
    /*while(await channelContainsMessages(request_channel)) {
        fetchOldMessages();
    }*/
});

client.on('messageCreate', message => {
    handleMessage(message);
})

function fetchOldMessages() {
    //TODO: make promise based
    client.channels.cache.get(request_channel).messages.fetch({limit: 100})
        .then(messages => {
            Array.from(messages).reverse().forEach(message => {
                handleMessage(message[1]);
            })
        })
        .catch(console.error);
}

async function channelContainsMessages(channel) {
    const messages = await client.channels.cache.get(channel).messages.fetch({limit: 1})
    return messages.size === 1;
}

function handleMessage(message) {
    //TODO: make promise based
    if (message.channelId === request_channel && message.author.id !== bot_uid) {
        if (containsURL(message.content) || message.attachments.size > 0) {
            // Post to hidden vote channel
            messageToApproval(message)
                .then(message.delete().catch(console.error));
        } else {
            message.delete().catch(console.error);
        }
    }
}

async function messageToApproval(message) {
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('approve')
                .setLabel('Approve')
                .setStyle('SUCCESS'),
            new MessageButton()
                .setCustomId('deny')
                .setLabel('Deny')
                .setStyle('DANGER'),
        );
    let files = [];
    message.attachments.forEach(attachment => files.push(attachment.url));
    await client.channels.cache.get(approval_channel).send({
        content: `Media request from ${message.author}:\n\n${message.content}`,
        files: files,
        components: [row]
    }).catch(console.error);
}

client.on('interactionCreate', async interaction => {
    if ((interaction.channelId !== approval_channel && interaction.channelId !== accepted_channel) || !interaction.isButton()) return;
    if (interaction.customId === 'approve') {
        // approved
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('watched')
                    .setLabel('Watched')
                    .setStyle('PRIMARY'),
            );
        let files = [];
        interaction.message.attachments.forEach(attachment => files.push(attachment.url));
        await client.channels.cache.get(accepted_channel).send({
            content: interaction.message.content,
            files: files,
            components: [row]
        }).catch(console.error);
        interaction.message.delete().catch(console.error);
    } else if (interaction.customId === 'deny' || interaction.customId === 'watched') {
        // delete message if denied or watched
        interaction.message.delete().catch(console.error);
    }
})

client.login(bot_token)
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

function containsURL(string) {
    const regex = new RegExp("^.*(https?:\\/\\/.+\\.\\S+)\\s?.*");
    return regex.test(string);
}